const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();
console.log('Tentative de connexion avec ces paramètres:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
});
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000 // 20 secondes timeout
});

// Vérification de la connexion
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Connexion MySQL réussie');
        await connection.ping();
        console.log('✅ Ping réussi');
        connection.release();
    } catch (err) {
        console.error('❌ Erreur de connexion:', {
            message: err.message,
            code: err.code,
            stack: err.stack
        });
        process.exit(1); // Quitte l'application si la DB n'est pas disponible
    }
})();

module.exports = db;
