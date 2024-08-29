import jwt from "jsonwebtoken";
import { dbPool } from "../BD/BDConect.js";

export function ScriptLeadMiddlewares(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) return res.status(404).json({ error: "Token de script do lead not provided" });

  const [, token] = authorization.split(" ");
  const q = `
  SELECT token
  FROM public.meulead_token_script
  WHERE token = $1
  `

  try {
    jwt.verify(token, process.env.SECRET_TOKEN_SCRIPT_LEAD, async (err, decoded) => {
      if (err) return res.status(400).json({ error: 'Token de script do lead invalid' });
      
      const client = await dbPool.connect()
      const { rowCount } = await client.query(q, [token])
      if(!rowCount) return res.status(400).json({ error: 'Token de script do lead não encontrado' });

      next();
    });

  } catch (error) {
    if (!authorization) return res.status(500).json({ error: "Token de script do lead intern error", errorDetails: err });
  }
}