const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { setInterval } = require('timers/promises');

dotenv.config();

// Configuration optimisée du pool de connexions
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Port par défaut MySQL
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 15, // Augmentation du nombre de connexions
  connectTimeout: 15000, // 15s pour la connexion initiale
  acquireTimeout: 30000, // 30s pour obtenir une connexion
  queueLimit: process.env.DB_QUEUE_LIMIT || 50, // Augmentation de la file d'attente
  enableKeepAlive: true, // Activer keep-alive
  keepAliveInitialDelay: 10000, // Délai avant premier keep-alive
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: true
  } : null
});

// Fonction de vérification de santé de la connexion
async function checkDatabaseHealth() {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.ping();
    console.log('🟢 La base de données répond correctement');
    return true;
  } catch (err) {
    console.error('🔴 Erreur de connexion à la base de données:', {
      message: err.message,
      code: err.code,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    return false;
  } finally {
    if (connection) connection.release();
  }
}

// Surveillance périodique (toutes les 5 minutes)
(async () => {
  try {
    await checkDatabaseHealth();
    
    // Configurer une surveillance périodique en production
    if (process.env.NODE_ENV === 'production') {
      for await (const _ of setInterval(5 * 60 * 1000)) { // Toutes les 5 minutes
        await checkDatabaseHealth();
      }
    }
  } catch (err) {
    console.error('Erreur dans la surveillance de la base de données:', err);
  }
})();

// Middleware pour logger les événements du pool
db.on('acquire', (connection) => {
  console.debug(`🔗 Connexion acquise (ID: ${connection.threadId})`);
});

db.on('release', (connection) => {
  console.debug(`🔗 Connexion libérée (ID: ${connection.threadId})`);
});

db.on('enqueue', () => {
  console.debug('⌛ Requête en attente dans la file');
});

db.on('error', (err) => {
  console.error('❌ Erreur du pool de connexions:', {
    message: err.message,
    code: err.code,
    fatal: err.fatal
  });
});

module.exports = {
  db,
  checkDatabaseHealth // Export pour utilisation dans les tests
};
