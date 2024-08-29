
import axios from "axios";
import { meuLeadBucket } from "../../middlewares/bucket/upload.js";
import { dbPool } from "../../BD/BDConect.js";

export class WhitelabelController {
  async getWhitelabel(req, res) {
    const { subdomain } = req.query
    const q = `
    SELECT meulead_whitelabel.vertical_logo, meulead_whitelabel.horizontal_logo, meulead_whitelabel.style
    FROM meulead_whitelabel
    INNER JOIN users ON meulead_whitelabel.id_client = users.id
    WHERE users.subdomain = $1`
    let bodyResponse = {
      style: {
        primaryColor: "#94948d",
        secondaryColor: "",
        saturation: 0,
        lightness: 15
      },
    }

    const client = await dbPool.connect()
    try {
      const data = await client.query(q, [subdomain])
      if (data.rowCount) {
        const { vertical_logo, horizontal_logo, style } = data.rows[0]
        bodyResponse = {
          logoV: vertical_logo,
          logoH: horizontal_logo,
          style: style || null,
        }
      }
      return res.status(200).json(bodyResponse)
    } catch (err) {
      if (err) return res.status(500).json({ error: res.__('erro interno ao processar requisição'), errorDetails: err })
    } finally {
      client.release()
    }
  }

  async uploadLogoV(req, res) {
    const files = req.files;
    const { id_client, subdomain } = req.body;
    const q = `
    INSERT INTO meulead_whitelabel (id_client, vertical_logo) 
    VALUES ($1, $2) 
    ON CONFLICT (id_client) 
    DO UPDATE SET vertical_logo = EXCLUDED.vertical_logo`

    if (!files || !files.length) return res.status(400).json({ error: 'nenhum arquivo enviado' })

    // valida se o arquivo enviado é uma imagem
    const isValidImages = files.every((file) => file.mimetype.startsWith('image/'));
    if (!isValidImages) return res.status(400).json({ error: 'Um ou mais arquivos enviados não são imagens válidas' });

    // troca o nome da imagem
    const logosName = ["light.", "dark."]
    let newLogoName = ""
    files.forEach((img, i) => {
      img.originalname = logosName[i] + img.mimetype.replace("image/", "")
      newLogoName += img.originalname + ","
    });

    const dirRoute = `accounts/${subdomain}/logos/vertical/`;
    const promises = files.map(async (file) => {
      const filePath = `${dirRoute}${file.originalname}`;
      const blob = meuLeadBucket.file(filePath);
      const blobStream = blob.createWriteStream();

      return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
          reject(err);
        });

        blobStream.on('finish', (err) => {
          if (err) reject('Erro interno ao salvar imagem');
          resolve(blob.metadata.mediaLink);
        });

        blobStream.end(file.buffer);
      });
    });

    const client = await dbPool.connect()
    try {
      const mediaLinks = await Promise.all(promises);
      const data = await client.query(q, [id_client, newLogoName])
      if (data.rowCount) return res.status(200).json({ message: 'Arquivos enviados com sucesso', media: mediaLinks });
    } catch (err) {
      return res.status(500).json({ error: 'erro interno ao processar requisição', errorDetails: err });
    } finally {
      client.release();
    }
  }

  async uploadLogoH(req, res) {
    const files = req.files;
    const { id_client, subdomain } = req.body;
    const q = `
    INSERT INTO meulead_whitelabel (id_client, vertical_logo) 
    VALUES ($1, $2) 
    ON CONFLICT (id_client) 
    DO UPDATE SET vertical_logo = EXCLUDED.vertical_logo`

    if (!files || !files.length) return res.status(400).json({ error: 'nenhum arquivo enviado' })

    // valida se o arquivo enviado é uma imagem
    const isValidImages = files.every((file) => file.mimetype.startsWith('image/'));

    if (!isValidImages) {
      return res.status(400).json({ error: 'Um ou mais arquivos enviados não são imagens válidas' });
    }

    // troca o nome da imagem
    const logosName = ["light.", "dark."]
    let newLogoName = ""

    files.forEach((img, i) => {
      img.originalname = logosName[i] + img.mimetype.replace("image/", "")
      newLogoName += img.originalname + ", "
    });

    let dirRoute = `accounts/${subdomain}/logos/horizontal/`;

    const promises = files.map(async (file) => {
      const filePath = `${dirRoute}${file.originalname}`;
      const blob = meuLeadBucket.file(filePath);
      const blobStream = blob.createWriteStream();

      return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
          reject(err);
        });

        blobStream.on('finish', (err) => {
          if (err) reject('Erro interno ao salvar imagem');
          resolve(blob.metadata.mediaLink);
        });

        blobStream.end(file.buffer);
      });
    });

    const client = await dbPool.connect()
    try {
      const mediaLinks = await Promise.all(promises);
      const data = await client.query(q, [id_client, newLogoName])
      if (data.rowCount) return res.status(200).json({ message: 'Arquivos enviados com sucesso', media: mediaLinks });
    } catch (err) {
      return res.status(500).json({ error: 'erro interno ao processar requisição', errorDetails: err });
    } finally {
      client.release();
    }
  }

  async uploadStyle(req, res) {
    const { id_client, style } = req.body
    const q = `
    INSERT INTO meulead_whitelabel (id_client, style) 
    VALUES ($1, $2) 
    ON CONFLICT (id_client) 
    DO UPDATE SET style = EXCLUDED.style`

    if (!style.primaryColor) return res.status(400).json({ error: 'dados de estilo inválidos' });

    const client = await dbPool.connect()
    try {
      const data = await client.query(q, [id_client, style])
      if (data.rowCount) return res.status(200).json({ message: "cores personalizadas salvas" })
    } catch (err) {
      return res.status(500).json({ error: 'erro interno ao processar requisição', errorDetails: err });
    } finally {
      client.release();
    }
  }


  //rota de teste
  async createSubdomain(req, res) {
    const { subdomain } = req.body
    const apiKey = process.env.API_KEY_GODADDY;
    const apiSecret = process.env.API_SECRET_GODADDY;
    const domain = process.env.DOMAIN;
    const ip = process.env.IP_SERVER_RENDER; // IP do servidor ao qual o subdomínio deve apontar

    const url = `https://api.godaddy.com/v1/domains/${domain}/records`;

    const headers = {
      Authorization: `sso-key ${apiKey}:${apiSecret}`,
      'Content-Type': 'application/json'
    };

    const data = [
      {
        "type": "A",
        "name": subdomain,
        "data": ip,
        "ttl": 600
      }
    ];

    axios.patch(url, data, { headers: headers })
      .then(response => {
        createSubdomainRender()
      })
      .catch(error => {
        return res.json({ 'Erro ao criar subdomínio na godaddy:': error.response.data });
      });


    const createSubdomainRender = () => {
      const apiKeyRender = process.env.API_KEY_RENDER
      const urlReender = `https://api.render.com/v1/services/${process.env.PROJECT_ID_RENDER_MM_REACT}/custom-domains`
      const dataRender = { name: `${subdomain}.${domain}` }
      axios.post(urlReender, dataRender, { headers: { 'Authorization': `Bearer ${apiKeyRender}` } })
        .then(response => {
          return res.json({ 'Subdomínio criado com sucesso:': response.data });
        })
        .catch(error => {
          return res.json({ 'Erro ao criar subdomínio no render:': error.response.data });
        });
    }
  }
}