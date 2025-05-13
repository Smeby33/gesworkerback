const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

// Import des routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clientRoutes = require('./routes/clientRoutes');
const intervenantinterRoutes = require('./routes/intervenantinterRoutes');
const intervenantRoutes = require('./routes/intervenantRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const categorieRoutes = require('./routes/categorieRoutes');
const priorityRoutes = require('./routes/priorityRoutes');
const tacheRoutes = require('./routes/tacheRoutes');
const commentRoutes = require('./routes/CommentRoutes');

dotenv.config();

// Middleware de log
app.use((req, res, next) => {
    console.log(`🌍 Nouvelle requête : ${req.method} ${req.url}`);
    next();
});

app.use(express.json());

// Configuration CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://gesworker.vercel.app',
  'https://gesworkerback.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // si tu utilises des cookies ou tokens avec des headers personnalisés
}));

// Routes
app.use('/users', userRoutes);
app.use('/admins', adminRoutes);
app.use('/clients', clientRoutes);
app.use('/intervenants', intervenantRoutes);
app.use('/intervenantinters', intervenantinterRoutes);
app.use('/categories', categorieRoutes);
app.use('/performances', performanceRoutes);
app.use('/prioritys', priorityRoutes);
app.use('/taches', tacheRoutes);
app.use('/comments', commentRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
