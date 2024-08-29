import jwt from "jsonwebtoken";

export function ResetPasswordToken(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) return res.status(404).json({ error: "Token password not provided" });

  const [, token] = authorization.split(" ");


  try {
    jwt.verify(token, process.env.SECRET_TOKEN_EMAIL, (err, decoded) => {
      if (err) return res.status(400).json({ error: 'Token password invalid' });

      req.userDataToken = decoded;
      next();
    });
  } catch (error) {
    if (!authorization) return res.status(500).json({ error: "Token password intern error", errorDetails: err });
  }
}