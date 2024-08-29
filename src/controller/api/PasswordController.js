import { transporter } from '../../middlewares/resetPassword.js';
import jwt from 'jsonwebtoken';
import md5 from 'md5';
import { dbPool } from '../../BD/BDConect.js';

export class PasswordController {
  // Async para reset de senha
  async emailSendReset(req, res) {
    const { email } = req.body;
    const q = `
    SELECT id, username, email, password 
    FROM meulead_users
    WHERE email = $1
    `;
    if (!email) return res.status(401).json({ error: 'insira um e-mail' });

    const searchEmail = (data) => {
      let tokenPage = jwt.sign({ data }, process.env.SECRET_TOKEN_EMAIL, {
        expiresIn: '15m',
      });
      const mailOptions = {
        from: 'contato@makevendas.com.br',
        to: email,
        subject: 'Redefinação de usuario e senha',
        text:
          `Seu usuário: ${data.username} \n\n Acesse o link para redefinir sua senha: ` +
          process.env.LINK_MM +
          `/login/recovery/${tokenPage}`,
        html: `Seu usuário: ${data.username} <br><br> Acesse o link para redefinir sua senha <br> ${process.env.LINK_MM}/login/recovery/${tokenPage} <br><br><tbody><tr><td style="padding-right:10px"><img src="https://ci3.googleusercontent.com/meips/ADKq_NZ78cDNECGWHbr1MBsHp3AiQdu1yyMsRM4KI-G4bsIHguOrVmXwlpcDDg7ShpE_UQ4qX5fFaQNprWsOGmAi3yGS57lys5HZCT4Eth0Mp9shSOW2Wd6nvyfXNRCwF2li0lpbcJV6mOB00jgc7g=s0-d-e1-ft#http://makevendas.com.br/assinaturas/assinaturas-web-resources/image/logo-icon-B-2.gif" alt="" style="height:auto;min-width:100%;width:120px"></td><td style="border-left:2px solid rgb(94,94,94);padding-left:20px"><p style="margin:0px 0px 10px;padding:0px;border-width:0px;font-family:&quot;Minion Pro&quot;,serif;font-size:12px;line-height:1.2"><span style="color:rgb(94,94,94);font-family:Lato,sans-serif;font-weight:bold">Contato Make</span></p><p style="margin:0px 0px 10px;padding:0px;border-width:0px;font-family:&quot;Minion Pro&quot;,serif;font-size:12px;line-height:1.2"><span style="color:rgb(94,94,94);font-family:Lato,sans-serif">Contato</span></p><p style="margin:0px 0px 10px;padding:0px;border-width:0px;font-family:&quot;Minion Pro&quot;,serif;font-size:12px;line-height:1.2"><span style="color:rgb(94,94,94);font-family:Lato,sans-serif"><a href="mailto:contato@makevendas.com.br" style="color:rgb(17,85,204)" target="_blank">contato@makevendas.com.br</a></span></p><p style="margin:0px 0px 10px;padding:0px;border-width:0px;font-family:&quot;Minion Pro&quot;,serif;font-size:12px;line-height:1.2"><span style="color:rgb(94,94,94);font-family:Lato,sans-serif">+55 11 4330-0905</span><br></p><p style="margin:0px 0px 10px;padding:0px;border-width:0px;font-family:&quot;Minion Pro&quot;,serif;font-size:12px;line-height:1.2"><span style="color:rgb(94,94,94);font-family:Lato,sans-serif"><a href="http://makevendas.com.br/" style="color:rgb(17,85,204)" target="_blank">makevendas.com.br</a></span></p></td></tr></tbody>`,
      };
      transporter.sendMail(mailOptions, (err) => {
        if (err)
          return res.json({
            error: 'erro interno ao enviar o e-mail',
            errorDetails: err,
          });
        return res.status(200).json({ message: 'Email enviado com sucesso' });
      });
    };

    const client = await dbPool.connect();
    try {
      const data = await client.query(q, [email]);
      if (!data.rowCount)
        return res.status(404).json({ error: 'Não existe este e-mail' });
      await searchEmail({
        id: data.rows[0].id,
        username: data.rows[0].username,
        email: data.rows[0].email,
        password: data.rows[0].password,
      });
    } catch (err) {
      if (err)
        return res.json({
          error: 'erro interno ao processar requisição',
          errorDetails: err,
        });
    } finally {
      client.release();
    }
  }

  // Async para mudar senha no banco de dados
  async reset(req, res) {
    const { newpassword } = req.body;
    const { id, email, password } = req.userDataToken.data;
    const isValueNewPassword = md5(newpassword);
    const q = `
    UPDATE meulead_users 
    SET password = $1
    WHERE email = $2 AND password = $3 AND id = $4
    `;
    if (!id || !email || !password)
      return res.status(403).json({ error: 'Base Data not Provided' });

    const client = await dbPool.connect();
    try {
      const data = await client.query(q, [
        isValueNewPassword,
        email,
        password,
        id,
      ]);
      if (!data.rowCount)
        return res.status(409).json({ error: 'Sua senha já foi alterada' });
      return res.status(200).json({ message: 'Senha alterada com sucesso' });
    } catch (err) {
      if (err)
        return res.json({
          error: 'erro interno ao processar requisição',
          errorDetails: err,
        });
    } finally {
      client.release();
    }
  }
}
