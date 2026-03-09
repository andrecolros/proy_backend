import { User } from '../models/user.js';
import { Task } from '../models/task.js';
import logger from '../logs/logger.js';
import { Status } from '../constants/index.js';
import { encriptar } from '../common/bycript.js';
import { Op } from 'sequelize';

async function create(req, res) {
  const { username, password } = req.body;
  try {
    const newUser = await User.create({
      username,
      password
    });
    return res.json(newUser)
  } catch (error) {
    logger.error(error)
    return res.json(error.message)
  }
}

async function get(_req, res) {
  try {
    const users = await User.findAndCountAll({
      attributes: ['id', 'username', 'password', 'status'],
      order: [['id', 'DESC']],
      where: {
        status: Status.ACTIVE
      }
    });
    res.json({
      total: users.count,
      data: users.rows
    });
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
}

async function find(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      attributes: ['username', 'status'],
      where: {
        id,
      },
    });
    if (!user) 
      return res.status(404).json({message: 'Usuario no encontrado'})
    res.json(user)
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
}

const update = async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  const passwordHash = await encriptar(password);
  try {
    const user = await User.update(
      {
        username,
        password: passwordHash,
      },
      { where: { id } },
    );
    return res.json(user);
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
};

const activateInactivate = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: 'No existe el status' });

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(400).json({ message: 'No existe el usuario' });
    if (user.status === status)
      return res
        .status(409)
        .json({ message: `El usuario ya se encuentra ${status}` });

    user.status = status;
    await user.save();
    res.json(user);
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    await Task.destroy({
      where: {
        userId: id,
      },
    });
    await User.destroy({
      where: {
        id,
      },
    });
    return res.sendStatus(204);
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
};

const getTasks = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({
      attributes: ['username'],
      include: [
        {
          model: Task,
          attributes: ['name', 'done'],
        },
      ],
      where: { id },
    });
    return res.json(user);
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
};

const pagination = async (req, res) => {
  let {
    page = 1,
    limit = 10,
    search = '',
    orderBy = 'id',
    orderDir = 'DESC',
    status = 'active'
  } = req.query;

  try {

    page = Number(page);
    limit = Number(limit);

    const allowedLimits = [5, 10, 15, 20];

    if (!allowedLimits.includes(limit)) {
      limit = 10;
    }

    const offset = (page - 1) * limit;

    const where = {};

    // búsqueda por username
    if (search) {
      where.username = {
        [Op.iLike]: `%${search}%`
      };
    }

    // filtro por status
    if (status) {
      if (status === 'active') {
       where.status = 'ACTIVO';
      } else if (status === 'inactive') {
        where.status = 'INACTIVO';
      }
    }
    const users = await User.findAndCountAll({
      attributes: ['id', 'username', 'status'],
      where,
      limit,
      offset,
      order: [[orderBy, orderDir]]
    });

    const pages = Math.ceil(users.count / limit);

    return res.json({
      total: users.count,
      page,
      pages,
      data: users.rows
    });

  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
};

export default {
  create,
  get,
  find,
  update,
  eliminar,
  activateInactivate,
  getTasks,
  pagination
};