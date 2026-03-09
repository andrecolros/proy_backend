import { DataTypes } from 'sequelize';
import { Status } from '../constants/index.js';
import { sequelize } from '../database/database.js';
import { Task } from './task.js';
import { encriptar } from '../common/bycript.js'

export const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Ingrese username',
            },
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Ingrese contraseña',
            },
        },
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: Status.ACTIVE,
        validate: {
            isIn: {
                args: [[Status.ACTIVE, Status.INACTIVE]],
                msg: `Debe ser ${Status.ACTIVE} o ${Status.INACTIVE}`,
            },  
        },
    },
});

User.hasMany(Task);
Task.belongsTo(User);

User.beforeCreate ( async (user) => {
    user.password = await encriptar (user.password)
});

User.beforeUpdate ( async (user) => {
    user.password = await encriptar (user.password)
});