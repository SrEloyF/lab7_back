// Importa Express para crear la aplicación web
import express from "express";
import dotenv from 'dotenv';
dotenv.config();

// Importa CORS para permitir solicitudes desde otros dominios (por ejemplo, desde el frontend)
import cors from "cors";

// Importa los modelos y configuración de Sequelize (ORM para la base de datos)
import db from "./models/index.js";

// Importa las rutas de autenticación (signup, signin)
import authRoutes from "./routes/auth.routes.js";

// Importa las rutas protegidas por roles de usuario
import userRoutes from "./routes/user.routes.js";

// Crea una instancia de la aplicación Express
const app = express();

// Configura las opciones de CORS para permitir acceso desde el frontend en el puerto 8080
const corsOptions = {
  origin: "http://localhost:4000", // Permite solicitudes desde el frontend en localhost:8080
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Aplica el middleware de CORS a la aplicación
app.use(cors(corsOptions));

// Middleware para analizar solicitudes con cuerpo en formato JSON
app.use(express.json());

// Middleware para analizar solicitudes con cuerpo en formato URL-encoded (formularios)
app.use(express.urlencoded({ extended: true }));

// Ruta simple para probar que el servidor está funcionando
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Node.js JWT Authentication API." });
});

// Define la ruta base para autenticación: /api/auth/signup y /api/auth/signin
app.use("/api/auth", authRoutes);

// Define la ruta base para pruebas de acceso según el rol del usuario: /api/test/*
app.use("/api/test", userRoutes);

// Define el puerto en el que se ejecutará el servidor. Usa 3000 por defecto si no hay una variable de entorno
const PORT = process.env.PORT || 3000;

// Sincroniza los modelos con la base de datos (sin borrar datos si force es false)
// Luego inicia el servidor y escucha en el puerto definido
db.sequelize.sync({ force: false }).then(() => {
  console.log("Database synchronized");

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});
