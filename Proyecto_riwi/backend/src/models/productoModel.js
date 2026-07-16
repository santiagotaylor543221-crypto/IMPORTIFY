// models/productoModel.js

const pool = require('../config/db');

const ProductoModel = {

    getAll: async () => {
        const [rows] = await pool.query('SELECT * FROM productos ORDER BY id_producto');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM productos WHERE id_producto = ?', [id]);
        return rows[0] || null;
    },

    create: async ({ nombre, descripcion, precio }) => {
        const [result] = await pool.query(
            'INSERT INTO productos (nombre, descripcion, precio) VALUES (?, ?, ?)',
            [nombre, descripcion || null, precio]
        );
        return result.insertId;
    },

    update: async (id, { nombre, descripcion, precio }) => {
        const [result] = await pool.query(
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ? WHERE id_producto = ?',
            [nombre, descripcion || null, precio, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM productos WHERE id_producto = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = ProductoModel;
