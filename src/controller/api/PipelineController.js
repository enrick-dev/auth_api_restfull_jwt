import { dbPool } from '../../BD/BDConect.js'
import { Lead } from './functions/LeadFunctions.js'

export class PipelineController {
  async getPipeline(req, res) {
    const { id_client, id_user } = req.query

    const qUser = `
      SELECT id,type FROM meulead_users
      WHERE id = $1
    `
    const q2 = `
    SELECT id, name, responsibles
    FROM meulead_pipelines
    WHERE id_client = $1
    ORDER BY id ASC 
    `
    if (!id_client || !id_user)
      return res.status(400).json({ error: 'Base Data not Provided' })

    const client = await dbPool.connect()
    try {
      const { rows: rowsUser } = await client.query(qUser, [id_user])
      const { rows: rowsPipelines, rowCount: rowCountPipelines } = await client.query(q2, [id_client])
      if (rowCountPipelines) {
        const allowedPipelines = rowsPipelines
          .filter(row => rowsUser[0].type >= 2 ? row.responsibles.includes(id_user) : row)
          .map(row => ({
            value: row.id,
            label: row.name,
            responsibles: row.responsibles
          }))
        return res.status(200).json(allowedPipelines)
      }
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err
      })
    } finally {
      client.release()
    }
  }
  async getColumns(req, res) {
    const { id_pipeline } = req.params
    const q = `
      SELECT id, name, stage
        FROM public.meulead_columns
        WHERE status = 1 AND id_pipeline = $1
    `
    if (!id_pipeline)
      return res.status(400).json({ error: 'Base Data not Provided' })

    const client = await dbPool.connect()
    try {
      const { rows, rowCount } = await client.query(q, [id_pipeline])
      if (rowCount) return res.status(200).json(rows)
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err
      })
    } finally {
      client.release()
    }
  }

  async createPipeline(req, res) {
    const { id_client, name, responsibles, columns } = req.body

    if (!name) return res.status(400).json({ error: 'Insira um nome' })
    if (!responsibles || responsibles == '') return res.status(400).json({ error: 'Insira um responsável' })
    if (columns == '') return res.status(400).json({ error: 'Crie pelo menos 1 etapa no funil' })

    const qValidateName = `
      SELECT name FROM meulead_pipelines
      WHERE name = $1
    `

    const q = `
      INSERT INTO 
        meulead_pipelines(id_client, name, responsibles)
      VALUES ($1, $2, $3)
      RETURNING id
    `

    const client = await dbPool.connect()
    try {
      const { rowCount: rowCountName } = await client.query(qValidateName, [name])
      if (rowCountName) return res.status(400).json({ error: 'Ja existe uma pipeline com esse nome' })

      const { rows: rowsPipeline, rowCount: rowCountPipeline } = await client.query(q, [id_client, name, responsibles])
      if (!rowCountPipeline) return res.status(400).json({ error: 'Erro ao salvar' })
      const q2 = `
      INSERT INTO meulead_columns (id_pipeline, name, stage, position, isblocked)
      VALUES
      ${columns
          .map((column, i) =>
            `('${rowsPipeline[0].id}', '${column.name}', ${column.stage}, ${i + 1}, ${column.isblocked})`)
          .join(', ')}
      `

      const { rowCount: rowCountColumns } = await client.query(q2)
      if (rowCountColumns) return res.status(200).json({
        message: 'Criado com sucesso',
        id_pipeline: rowsPipeline[0].id
      })
      return res.status(400).json({ error: 'Erro ao salvar' })
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err
      })
    } finally {
      client.release()
    }
  }
  async editPipeline(req, res) {
    const { id_pipeline, columns } = req.body
    const q = `
    INSERT INTO 
      meulead_columns (id, id_pipeline, name, stage, position, isblocked)
    VALUES
    ${columns
        .map(
          (column, i) =>
            `('${column.id}', '${id_pipeline}', '${column.name}', ${column.stage
            }, ${i + 1}, ${column.isblocked})`
        )
        .join(', ')}
    ON CONFLICT (id) DO UPDATE
    SET stage = EXCLUDED.stage,
        name = EXCLUDED.name,
        position = EXCLUDED.position,
        isblocked = EXCLUDED.isblocked;
    `

    const q2 = `
    WITH id_list AS (
      SELECT UNNEST(ARRAY[
              ${columns.map(column => `'${column.id}'`).join(', ')}
        ]::UUID[]) AS id
    )
    UPDATE meulead_columns
    SET status = 0
    WHERE id NOT IN (SELECT id FROM id_list) AND id_pipeline = $1
    `

    if (!id_pipeline || !columns)
      return res.status(400).json({ error: 'Base Data not Provided' })

    const client = await dbPool.connect()
    try {
      const { rowCount } = await client.query(q)
      await client.query(q2, [id_pipeline])
      console.log(rowCount)
      if (rowCount)
        return res.status(200).json({ message: 'Alterado com sucesso' })
      return res.status(400).json({ error: 'Erro ao salvar' })
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err
      })
    } finally {
      client.release()
    }
  }


  async getLeadFields(_, res) {
    const q = `
      SELECT name, email, phone
      FROM meulead_leads
      LIMIT 1
    `

    const client = await dbPool.connect()
    try {
      const { fields, rowCount } = await client.query(q)
      if (!rowCount) throw new Error
      const filterFields = fields.map(field => field.name)
      return res.status(200).json(filterFields)
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err
      })
    } finally {
      client.release()
    }
  }

  async getLead(req, res) {
    const { id } = req.query
    const q = `
      SELECT a.name, a.city, a.state, a.email, a.whatsapp, a.id, a.lead_source, a.company, a.segment, a.phone, a.email_company, a.site, a.adress, b.id as id_card, b.id_column, b.id_responsible
      FROM meulead_leads a
      INNER JOIN meulead_cards b ON b.id_lead = a.id
      WHERE a.id = $1
    `
    if (!id) return res.status(400).json({ error: 'Base Data not Provided' })

    const client = await dbPool.connect()
    try {
      const data = await client.query(q, [id])
      if (data.rowCount) return res.status(200).json(data.rows[0])
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err
      })
    } finally {
      client.release()
    }
  }

  async changeCard(req, res) {
    const newId_responsible = req.body.id_responsible
    const newId_column = req.body.id_column
    const { id } = req.params

    const q = `
      SELECT id_column, id_responsible
      FROM meulead_cards 
      WHERE id = $1
    `

    const client = await dbPool.connect()
    try {
      const { rows, rowCount } = await client.query(q, [id])
      if (!rowCount) {
        return res.status(404).json({ error: 'Card não encontrado' })
      }

      const { id_column: currentIdColumn, id_responsible: currentResponsible } =
        rows[0]

      const tasks = []
      const lead = new Lead()

      if (newId_responsible && newId_responsible !== currentResponsible) {
        tasks.push(
          lead.changeResponsible({ responsible: newId_responsible, id })
        )
      }
      if (newId_column && newId_column !== currentIdColumn) {
        tasks.push(lead.changeStage({ id_column: newId_column, id }))
      }

      if (!tasks.length) {
        return res.status(400).json({ error: 'Sem alteração' })
      }

      const results = await Promise.allSettled(tasks)

      const errorResults = results.filter(
        result => result.status === 'rejected'
      )
      if (errorResults.length) {
        return res
          .status(errorResults[0].reason.status)
          .json(errorResults[0].reason)
      }

      return res
        .status(200)
        .json({ message: 'Alterações realizadas com sucesso' })
    } catch (err) {
      return res.status(500).json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err
      })
    } finally {
      client.release()
    }
  }

  async getUserPipeline(req, res) {
    const { id_client, id_pipeline } = req.query
    const q = `
    SELECT responsibles
    FROM meulead_pipelines
    WHERE id_client = $1 AND id = $2
    `
    if (!id_client || !id_pipeline)
      return res.status(400).json({ error: 'Base Data not Provided' })

    const client = await dbPool.connect()
    try {
      const data = await client.query(q, [id_client, id_pipeline])
      if (data.rowCount) return res.status(200).json(data.rows)
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err
      })
    } finally {
      client.release()
    }
  }

  async getHistoric(req, res) {
    let { id_card } = req.query
    const qObs = `
    SELECT 
      a.obs, a.time, c.name as name_user, 'Observação' as type
    FROM 
      meulead_historic_lead_obs a
    INNER JOIN 
      meulead_cards b ON b.id_lead = a.id_lead
      INNER JOIN 
      meulead_users c ON a.id_user = c.id
    WHERE 
      b.id = $1
    `

    const qCards = `
    SELECT 'Movimentou card' as type, a.time, c.name as input_column, b.name as name_user, d.name as output_column 
        FROM meulead_historic_card_moviment a
        INNER JOIN meulead_users b ON a.id_user = b.id
        INNER JOIN meulead_columns c ON  a.input_column = c.id
        INNER JOIN meulead_columns d ON  a.output_column = d.id
      WHERE 
    a.id_card = $1
    `

    if (!id_card)
      return res.status(400).json({ error: 'Base Data not Provided' })

    const client = await dbPool.connect()
    try {
      const { rowCount: rowCountObs, rows: rowsObs } = await client.query(
        qObs,
        [id_card]
      )

      const { rowCount: rowCountCards, rows: rowsCards } = await client.query(
        qCards,
        [id_card]
      )

      if (!rowCountObs && !rowCountCards)
        return res
          .status(400)
          .json({ error: 'Não existem históricos registrados para este lead' })
      return res
        .status(200)
        .json(
          [...rowsCards, ...rowsObs].sort(
            (a, b) => new Date(b.time) - new Date(a.time)
          )
        )
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err
      })
    } finally {
      client.release()
    }
  }

  async setValue(req, res) {
    const { potencialValue, id_lead } = req.body
    const q = `
    UPDATE meulead_leads
    SET potential_value = $1
    WHERE id = $2
    `
    if (!potencialValue || !id_lead)
      return res.status(400).json({ error: 'Base Data not Provided' })

    const client = await dbPool.connect()
    try {
      const data = await client.query(q, [potencialValue, id_lead])
      if (!data.rowCount)
        return res.status(402).json({ error: 'dados do usuarios incorretos' })
      return res.status(200).json({ message: 'alterado com sucesso' })
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err
      })
    } finally {
      client.release()
    }
  }

  async setObs(req, res) {
    const { id_user, obsValue, id_lead } = req.body
    const q = `
    INSERT INTO meulead_historic_lead_obs( id_user, obs, id_lead, request_type )
    VALUES ( $1, $2, $3, $4 )
    `

    if (!obsValue || !id_user || !id_lead)
      return res.status(400).json({ error: 'Base Data not Provided' })

    const client = await dbPool.connect()
    try {
      const data = await client.query(q, [
        id_user,
        obsValue,
        id_lead,
        req.method
      ])
      if (!data.rowCount)
        return res.status(402).json({ error: 'dados do usuarios incorretos' })
      return res.status(200).json({ message: 'postado com sucesso' })
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err
      })
    } finally {
      client.release()
    }
  }

  async setUserPipeline(req, res) {
    const { id_users } = req.body
    const { id_pipeline } = req.query
    const q = `
    UPDATE meulead_pipelines
    SET responsibles = $1
    WHERE id = $2
    `

    if (!id_users || !id_pipeline)
      return res.status(400).json({ error: 'Base Data not Provided' })

    const client = await dbPool.connect()
    try {
      const updateData = await client.query(q, [id_users, id_pipeline])
      if (!updateData.rowCount)
        return res.status(402).json({ error: 'dados da pipeline incorretos' })
      return res
        .status(200)
        .json({ message: 'Usuário(s) inserido(s) com sucesso na pipeline' })
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err
      })
    } finally {
      client.release()
    }
  }

  async setNewTitle(req, res) {
    const { id, value } = req.body
    const q = `
    UPDATE meulead_columns
    SET name = $1
    WHERE id = $2
    `
    console.log(`id > ${id} valor > ${value}`)
    if (!id || !value)
      return res.status(400).json({ error: 'Base Data not Provided' })
    const client = await dbPool.connect()
    try {
      const data = await client.query(q, [value, id])
      if (!data.rowCount)
        return res.status(402).json({ error: 'dados do usuarios incorretos' })
      return res.status(200).json({ message: 'alterado com sucesso' })
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err
      })
    } finally {
      client.release()
    }
  }
}
