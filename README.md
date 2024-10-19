<body>
  <div class="container">
    <h1>📊 Sistema de Análisis de Churn y Administración de Empleados</h1>
    <p>
      Este proyecto es una <strong>aplicación web</strong> diseñada para ayudar a los empleados de un banco a 
      <strong>analizar el churn</strong> (tasa de abandono de clientes) y prevenir la salida de usuarios mediante 
      estrategias predictivas. Además, proporciona un módulo de <strong>gestión de empleados</strong>, asegurando que 
      solo personal autorizado tenga acceso a información confidencial.
    </p>
    <h2>🚀 Funcionalidades Principales</h2>
    <ul>
      <li>✔️ Análisis del churn de clientes para prevenir bajas.</li>
      <li>🔒 Gestión de roles y permisos para los empleados.</li>
      <li>👥 Solo los administradores pueden administrar a otros empleados.</li>
      <li>⚠️ Control de acceso granular: no todos pueden ver los datos de clientes ni otros empleados.</li>
      <li>🔐 <strong>Enfoque en seguridad y privacidad</strong>, utilizando middleware para validar roles.</li>
      <li>📧 Implementación de <strong>Multi-Factor Authentication (MFA)</strong> por correo en el inicio de sesión.</li>
      <li>🌐 Uso de <strong>SSL</strong> para asegurar que las cookies y sesiones se manejen solo en <code>https</code>.</li>
    </ul>
    <h2>🛠️ Tecnologías Utilizadas</h2>
    <div class="tech-icons">
      <img src="https://img.icons8.com/color/48/000000/nodejs.png" alt="Node.js">
      <img src="https://img.icons8.com/color/48/000000/mysql-logo.png" alt="MySQL">
      <img src="https://img.icons8.com/color/48/000000/bootstrap.png" alt="Bootstrap">
      <img src="https://cdn.iconscout.com/icon/free/png-256/free-handlebars-logo-icon-download-in-svg-png-gif-file-formats--company-brand-world-logos-vol-9-pack-icons-282936.png" 
             alt="Handlebars" style="width:30px; height:30px;">      
      <img src="https://img.icons8.com/color/48/000000/css3.png" alt="CSS3">
      <img src="https://img.icons8.com/color/48/000000/javascript--v1.png" alt="JavaScript">
    </div>
    <h2>🔒 Seguridad</h2>
    <ul>
      <li>Middleware para validar los roles de usuario y controlar el acceso.</li>
      <li>Autenticación multifactor (MFA) mediante correo electrónico durante el inicio de sesión.</li>
      <li>Uso de certificados SSL para proteger la transmisión de datos.</li>
      <li>Cifrado de contraseñas y datos sensibles guardados en las sesiones de los usuarios.</li>
      <li>Validaciones en todos los formularios para evitar <strong>SQL Injection</strong>.</li>
      <li>La <strong>cookie de sesión</strong> se encripta utilizando una llave específica, que también se usa para desencriptarla en cada solicitud, garantizando la identidad del usuario en cada llamada.</li>
    </ul>
    <h2>📂 Estructura del Proyecto</h2>
    <pre>
    /src
    ├── /config         # Configuraciones de la aplicación
    ├── /controllers    # Lógica de negocio
    ├── /node_modules   # Dependencias instaladas
    ├── /public         # Archivos estáticos (CSS, JS)
    ├── /routes         # Rutas Express
    ├── /SQL            # Scripts SQL para la base de datos
    ├── /SSL            # Certificados SSL
    ├── /views          # Plantillas Handlebars
    └── .env            # Variables de entorno
    index.js            # Archivo principal del servidor
    package.json        # Dependencias y configuración del proyecto
    package-lock.json   # Versión fija de dependencias
    .gitignore          # Archivos ignorados por Git
    </pre>
    <h2>📖 Instalación y Uso</h2>
    <ol>
      <li>Clonar el repositorio:
        <pre><code>git clone https://github.com/Jamie026/proyectoEyS.git</code></pre>
      </li>
      <li>Instalar las dependencias:
        <pre><code>npm install</code></pre>
      </li>
      <li>Configurar las variables de entorno en un archivo <code>.env</code>.</li>
      <li>Iniciar el servidor:
        <pre><code>node index.js</code></pre>
      </li>
      <li>Acceder a la aplicación en <a href="https://localhost:3000">https://localhost:3000</a>.</li>
    </ol>
  </div>
</body>
