export default {
    HOST: "dpg-d023iije5dus73bd56q0-a.oregon-postgres.render.com",
    USER: "practica1_m2k1_user",
    PASSWORD: "LSnflbMhc4NaLa9fD6cPeClPj5iLtObk",
    DB: "practica1_m2k1",
    PORT: 5432,
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
};