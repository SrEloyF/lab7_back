// Importamos Sequelize, que es el ORM que utilizaremos para interactuar con la base de datos
import Sequelize from "sequelize";
// Importamos los modelos de usuario y rol
import userModel from "./user.model.js"; 
import roleModel from "./role.model.js";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leemos y parseamos el archivo config.json manualmente
const configPath = path.resolve(__dirname, '../config/config.json');
const configFile = fs.readFileSync(configPath, 'utf-8');
const config = JSON.parse(configFile).development; // Usa "production" si estás en producción

// Ajustamos las opciones de SSL para PostgreSQL si es necesario
if (config.dialect === 'postgres') {
  config.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Render exige esto si no se usa CA personalizada
    },
  };
}

// Creamos la instancia de Sequelize con la configuración cargada
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    pool: config.pool,
  }
);

// Creamos un objeto para almacenar los modelos y la instancia de Sequelize
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = userModel(sequelize, Sequelize);
db.role = roleModel(sequelize, Sequelize);

// Relaciones muchos a muchos entre usuarios y roles
db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId",
});

db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId",
  as: "roles",
});

// Lista de roles válidos
db.ROLES = ["user", "admin", "moderator"];

// Exportamos el objeto db
export default db;
