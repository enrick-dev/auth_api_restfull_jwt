import { dbPool } from "../../BD/BDConect.js";

import fs from 'fs/promises';
import path from 'path'

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import QueryStream from "pg-query-stream";
import { pipeline, Writable } from "stream";

import multer from "multer"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class LeadsController {

    async getAllLeads(req, res) {
        const { id_client } = req.query

        const q = `
            SELECT name, email, phone 
            FROM meulead_leads 
            WHERE id_client = ${id_client}
        `;

        const allLeads = []
        const queryStream = new QueryStream(q);
        const writableStream = new Writable({
            objectMode: true,
            write(row, _, callback) {
                allLeads.push(row)
                callback();
            }
        });

        const client = await dbPool.connect()
        pipeline(
            client.query(queryStream),
            writableStream,
            (err) => {
                if (err) {
                    console.error('Erro na pipeline:', err);
                } else {
                    return res.status(200).json(allLeads)
                }
                client.end();
            }
        );
    }


    async saveLead(req, res) {
        const data = req.body
        const { name, email } = data
        const q = `
        INSERT INTO public.meulead_leads(name, email)
        VALUES ($1, $2);
        `

        if (!name || !email) return res.status(400).json({ message: "Dados são obrigatórios" });

        const client = await dbPool.connect()
        try {
            const { rowCount } = await client.query(q, [name, email])
            if (!rowCount) return res.status(400).json({ message: "Erro ao pegar dados" })
            return res.status(200).json({ message: "Dados do lead armazenados" })
        } catch (err) {
            return res.json({ error: res.__('erro interno ao processar requisição'), errorDetails: err })

        } finally {
            client.release()
        }
    }

    async saveLeadPipeline(req, res) {
        const data = req.body
        const { id_client, id_pipeline, id_column, id_responsible } = req.query
        const { name, email, phone, lead_source, additional_fields, id_source, source, utm, device } = data

        // insere o lead no banco de dados
        const q = `
        INSERT INTO public.meulead_leads(name, email, phone, lead_source, id_client, additional_fields, id_source, source, utm, device)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
        `
        if (id_pipeline && !id_column) return res.status(400).json({ message: "Dados da pipeline são obrigatórios" })

        // valida id_coluna com id_pipeline
        const qColumn = `
        SELECT id
        FROM public.meulead_columns
        WHERE id_pipeline = $1 AND id = $2;
        `
        // criar card
        const qCard = `
        INSERT INTO public.meulead_cards(id_lead, id_column, id_responsible)
        VALUES ($1, $2, $3)
        `

        if (!id_client) return res.status(400).json({ error: "Dados do cliente são obrigatórios" });
        if (!name) return res.status(400).json({ error: "Nome é obrigatório" });
        if (!email) return res.status(400).json({ error: "Email é obrigatório" });
        if (!phone) return res.status(400).json({ error: "Telefone é obrigatório" });
        if (!lead_source) return res.status(400).json({ error: "Origem do lead é obrigatório" });

        const client = await dbPool.connect()
        try {
            const { rowCount, rows } = await client.query(q, [name, email, phone, lead_source, id_client, {additional_fields} || null, id_source || null, source || null, utm || null, device || null])
            // console.log(rowCount, rows)
            if (!rowCount) return res.status(400).json({ message: "Erro ao cadastrar lead no banco de dados" })
            const id_lead = rows[0].id

            if (id_pipeline) {
                const { rowCount } = await client.query(qColumn, [id_pipeline, id_column])
                if (!rowCount) return res.status(400).json({ message: "Erro ao procurar coluna na pipeline" })

                const { rowCount: data } = await client.query(qCard, [id_lead, id_column, id_responsible || null])
                if (!data) return res.status(400).json({ message: "Erro ao cadastrar lead na pipeline" })
            }

            return res.status(200).json({ message: id_pipeline ? "Lead criado e vinculado em uma pipeline com sucesso" : "Lead cadastrado com sucesso" })
        } catch (err) {
            return res.json({ error: res.__('erro interno ao processar requisição'), errorDetails: err })

        } finally {
            client.release()
        }
    }


    async scriptDataLead(req, res) {
        try {
            const scriptPath = path.join(__dirname, '..', '..', 'importScripts', 'lead.js');

            const data = await fs.readFile(scriptPath, 'utf8');

            res.setHeader('Content-Type', 'application/javascript');
            res.send(data);
        } catch (err) {
            console.error('Erro ao ler o script:', err);
            res.status(500).send('Erro ao carregar o script.');
        }
    }

    async allLeads(req, res) {
        const data = req.query
        const { id_client } = data
        const q = `
        SELECT name, email, whatsapp, state, lead_source, id, created_at as date
        FROM meulead_leads
        WHERE id_client = $1
        `

        if (!id_client) return res.status(400).json({ message: "Dado do cliente é obrigatório" });

        const client = await dbPool.connect()
        try {
            const data = await client.query(q, [id_client])
            if (!data) return res.status(400).json({ message: "Não existem leads cadastrados" });
            return res.status(200).json(data.rows)
        } catch (err) {
            return res.json({ error: res.__('erro interno ao processar requisição'), errorDetails: err })

        } finally {
            client.release()
        }
    }

    async uploadAttachments(req, res) {
        const file = req.file;
        // passar parametros do cliente e lead

        try {
          if (!file) return res.status(400).json({ message: "Nenhum arquivo foi enviado." });
    
          return res.status(200).json({
            message: "Arquivo enviado com sucesso!",
            file: {
              originalname: file.originalname,
              mimetype: file.mimetype,
              path: file.path,
              size: file.size,
            },
          });
        } catch (error) {
          return res.status(500).json({ message: "Erro ao processar o upload.", error: error.message });
        }
      }

      async inicial(req, res) {
        const file = req.file;
    
        // quando for salvar no banco dados do anexo
        const { id_lead, url_attachment } = req.body;
        const q = `
            INSERT INTO meulead_attachment (id_lead, url_attachment) 
            VALUES ($1, $2) 
            `
    
        if (!file || !file.length) return res.status(400).json({ error: 'nenhum arquivo enviado' })
    
        // valida se o arquivo enviado é uma imagem
        const isValidImages = file.every((f) => f.mimetype.startsWith('image/'));
        if (!isValidImages) return res.status(400).json({ error: 'Formato de arquivo inválido' });
    
        const storage = multer.diskStorage({
          destination: function (req, file, cb) {
            cb(null, 'uploadsTeste/');
          },
          filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname));
          }
        });
        
        const fileFilter = (req, file, cb) => {
          const filetypes = /jpeg|jpg|png|pdf|docx|xlsx|csv|pptx|mp3|ogg/;
          const mimetype = filetypes.test(file.mimetype);
          const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
          if (mimetype && extname) {
            return cb(null, true);
          } else {
            cb(new Error('Tipo de arquivo não suportado!'));
          }
        };
        
        const upload = multer({
          storage: storage,
          fileFilter: fileFilter,
          limits: { fileSize: 25 * 1024 * 1024 } // Limite de 25MB por arquivo
        });
    
    
    
    
    
    
        const client = await dbPool.connect()
        try {
          const mediaLinks = await Promise.all(promises);
          const data = await client.query(q, [id_lead, url_attachment])
          if (data.rowCount) return res.status(200).json({ message: 'Arquivos enviados com sucesso', media: mediaLinks });
        } catch (err) {
          return res.status(500).json({ error: 'erro interno ao processar requisição', errorDetails: err });
        } finally {
          client.release();
        }
      }
}



