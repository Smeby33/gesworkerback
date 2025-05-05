const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

// 📌 Récupérer un utilisateurs
router.get('/user', (req, res) => {
    db.query('SELECT id, username, is_admin, company_name, profile_picture FROM users', (err, results) => {
        if (err) {
            console.error("Erreur SQL :", err); // Garder le détail dans le serveur
            return res.status(500).json({ error: "Erreur interne du serveur." });
        }
        
        res.json(results);
    });
});


//  Récupérer un utilisateur par son ID (varchar)
// Middleware de validation d'ID
const validateUserId = (req, res, next) => {
    const userId = req.params.id;
    if (!userId || userId.length !== 28) { // Exemple de validation
        return res.status(400).json({ 
            error: "ID utilisateur invalide",
            details: "L'ID doit faire 28 caractères" 
        });
    }
    next();
};

// Récupérer un utilisateur par son ID (version optimisée)
router.get('/getUser/:id', validateUserId, async (req, res) => {
    const userId = req.params.id;
    let connection;

    try {
        // 1. Tentative de récupération depuis le cache
        const cachedUser = await cache.get(`user:${userId}`);
        if (cachedUser) {
            console.debug("Cache hit for user", userId);
            return res.json(JSON.parse(cachedUser));
        }

        // 2. Acquisition d'une connexion avec timeout
        connection = await db.getConnection();
        
        // 3. Exécution de la requête avec timeout
        const [results] = await connection.query({
            sql: 'SELECT id, name, email, company_name, is_admin, profile_picture FROM users WHERE id = ? LIMIT 1',
            timeout: 10000, // 10 secondes timeout
            values: [userId]
        });

        if (results.length === 0) {
            return res.status(404).json({ 
                error: "Utilisateur non trouvé",
                userId: userId
            });
        }

        const userData = results[0];
        
        // 4. Mise en cache pour 1 heure
        await cache.set(`user:${userId}`, JSON.stringify(userData), 'EX', 3600);
        
        // 5. Réponse
        res.json(userData);
        
    } catch (err) {
        console.error("Erreur sur getUser:", {
            userId,
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });

        const statusCode = err.code === 'ETIMEDOUT' ? 504 : 500;
        res.status(statusCode).json({ 
            error: err.code === 'ETIMEDOUT' 
                ? "Timeout de la base de données" 
                : "Erreur interne du serveur",
            requestId: req.requestId // À implémenter avec un middleware
        });
    } finally {
        // 6. Libération systématique de la connexion
        if (connection) connection.release();
    }
});



//  Ajouter un utilisateur
router.post('/addUser', async (req, res) => {
    console.log("🚀 Requête reçue :", req.body);

    try {
        const { id, name, email, password, is_admin, company_name } = req.body;

        // Validation renforcée
        if (!id || !email) {
            return res.status(400).json({ error: "ID et email sont obligatoires" });
        }

        // Valeur par défaut pour le nom si non fourni
        const finalName = name; // Utilise l'email si name est vide

        const query = `
            INSERT INTO users (id, name, email, password, is_admin, company_name, profile_picture)
            VALUES (?, ?, ?, ?, ?, ?, NULL)
        `;

        const values = [
            id,
            name, // On utilise toujours une valeur valide
            email,
            password ? await bcrypt.hash(password, 10) : null,
            is_admin ? 1 : 0,
            company_name || null
        ];

        const [result] = await db.query(query, values);

        console.log("✅ Utilisateur ajouté. ID:", id, "Nom:", finalName);
        res.status(201).json({ 
            success: true,
            message: "Utilisateur ajouté avec succès",
            userId: id
        });

    } catch (error) {
        console.error("❌ Erreur serveur:", error);
        res.status(500).json({ 
            error: "Erreur interne du serveur",
            details: error.sqlMessage || error.message
        });
    }
});


router.get('/getProfilePicture/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "L'ID utilisateur est requis." });
    }

    try {
        // Vérification dans les deux tables
        const [userCheck] = await db.query('SELECT id FROM users WHERE id = ? UNION SELECT id FROM intervenant WHERE id = ?', [userId, userId]);

        if (userCheck.length === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé dans la base de données." });
        }

        // Recherche de la photo dans users puis dans intervenant
        const [userRows] = await db.query('SELECT profile_picture FROM users WHERE id = ?', [userId]);
        if (userRows.length > 0) {
            return res.status(200).json({ profilePicture: userRows[0].profile_picture });
        }

        const [intervenantRows] = await db.query('SELECT profile_picture FROM intervenant WHERE id = ?', [userId]);
        if (intervenantRows.length > 0) {
            return res.status(200).json({ profilePicture: intervenantRows[0].profile_picture });
        }

        // Cas où l'utilisateur existe mais n'a pas de photo
        return res.status(200).json({ profilePicture: null });

    } catch (err) {
        console.error("❌ Erreur SQL :", err);
        res.status(500).json({ error: "Une erreur interne est survenue." });
    }
});

router.put('/updateProfilePicture/:userId', async (req, res) => {
    const { userId } = req.params;
    const { profilePicture } = req.body;

    if (!profilePicture) {
        return res.status(400).json({ error: "L'image est requise." });
    }

    try {
        // Vérification dans les deux tables
        const [userCheck] = await db.query('SELECT id FROM users WHERE id = ? UNION SELECT id FROM intervenant WHERE id = ?', [userId, userId]);

        if (userCheck.length === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé dans la base de données." });
        }

        // Essai de mise à jour dans users
        const [userResult] = await db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [profilePicture, userId]);
        
        if (userResult.affectedRows > 0) {
            return res.status(200).json({ message: "Photo de profil mise à jour avec succès dans users." });
        }

        // Si pas dans users, essai dans intervenant
        const [intervenantResult] = await db.query('UPDATE intervenant SET profile_picture = ? WHERE id = ?', [profilePicture, userId]);
        
        if (intervenantResult.affectedRows > 0) {
            return res.status(200).json({ message: "Photo de profil mise à jour avec succès dans intervenant." });
        }

        // Cas où l'utilisateur existe mais n'a pas pu être mis à jour (normalement impossible après la vérification)
        return res.status(500).json({ error: "Échec de la mise à jour dans les deux tables." });

    } catch (err) {
        console.error("❌ Erreur SQL :", err);
        res.status(500).json({ error: "Une erreur interne est survenue." });
    }
});
// 📌 Reconnecter un administrateur
router.post('/reconnectAdmin', async (req, res) => {
    const { email, password } = req.body;

    try {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error("Erreur SQL :", err); // Garder le détail dans le serveur
                return res.status(500).json({ error: "Erreur interne du serveur." });
            }
            
            if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
                return res.status(401).json({ error: "Identifiants incorrects" });
            }
            

            const admin = results[0];
            
            if (!admin.password) {
                return res.status(401).json({ error: "Cet administrateur n'a pas de mot de passe enregistré." });
            }

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Mot de passe incorrect" });
            }

            res.status(200).json({ message: "Reconnexion réussie", admin });
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur de connexion" });
    }
});

module.exports = router;
