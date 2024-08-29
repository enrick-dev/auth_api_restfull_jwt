import { dbPool } from '../../../BD/BDConect.js';

export class Lead {
  async changeResponsible({ responsible, id }) {
    if (!responsible || !id) {
      throw { error: 'Base Data not Provided', status: 400 };
    }

    const q = `
      UPDATE meulead_cards
      SET id_responsible = $1
      WHERE id = $2;
    `;

    const client = await dbPool.connect();
    try {
      const { rowCount } = await client.query(q, [responsible, id]);
      if (!rowCount) {
        throw { error: 'Erro ao alterar responsável', status: 400 };
      }
      return { message: 'Alterado com sucesso', status: 200 };
    } catch (err) {
      throw {
        error: 'Erro interno ao processar requisição',
        errorDetails: err,
        status: 500,
      };
    } finally {
      client.release();
    }
  }

  async changeStage({ id_column, id }) {
    if (!id_column || !id) {
      throw { error: 'Base Data not Provided', status: 400 };
    }

    const q = `
      UPDATE meulead_cards
      SET id_column = $1
      WHERE id = $2;
    `;

    const client = await dbPool.connect();
    try {
      const { rowCount } = await client.query(q, [id_column, id]);
      if (!rowCount) {
        throw { error: 'Erro ao alterar etapa', status: 400 };
      }
      return { message: 'Alterado com sucesso', status: 200 };
    } catch (err) {
      throw {
        error: 'Erro interno ao processar requisição',
        errorDetails: err,
        status: 500,
      };
    } finally {
      client.release();
    }
  }
}
