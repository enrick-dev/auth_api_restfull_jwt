import { dbPool } from "../../../BD/BDConect.js";
import { validate as validarUUID } from 'uuid';

class getPipeline {
  async Columns({ id_user, id_client, id_pipeline }, socket) {
    const q = `
      SELECT type, sub_type
      FROM meulead_users
      WHERE id = $1 AND id_client = $2 
    `;
    const q2 = `
      SELECT id, name, stage, isblocked
      FROM meulead_columns WHERE id_pipeline=$1 AND status=1
      ORDER BY position ASC 
    `;

    if (!validarUUID(id_pipeline)) return

    const client = await dbPool.connect();
    try {
      const { rows: userRows } = await client.query(q, [id_user, id_client]);
      const { rows: columnsRows } = await client.query(q2, [id_pipeline]);

      if (userRows.length === 0) {
        throw new Error('User not found or does not have access.');
      }

      const { type, sub_type } = await userRows[0]
      const columns = type >= 3
        ? columnsRows.filter(column => column.stage == sub_type)
        : columnsRows;

      socket.emit('get-columns', columns);
    } catch (err) {
      console.error('Erro ao executar query', err.stack);
      socket.emit('get-columns', err);
    } finally {
      client.release();
    }
  }

  async Cards({ id_user, id_client, id_pipeline }, socket) {
    const q = `
      SELECT id, type
      FROM meulead_users
      WHERE id = $1 AND id_client = $2 
    `;

    const q2 = `
      SELECT a.id, b.name, a.id_column, a.id_responsible, e.name as responsible_name, b.lead_source, b.potential_value, a.id_lead
      FROM meulead_cards a
      INNER JOIN meulead_leads b ON a.id_lead = b.id 
      INNER JOIN meulead_columns c ON a.id_column = c.id 
      INNER JOIN meulead_pipelines d ON c.id_pipeline = d.id 
      INNER JOIN meulead_users e ON a.id_responsible = e.id 
      WHERE d.id = $1
      ORDER BY id ASC 
    `;

    if (!validarUUID(id_pipeline)) return

    const room = `client_${id_client}_pipeline_${id_pipeline}`;

    const client = await dbPool.connect();
    try {
      const { rows: userRows } = await client.query(q, [id_user, id_client]);
      const { rows: cardRows } = await client.query(q2, [id_pipeline]);

      if (userRows.length === 0) {
        throw new Error('User not found or does not have access.');
      }

      const { id: userId, type } = userRows[0];

      const cards = type >= 3
        ? cardRows.filter(card => card.id_responsible == userId)
        : cardRows;

      socket.emit('get-cards', cards);
    } catch (err) {
      console.error('Error executing query', err.stack);
      socket.emit('get-cards', { error: 'Error fetching cards', details: err.message });
    } finally {
      client.release();
    }
  }
}

export default new getPipeline();

