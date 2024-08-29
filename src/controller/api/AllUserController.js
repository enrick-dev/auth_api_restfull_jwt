import md5 from 'md5';
import { dbPool } from '../../BD/BDConect.js';

export class AllUserController {
  async allUsers(req, res) {
    const { id_client } = req.query;
    const q = `
    SELECT name, type, status, permissions, email, username, products 
    FROM meulead_users 
    WHERE id_client = $1
    ORDER BY status DESC, type ASC, name ASC`;

    const client = await dbPool.connect();
    try {
      const data = await client.query(q, [id_client]);
      return res.status(200).json(data.rows);
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err,
      });
    } finally {
      client.release();
    }
  }

  async typeUsers(req, res) {
    const { id_client, type, product } = req.query;
    const q = `
    SELECT id, username, type, sub_type, products
    FROM meulead_users 
    WHERE id_client = $1`;

    const client = await dbPool.connect();
    try {
      const { rows } = await client.query(q, [id_client]);
      const filterRows = await rows
        .filter((user) => type.includes(`${user.type}`))
        .filter((user) => (!product ? user : user.products?.includes(+product)));

      return res.status(200).json(filterRows);
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err,
      });
    } finally {
      client.release();
    }
  }

  async newUser(req, res) {
    let { name, type, product, email, password, username, id_client } =
      req.body;
    const q = `
    INSERT INTO meulead_users (name, type, products, email, password, username, id_client, permissions)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const permissionsDefault = { pages: [], view: [] };
    if (!name || !email || !password || !username || !id_client)
      return res.status(400).json({ error: 'Base Data not Provided' });
    if (type == 1) product = [99]; // Caso Admin ele tem todas as permissões

    let newPassword = md5(password);
    const client = await dbPool.connect();
    try {
      const data = await client.query(q, [
        name,
        type,
        [product],
        email,
        newPassword,
        username,
        id_client,
        permissionsDefault,
      ]);
      if (!data.rowCount)
        return res
          .status(404)
          .json({ error: 'Registro não encontrado ou não foi atualizado' });
      return res.status(200).json({ message: 'Criado com sucesso' });
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err,
      });
    } finally {
      client.release();
    }
  }

  async editUser(req, res) {
    let { name, type, product, email, password, id_client, username } =
      req.body;
    const q = `
    UPDATE meulead_users
    SET name = $1, type = $2, products = $3, email = $4, password = $5
    WHERE id_client = $6 AND username = $7
    `;
    const qPassword = `
    SELECT password
    FROM meulead_users
    WHERE id_client = $1 AND username = $2
    LIMIT 1
    `;
    let newPassword = password ? md5(password) : '';

    if (!name || !email || !id_client)
      return res.status(400).json({ error: 'Base Data not Provided' });
    if (type == 1) product = [99]; // Caso Admin ele tem todas as permissões

    const client = await dbPool.connect();
    try {
      if (!password) {
        const data = await client.query(qPassword, [id_client, username]);
        if (data.rowCount) newPassword = data.rows[0].password;
      }

      const data = await client.query(q, [
        name,
        type,
        [product],
        email,
        newPassword,
        id_client,
        username,
      ]);
      if (!data.rowCount)
        return res
          .status(404)
          .json({ error: 'Registro não encontrado ou não foi atualizado' });
      return res.status(200).json({ message: 'Dados alterados com sucesso' });
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err,
      });
    } finally {
      client.release();
    }
  }

  async editStatus(req, res) {
    const { status, id_client, username } = req.body;
    const q = `
    UPDATE meulead_users
    SET status = $1
    WHERE id_client = $2 AND username = $3
    `;
    if (!id_client || !username)
      return res.status(400).json({ error: 'Base Data not Provided' });

    const client = await dbPool.connect();
    try {
      const data = await client.query(q, [status, id_client, username]);
      if (!data.rowCount)
        return res
          .status(404)
          .json({ error: 'Registro não encontrado ou não foi atualizado' });
      return res
        .status(200)
        .json({ message: 'Alterado o status do ' + username + ' com sucesso' });
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err,
      });
    } finally {
      client.release();
    }
  }

  async editPermissions(req, res) {
    const { permissions, id_client, username } = req.body;

    const q = `
    UPDATE meulead_users
    SET permissions = $1
    WHERE id_client = $2 AND username = $3
    `;
    if (!permissions || !id_client || !username)
      return res.status(400).json({ error: 'Base Data not Provided' });

    const client = await dbPool.connect();
    try {
      const data = await client.query(q, [permissions, id_client, username]);
      if (!data.rowCount)
        return res
          .status(404)
          .json({ error: 'Registro não encontrado ou não foi atualizado' });
      return res
        .status(200)
        .json({ message: 'Permissões do ' + username + ' atualizadas' });
    } catch (err) {
      return res.json({
        error: 'Erro interno ao processar requisição',
        errorDetails: err,
      });
    } finally {
      client.release();
    }
  }
}
