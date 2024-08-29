import csv from 'csv-parser'
import { Readable, Transform, Writable } from 'stream';
import { dbPool } from '../../BD/BDConect.js';
import fastCsv from 'fast-csv'


async function processAndInsertCSV({ file, client, dataFields, id_column, id_responsible }) {

  return new Promise((resolve, reject) => {

    let batchCount = 0
    const rows = [];
    const rowsError = [];
    // Ler e processar o CSV original
    Readable.from(file.buffer)
      .pipe(fastCsv.parse({ headers: true }))
      .on('data', (row) => {
        // Renomear e remover colunas conforme necessário
        let processedRow = {};
        if (row[dataFields.name]) {
          processedRow['name'] = row[dataFields.name];
        }
        if (!row[dataFields.name]) {
          processedRow['name'] = 'Sem nome'
        }
        if (row[dataFields.email]) {
          processedRow['email'] = row[dataFields.email];
        }
        if (row[dataFields.phone]) {
          processedRow['phone'] = row[dataFields.phone];
        }

        // Validações
        const rgxPhone = /^(?:(?:\+?55\s?)?^\(?\d{2}\)?)?(?:9\d{4}-?\d{4}|\d{4}-?\d{4})$/;
        const invalidLead = (() => {
          if (!processedRow['email'].match(/@.*/))
            return 'Email invalido'
          if (!rgxPhone.test(processedRow['phone'].replace(/\D/g, '')))
            return 'Telefone invalido'

          return false
        })()

        if (invalidLead) {
          processedRow['reason'] = invalidLead
          rowsError.push(processedRow)
          return;
        }

        rows.push(processedRow);
        return
      })
      .on('end', async () => {
        try {
          await client.query('BEGIN');

          do {
            await insertBatch({
              client,
              batch: rows.slice(batchCount, batchCount + 5000),
              id_column,
              id_responsible
            })
            batchCount += 5000
          } while (batchCount < rows.length)

          await client.query('COMMIT');
          resolve({ rows, rowsError });
        } catch (error) {
          await client.query('ROLLBACK');
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function insertBatch({ client, batch, id_column, id_responsible }) {
  const qLead = `
  INSERT INTO meulead_leads (name, email, phone)
  VALUES
  ${batch
      .map((row) =>
        `('${row.name}', '${row.email}', '${row.phone}')`)
      .join(', ')}
      RETURNING id
  `;

  const dataLead = await client.query(qLead);

  const qColumn = `
  INSERT INTO meulead_cards (id_lead, id_column, id_responsible)
  VALUES
    ${batch
      .map((_, i) =>
        `('${dataLead.rows[i].id}', '${id_column}', '${id_responsible}')`)
      .join(', ')}
  `;

  const dataColumn = await client.query(qColumn);

  if (dataColumn.rowCount == dataLead.rowCount)
    return dataLead.rowCount

  throw new Error('Erro durante o processamento de leads e cards')
}


export class LeadImportController {
  async bulkImportReadFileHeader(req, res) {
    const file = req.file;

    const headers = [];
    const readableStream = Readable.from(file.buffer)
      .pipe(csv())
      .on('headers', (headerList) => {
        headers.push(...headerList);
        readableStream.destroy();
      })
      .on('close', () => {
        return res.status(200).json(headers);
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      });
  }

  async bulkImportReadFileBody(req, res) {
    const file = req.file;
    const { name, email, phone, custom_field_1, custom_field_2, custom_field_3 } = JSON.parse(req.body.fields)

    const allLeads = []
    const readableStream = Readable.from(file.buffer)
    const transformStreamToObect = csv({ separator: ',' })
    const transformStreamToString = new Transform({
      objectMode: true, transform(chunk, encoding, callback) {
        callback(null, JSON.stringify(chunk))
      }
    })

    const writableStream = new Writable({
      write(chunk, _, callback) {
        const string = chunk.toString()
        const data = JSON.parse(string)
        allLeads.push({
          name: data[name] ? data[name] : null,
          email: data[email] ? data[email] : null,
          phone: data[phone] ? data[phone] : null,
          custom_field_1: data[custom_field_1] ? data[custom_field_1] : null,
          custom_field_2: data[custom_field_2] ? data[custom_field_2] : null,
          custom_field_3: data[custom_field_3] ? data[custom_field_3] : null,
        })
        callback()
      }
    })

    readableStream
      .pipe(transformStreamToObect)
      .pipe(transformStreamToString)
      .pipe(writableStream)
      .on('close', () => {
        return res.status(200).json(allLeads);
      })
      .on('error', (error) => {
        return res.status(500).json({ error: 'Erro interno ao carregar arquivo', errorDetails: error });
      });
  }

  async bulkImportInsertBD(req, res) {
    const file = req.file;
    const { id_column, id_responsible } = JSON.parse(req.body.pipeline)
    const dataFields = JSON.parse(req.body.fields)
    // dataFields contem name, email, phone, custom_field_1, custom_field_2, custom_field_3

    const client = await dbPool.connect();
    try {
      const { rows, rowsError }
        = await processAndInsertCSV({ file, client, dataFields, id_column, id_responsible });
      return res.status(200).json({
        message: 'CSV processado e inserido com sucesso!',
        leadsCount: rows.length,
        leadsNotEntered: rowsError
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro durante o processamento e inserção do CSV', errorDetails: error });
    } finally {
      await client.release();
    }
  }

  async unitImport(req, res) { }

}