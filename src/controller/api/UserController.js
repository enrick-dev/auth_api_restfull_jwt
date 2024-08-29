import md5 from "md5";
import { dbPool } from "../../BD/BDConect.js";

export class UserController {
  async permissions(req, res) {
    const { username, id_client } = req.query
    const q = `
    SELECT meulead_users.permissions
    FROM meulead_users 
    INNER JOIN users 
    ON meulead_users.id_client = users.id 
    WHERE meulead_users.username = $1 AND users.id = $2
    LIMIT 1
    `
    if (!username || !id_client) return res.status(403).json({ error: 'Base Data not Provided' })

    const client = await dbPool.connect()
    try {
      const data = await client.query(q, [username, id_client])
      if (data.rowCount) return res.status(200).json(data.rows[0].permissions)
    } catch (err) {
      return res.json({ error: 'erro interno ao processar requisição', errorDetails: err });
    } finally {
      client.release();
    }
  }

  async details(req, res) {
    const { username, id_client } = req.body
    const q = `
    SELECT a.id, a.id_client, a.name, a.username, a.email, a.type
    FROM meulead_users a
    INNER JOIN users b
    ON a.id_client = b.id 
    WHERE a.username = $1 AND b.id = $2 AND a.status = 1
    `

    const client = await dbPool.connect()
    try {
      const data = await client.query(q, [username, id_client])
      if (data.rowCount) {
        const { id, name, username, email, type } = data.rows[0]
        return res.status(200).json({ me: { id, name, username, email, type } })
      }
    } catch (err) {
      return res.json({ error: 'erro interno ao processar requisição', errorDetails: err });
    } finally {
      client.release();
    }
  }

}
