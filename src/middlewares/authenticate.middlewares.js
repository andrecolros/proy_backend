import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export function authenticateToken(req, res, next) {
  // Obtener el token de la cabecera de autorización
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  // Verificamos y decodificamos el token
  jwt.verify(token, env.jwt_secret, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
}