import { dbPool } from "../../BD/BDConect.js";
import HistoricController from "../functions/HistoricController.js";
import getPipeline from "./functions/getPipeline.js";
import { validate as validarUUID } from 'uuid';


export class PipelineControllerWS {
  constructor() {
    this.rooms = new Map(); // Mapa para armazenar informações das salas

    this.pipeline = this.pipeline.bind(this);
    this.moveCard = this.moveCard.bind(this);
  }


  async pipeline(socket) {
    socket.on('get-pipeline', async ({ id, id_client, id_user }) => {
      const q = `
      SELECT id, id_client, name
      FROM meulead_pipelines WHERE id=$1 AND id_client=$2
      `;

      if (!validarUUID(id)) return socket.emit('get-pipeline', { error: "Invalid id" });

      const client = await dbPool.connect();
      try {
        const data = await client.query(q, [id, id_client]);
        socket.emit('get-pipeline', { id: data.rows[0].id, name: data.rows[0].name })

        const room = `client_${id_client}_pipeline_${id}`;
        socket.join(room);
        socket.user = {
          id_user,
          id_client,
          id_pipeline: id
        };

        if (!this.rooms.has(room)) {
          this.rooms.set(room, { id_user, id_client, id_pipeline: id, sockets: new Set() });
        }
        this.rooms.get(room).sockets.add(socket);
      } catch (err) {
        console.error('Erro ao executar query', err.stack);
        socket.emit('get-pipeline', { error: "Erro ao Processar requisição", errorDetails: err });
      } finally {
        client.release();
      }

    });

    socket.on('get-columns', async (params) => {
      await getPipeline.Columns(params, socket);
    });

    socket.on('get-cards', async (params) => {
      await getPipeline.Cards(params, socket);
    });
  }

  async moveCard(socket) {
    socket.on('move-card', async ({ id, id_column, id_user }) => {
      const q = `
        SELECT id_column
        FROM meulead_cards
        WHERE id = $1
      `
      const q2 = `
        UPDATE meulead_cards
        SET id_column = $1
        WHERE id = $2 
      `

      const historiccontroller = new HistoricController
      const client = await dbPool.connect()
      try {
        const { rows: rowsSelect } = await client.query(q, [id]);
        const { rowCount } = await client.query(q2, [id_column, id]);

        if (rowCount) await historiccontroller.insertHistoricMovimentCard({ id_card: id, output_column: rowsSelect[0].id_column, input_column: id_column, id_user })
      } catch (err) {
        console.error('Error executing query', err.stack);
        socket.emit('move-card', { error: 'Error fetching cards', details: err });
      }
      finally {
        client.release();
      }
    })
  }
}
