import { dbPool } from "../../BD/BDConect.js";

export class ActivitiesController {
  async getTypes(_, res) {
    const q = `
    SELECT id, name FROM meulead_lead_activities_type
    ORDER BY id ASC 
    `
    const client = await dbPool.connect()
    try {
      const { rows } = await client.query(q)
      return res.status(200).json(rows)
    } catch (err) {
      return res.json({ error: res.__('erro interno ao processar requisição'), errorDetails: err })
    } finally {
      client.release()
    }
  }

  async getActivities(req, res) {
    const { id_lead } = req.query
    const q = `
    SELECT a.id, a.type, c.name as type_name, a.status, d.name as status_name , a.created_date, a.completed_date, a.realization_date, a.subject, a.description, b.name as responsible 
      FROM meulead_lead_activities a
      INNER JOIN meulead_users b ON a.responsible = b.id
      INNER JOIN meulead_lead_activities_type c ON a.type = c.id
      INNER JOIN meulead_lead_activities_status d ON a.status = d.id
      WHERE a.id_lead = $1
      ORDER BY a.status ASC, a.realization_date ASC
    `
    const client = await dbPool.connect()
    try {
      const { rows, rowCount } = await client.query(q, [id_lead])
      if (!rowCount) return res.status(400).json({ error: "Não há atividades para esse lead" })
      return res.status(200).json(rows)
    } catch (err) {
      return res.json({ error: res.__('erro interno ao processar requisição'), errorDetails: err })
    } finally {
      client.release()
    }
  }

  async newActivitie(req, res) {
    const { subject, id_lead, type, data_realization: realization_data, description, id_user } = req.body
    const q = `
    INSERT INTO meulead_lead_activities(
    id_lead, type, realization_date, subject, description, responsible)
    VALUES ($1, $2, $3, $4, $5, $6)
    `

    if (!id_lead || !type || !realization_data) return res.status(403).json({ error: 'Base Data not Provided' })

    const client = await dbPool.connect()
    try {
      const { rowCount } = await client.query(q, [id_lead, type, realization_data, subject, description, id_user])
      if (!rowCount) return res.status(400).json({ message: "Erro ao criar atividade" })
      return res.status(200).json({ message: "Adicionado nova atividade" })
    } catch (err) {
      return res.json({ error: res.__('erro interno ao processar requisição'), errorDetails: err })
    } finally {
      client.release()
    }
  }

  async editActivity(req, res) {
    const { id, type, realization_date, subject, description } = req.body
    const q = `
    UPDATE meulead_lead_activities
      SET type = $1, realization_date = $2, subject = $3, description = $4
      WHERE id = $5;
    `

    const client = await dbPool.connect()
    try {
      const { rowCount } = await client.query(q, [type, realization_date, subject, description, id])

      if (!rowCount) return res.status(400).json({ message: "Erro ao editar atividade" })
      return res.status(200).json({ message: "Alterações realizadas" })
    } catch (err) {
      return res.json({ error: res.__('erro interno ao processar requisição'), errorDetails: err })
    } finally {
      client.release()
    }

  }

  async completeActivity(req, res) {
    const { id_activity } = req.body
    const q = `
    UPDATE meulead_lead_activities
    SET status = 2
    WHERE id = $1
    `
    if (!id_activity) return res.status(403).json({ error: 'Base Data not Provided' })

    console.log("id_activity")
    console.log(id_activity)
    const client = await dbPool.connect()
    try {
      const { rowCount } = await client.query(q, [id_activity]);
      if (!rowCount) return res.status(400).json({ error: 'Não foi possivel concluir atividade' });
      return res.status(200).json({ message: "Atividade Concluída" })
    } catch (err) {
      if (err) return res.json({ error: 'erro interno ao processar requisição', errorDetails: err });
    } finally {
      client.release()
    }
  }
}

