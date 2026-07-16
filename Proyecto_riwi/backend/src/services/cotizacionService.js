// services/cotizacionService.js
// Aquí vive toda la lógica de negocio: los cálculos matemáticos de la cotización.
// Los valores (impuesto, flete, TLC) se consultan desde la BD, nunca se escriben aquí directamente.

const CotizacionModel = require('../models/cotizacionModel');
const ClienteModel = require('../models/clienteModel');
const ProductoModel = require('../models/productoModel');

const CotizacionService = {

    calcular: async ({ cliente_id, producto_id, pais_origen, pais_destino, valor_producto }) => {

        // 1. Verificar que el cliente exista
        const cliente = await ClienteModel.getById(cliente_id);
        if (!cliente) {
            const error = new Error('El cliente no existe');
            error.statusCode = 404;
            throw error;
        }

        // 2. Verificar que el producto exista
        const producto = await ProductoModel.getById(producto_id);
        if (!producto) {
            const error = new Error('El producto no existe');
            error.statusCode = 404;
            throw error;
        }

        // 3. Consultar impuesto del país destino desde la BD
        const impuestoData = await CotizacionModel.getImpuesto(pais_destino);
        if (!impuestoData) {
            const error = new Error('No se encontró impuesto registrado para el país destino');
            error.statusCode = 404;
            throw error;
        }

        // 4. Consultar flete entre los dos países desde la BD
        const fleteData = await CotizacionModel.getFlete(pais_origen, pais_destino);
        if (!fleteData) {
            const error = new Error('No existe una ruta de flete registrada entre esos países');
            error.statusCode = 404;
            throw error;
        }

        // 5. Consultar TLC (puede no existir, en ese caso el descuento es 0)
        const tlcData = await CotizacionModel.getTlc(pais_origen, pais_destino);

        // 6. Realizar los cálculos
        const subtotal = parseFloat(valor_producto);
        const porcentaje_impuesto = parseFloat(impuestoData.porcentaje) / 100;
        const valor_flete = parseFloat(fleteData.valor);
        const porcentaje_tlc = tlcData ? parseFloat(tlcData.descuento) / 100 : 0;

        const impuesto = parseFloat((subtotal * porcentaje_impuesto).toFixed(2));
        const descuento_tlc = parseFloat((subtotal * porcentaje_tlc).toFixed(2));
        const total = parseFloat((subtotal + impuesto + valor_flete - descuento_tlc).toFixed(2));

        // 7. Guardar en la BD
        const id_cotizacion = await CotizacionModel.create({
            cliente_id,
            producto_id,
            subtotal,
            impuesto,
            flete: valor_flete,
            descuento: descuento_tlc,
            total,
            precio_producto: valor_producto
        });

        // 8. Devolver el resultado
        return {
            id_cotizacion,
            subtotal,
            impuesto,
            valor_flete,
            descuento_tlc,
            total
        };
    }
};

module.exports = CotizacionService;
