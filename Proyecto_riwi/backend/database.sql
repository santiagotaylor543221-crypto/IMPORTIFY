CREATE DATABASE IF NOT EXISTS importify_db;
USE importify_db;

CREATE TABLE paises (
    id_pais INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE productos (
    id_producto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(12,2) NOT NULL,
    CONSTRAINT chk_precio CHECK (precio > 0)
);

CREATE TABLE clientes (
    id_cliente INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE impuestos (
    id_impuesto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pais_id INT UNSIGNED NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    CONSTRAINT chk_porcentaje_imp CHECK (porcentaje >= 0),
    KEY (pais_id),
    CONSTRAINT impuestos_ibfk_1 FOREIGN KEY (pais_id) REFERENCES paises (id_pais)
);

CREATE TABLE fletes (
    id_flete INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pais_origen INT UNSIGNED NOT NULL,
    pais_destino INT UNSIGNED NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    CONSTRAINT chk_valor_flete CHECK (valor >= 0),
    KEY (pais_origen),
    KEY (pais_destino),
    CONSTRAINT fletes_ibfk_1 FOREIGN KEY (pais_origen) REFERENCES paises (id_pais),
    CONSTRAINT fletes_ibfk_2 FOREIGN KEY (pais_destino) REFERENCES paises (id_pais)
);

CREATE TABLE tlc (
    id_tlc INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pais_origen INT UNSIGNED NOT NULL,
    pais_destino INT UNSIGNED NOT NULL,
    descuento DECIMAL(5,2) NOT NULL,
    CONSTRAINT chk_descuento_tlc CHECK (descuento >= 0),
    KEY (pais_origen),
    KEY (pais_destino),
    CONSTRAINT tlc_ibfk_1 FOREIGN KEY (pais_origen) REFERENCES paises (id_pais),
    CONSTRAINT tlc_ibfk_2 FOREIGN KEY (pais_destino) REFERENCES paises (id_pais)
);

CREATE TABLE cotizaciones (
    id_cotizacion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT UNSIGNED NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12,2) NOT NULL,
    impuesto DECIMAL(12,2) NOT NULL,
    flete DECIMAL(12,2) NOT NULL,
    descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    KEY (cliente_id),
    CONSTRAINT cotizaciones_ibfk_1 FOREIGN KEY (cliente_id) REFERENCES clientes (id_cliente)
);

CREATE TABLE detalle_cotizacion (
    id_detalle INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cotizacion_id INT UNSIGNED NOT NULL,
    producto_id INT UNSIGNED NOT NULL,
    cantidad INT UNSIGNED NOT NULL,
    precio DECIMAL(12,2) NOT NULL,
    CONSTRAINT chk_cantidad CHECK (cantidad > 0),
    KEY (cotizacion_id),
    KEY (producto_id),
    CONSTRAINT detalle_cotizacion_ibfk_1 FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones (id_cotizacion),
    CONSTRAINT detalle_cotizacion_ibfk_2 FOREIGN KEY (producto_id) REFERENCES productos (id_producto)
);

-- =============================================
-- DATOS DE PRUEBA
-- =============================================

INSERT INTO paises (nombre) VALUES
('Colombia'),
('Estados Unidos'),
('China'),
('Alemania'),
('Taiwan');

INSERT INTO productos (nombre, descripcion, precio) VALUES
('Laptop Gaming', 'Laptop de alto rendimiento para gaming', 1200.00),
('Smartphone', 'Teléfono inteligente de última generación', 800.00),
('Accesorio USB-C', 'Hub USB-C multipuerto', 45.00),
('Wearable SmartWatch', 'Reloj inteligente con GPS', 350.00);

INSERT INTO clientes (nombre, correo) VALUES
('Carlos Pérez', 'carlos@email.com'),
('María López', 'maria@email.com'),
('Juan García', 'juan@email.com');

INSERT INTO impuestos (pais_id, porcentaje) VALUES
(1, 19.00),  -- Colombia IVA 19%
(2, 8.50),   -- USA impuesto promedio
(3, 13.00),  -- China VAT
(4, 19.00),  -- Alemania IVA
(5, 5.00);   -- Taiwan

INSERT INTO fletes (pais_origen, pais_destino, valor) VALUES
(2, 1, 200.00),  -- USA -> Colombia
(3, 1, 350.00),  -- China -> Colombia
(4, 1, 280.00),  -- Alemania -> Colombia
(5, 1, 320.00);  -- Taiwan -> Colombia

INSERT INTO tlc (pais_origen, pais_destino, descuento) VALUES
(2, 1, 5.00),   -- USA -> Colombia (TLC vigente)
(4, 1, 3.00);   -- Alemania -> Colombia (acuerdo UE)
