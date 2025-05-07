// Importa el objeto de modelos (User, Role, etc.) desde la carpeta models 
import db from "../models/index.js";
// Importa la librería jsonwebtoken para generar tokens JWT 
import jwt from "jsonwebtoken";
// Importa bcryptjs para encriptar y comparar contraseñas 
import bcrypt from "bcryptjs";
// Importa la configuración del secreto JWT desde un archivo de configuración 
import authConfig from "../config/auth.config.js";

// Extrae los modelos User y Role desde el objeto db 
const { user: User, role: Role } = db;

// Controlador para el registro de usuarios 
export const signup = async (req, res) => {
  try {
    // Extrae los datos enviados en el cuerpo de la solicitud 
    const { username, email, password, roles } = req.body;

    // Encripta la contraseña antes de guardarla en la base de datos 
    const hashedPassword = await bcrypt.hash(password, 8);

    // Busca el rol "user" en la base de datos para asignarlo por defecto
    const userRole = await Role.findOne({ where: { name: "user" } });

    // Crea un nuevo usuario con los datos proporcionados y la contraseña encriptada
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Asocia el rol encontrado al usuario (relación muchos a muchos)
    await user.setRoles([userRole]);

    // Devuelve respuesta exitosa
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    // Si ocurre un error, responde con código 500 y el mensaje del error
    res.status(500).json({ message: error.message });
  }
};

export const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1) Buscamos el usuario e incluimos TODOS sus roles
    const user = await User.findOne({
      where: { username },
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['name'],
        through: {
          attributes: []
        }
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User Not found.' });
    }
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({
        accessToken: null,
        message: 'Invalid Password!'
      });
    }

    const token = jwt.sign({ id: user.id }, authConfig.secret, {
      expiresIn: 86400
    });

    const authorities = user.roles.map(role => 
      `ROLE_${role.name.toUpperCase()}`
    );

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token
    });
  } catch (error) {
    console.error('Error en signin:', error);
    res.status(500).json({ message: error.message });
  }
};