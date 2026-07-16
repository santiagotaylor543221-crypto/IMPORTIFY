// models/clienteModel.js
// Los modelos contienen las consultas SQL. El controlador nunca toca SQL directamente.

const pool = require('../config/db');

const ClienteModel = {

    getAll: async () => {
        const [rows] = await pool.query('SELECT * FROM clientes ORDER BY id_cliente');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM clientes WHERE id_cliente = ?', [id]);
        return rows[0] || null;
    },

    getByCorreo: async (correo) => {
        const [rows] = await pool.query('SELECT * FROM clientes WHERE correo = ?', [correo]);
        return rows[0] || null;
    },

    create: async ({ nombre, correo }) => {
        const [result] = await pool.query(
            'INSERT INTO clientes (nombre, correo) VALUES (?, ?)',
            [nombre, correo]
        );
        return result.insertId;
    },

    update: async (id, { nombre, correo }) => {
        const [result] = await pool.query(
            'UPDATE clientes SET nombre = ?, correo = ? WHERE id_cliente = ?',
            [nombre, correo, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM clientes WHERE id_cliente = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = ClienteModel;
