import { dbPool } from "../../BD/BDConect.js";

class HistoricController {
  async insertHistoricMovimentCard({ id_card, output_column, input_column, id_user }) {
    const q = `
      INSERT INTO meulead_historic_card_moviment(
	      id_card, output_column, input_column, id_user, request_type)
	    VALUES ( $1, $2, $3, $4, 'WebSocket');
    `

    const client = await dbPool.connect()
    try {
      const { rowCount } = await client.query(q, [id_card, output_column, input_column, id_user]);
      if (rowCount) return

    } catch (err) {
      console.error('Error executing query', err);
    }
    finally {
      client.release();
    }
  }

  async insertHistoricActivities({ status, id_activitie }) {
    const q = `
      INSERT INTO meulead_historic_activities_status(
	      status, id_activitie, request_type)
	    VALUES ( $1, $2, 'WebSocket');
    `

    const client = await dbPool.connect()
    try {
      const { rowCount } = await client.query(q, [status, id_activitie, request_type]);
      if (rowCount) return

    } catch (err) {
      console.error('Error executing query', err);
    }
    finally {
      client.release();
    }

  }
}
export default HistoricController 