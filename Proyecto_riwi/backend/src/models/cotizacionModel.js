// models/cotizacionModel.js

const pool = require('../config/db');

const CotizacionModel = {

    // Trae todas las cotizaciones con el nombre del cliente
    getAll: async () => {
        const [rows] = await pool.query(`
            SELECT
                c.id_cotizacion,
                cl.nombre AS cliente,
                cl.correo,
                c.fecha,
                c.subtotal,
                c.impuesto,
                c.flete,
                c.descuento,
                c.total
            FROM cotizaciones c
            JOIN clientes cl ON cl.id_cliente = c.cliente_id
            ORDER BY c.fecha DESC
        `);
        return rows;
    },

    // Trae una cotización con su detalle de productos
    getById: async (id) => {
        const [cotizacion] = await pool.query(`
            SELECT
                c.id_cotizacion,
                cl.nombre AS cliente,
                cl.correo,
                c.fecha,
                c.subtotal,
                c.impuesto,
                c.flete,
                c.descuento,
                c.total
            FROM cotizaciones c
            JOIN clientes cl ON cl.id_cliente = c.cliente_id
            WHERE c.id_cotizacion = ?
        `, [id]);

        if (!cotizacion[0]) return null;

        const [detalle] = await pool.query(`
            SELECT
                p.nombre AS producto,
                d.cantidad,
                d.precio
            FROM detalle_cotizacion d
            JOIN productos p ON p.id_producto = d.producto_id
            WHERE d.cotizacion_id = ?
        `, [id]);

        return { ...cotizacion[0], detalle };
    },

    // Guarda la cotización y su detalle en una transacción
    create: async ({ cliente_id, producto_id, subtotal, impuesto, flete, descuento, total, precio_producto }) => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [result] = await conn.query(
                'INSERT INTO cotizaciones (cliente_id, subtotal, impuesto, flete, descuento, total) VALUES (?, ?, ?, ?, ?, ?)',
                [cliente_id, subtotal, impuesto, flete, descuento, total]
            );

            const cotizacion_id = result.insertId;

            await conn.query(
                'INSERT INTO detalle_cotizacion (cotizacion_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)',
                [cotizacion_id, producto_id, 1, precio_producto]
            );

            await conn.commit();
            return cotizacion_id;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    // Consultas a tablas maestras (impuesto, flete, TLC)
    getImpuesto: async (pais_id) => {
        const [rows] = await pool.query(
            'SELECT porcentaje FROM impuestos WHERE pais_id = ?',
            [pais_id]
        );
        return rows[0] || null;
    },

    getFlete: async (pais_origen, pais_destino) => {
        const [rows] = await pool.query(
            'SELECT valor FROM fletes WHERE pais_origen = ? AND pais_destino = ?',
            [pais_origen, pais_destino]
        );
        return rows[0] || null;
    },

    getTlc: async (pais_origen, pais_destino) => {
        const [rows] = await pool.query(
            'SELECT descuento FROM tlc WHERE pais_origen = ? AND pais_destino = ?',
            [pais_origen, pais_destino]
        );
        return rows[0] || null;
    }
};

module.exports = CotizacionModel;
