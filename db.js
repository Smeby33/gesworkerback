const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,  // Limite de connexions simultanées
    connectTimeout: 10000, // Temps en ms
    acquireTimeout: 20000,
    queueLimit: 0
});

// Vérification de la connexion
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Connexion MySQL réussie');
        connection.release(); // Libérer la connexion après vérification
    } catch (err) {
        console.error('❌ Erreur de connexion à la base de données:', err);
    }
})();

module.exports = db;
