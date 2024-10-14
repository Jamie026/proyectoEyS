CREATE TABLE usuarios (
    idusuarios INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(45) NOT NULL,
    apellido VARCHAR(45) NOT NULL,
    usuario VARCHAR(45) NOT NULL,
    clave TEXT DEFAULT NULL,
    permiso TINYINT(1) DEFAULT '0',
    email VARCHAR(255) NOT NULL,
    PRIMARY KEY (idusuarios),
    UNIQUE KEY USUARIO_UNICO (usuario),
    UNIQUE KEY EMAIL_UNICO (email)
);