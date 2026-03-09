import jwt from 'jsonwebtoken';
import { comparar } from '../common/bycript.js';
import logger from '../logs/logger.js';
import { User } from '../models/user.js';
import env from '../config/env.js';

async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      where: { username },
    });

    if (!user)
      return res.status(404).json({ message: 'Usuario no encontrado' });

    if (!(await comparar(password, user.password)))
      return res.status(403).json({ message: 'Usuario no autorizado' });

    const token = jwt.sign({ userId: user.id }, env.jwt_secret, {
      expiresIn: eval(env.jwt_expires_second),
    });

    res.json({ token });
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
}

export default { login };