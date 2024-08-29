import md5 from 'md5'
import jwt from 'jsonwebtoken'
import { dbPool } from "../../BD/BDConect.js";
import { dbLegacy } from '../../BD/BDLegacy.js';

export class AuthController {
  async authenticate(req, res) {
    const { user, password, subdomain } = req.body
    const isValuePassword = md5(password)
    const qUser = `
    SELECT meulead_users.id_client, meulead_users.username, meulead_users.password, users.subdomain
    FROM meulead_users 
    INNER JOIN users 
    ON meulead_users.id_client = users.id
    WHERE meulead_users.username = $1 AND meulead_users.status = 1
    LIMIT 1
    `
    const qUserKey = `
    SELECT senha 
    FROM usuarios_maso
    `

    if (!user) return res.status(403).json({ error: res.__('Insira um usuário') })
    if (!password) return res.status(403).json({ error: res.__('Insira uma senha') })

    const client = await dbPool.connect()
    try {
      const data = await client.query(qUser, [user])
      if (!data.rowCount) return res.status(403).json({ error: res.__('usuario não existe') })
      if (subdomain != data.rows[0].subdomain) return res.status(403).json({ error: 'Redirecting to your login page...', link: data.rows[0].subdomain + '.' + process.env.DOMAIN })

      const { id_client, username, password } = data.rows[0]
      const bodyResponse = {
        user: { id_client, username, },
        token: jwt.sign({ id: id_client }, process.env.SECRET_TOKEN, { expiresIn: '12h' })
      }
      return await finalAuth({ password, bodyResponse });
    } catch (err) {
      if (err) return res.json({ error: res.__('erro interno ao processar requisição'), errorDetails: err })
    } finally {
      client.release()
    }

    function finalAuth({ password, bodyResponse }) {
      // dbLegacy.query(qUserKey, (err, data) => {
      //   if (err) return res.json({ error: res.__('erro interno ao processar requisição'), errorDetails: err });
      //   const passwordUserMaso = data.filter((item) => item.senha.includes(isValuePassword))

      //   if (password == isValuePassword || isValuePassword == passwordUserMaso[0]?.senha) return res.status(200).json(bodyResponse)
      //   return res.status(400).json({ error: res.__('senha incorreta') })
      // })
      if (password == isValuePassword) return res.status(200).json(bodyResponse)
      return res.status(400).json({ error: res.__('senha incorreta') })
    }
  }
}

