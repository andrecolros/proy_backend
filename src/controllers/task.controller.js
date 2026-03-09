import { Task } from '../models/task.js';

async function create(req, res) {
  const { name } = req.body;
  const { userId } = req.user;
  if (!name) return res.status(400).json({ message: 'No existe la tarea' });

  try {
    const newTask = await Task.create({
      name,
      userId,
    });
    return res.json(newTask);
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
}

async function get(req, res) {
  const { userId } = req.user;
  try {
    const tasks = await Task.findAndCountAll({
      attributes: ['id', 'name', 'done'],
      order: [['id', 'DESC']],
      where: {
        userId
      }
    });
    res.json({
      total: tasks.count,
      data: tasks.rows,
    });
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
}

async function find(req, res) {
  const { id } = req.params;
  const { userId } = req.user;
  try {
    const task = await Task.findOne({
      attributes: ['name', 'done'],
      where: {
        id,
        userId,
      },
    });
    if (!task) return res.status(404).json({ message: 'tarea no encontrado' });
    res.json(task);
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
}

const update = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'No existe la tarea' });

  try {
    const task = await Task.update(
      {
        name,
      },
      { where: { id, userId } },
    );

    if (task[0] === 0)
      return res.status(404).json({ message: 'Tarea no encontrada' });

    return res.json(task);
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
};

const done = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { done } = req.body;

  try {
    const task = await Task.update(
      {
        done,
      },
      { where: { id, userId } },
    );

    if (task[0] === 0)
      return res.status(404).json({ message: 'Tarea no encontrada' });

    return res.json(task);
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {

    const task = await Task.destroy({
      where: {
        id,
        userId
      }
    });

    if (task === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    return res.sendStatus(204);

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
  done,
  eliminar,
};