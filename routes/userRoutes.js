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


// 📌 Recuperer un utilisateur
// 📌 Récupérer un utilisateur par son ID (varchar)
router.get('/getUser/:id', async (req, res) => {
    const userId = req.params.id;
    console.log("🔍 Début de la requête pour l'ID :", userId);

    const query = 'SELECT id, username, email,password,company_name, is_admin,profile_picture FROM users WHERE id = ? LIMIT 1';

    try {
        // Utilisation de async/await avec pool de connexion
        const [results] = await db.query(query, [userId]);
        console.log("✅ Résultat SQL :", results);

        if (results.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.status(200).json(results[0]); // Renvoie l'utilisateur trouvé
        console.log("📤 Réponse envoyée :", results[0]);
    } catch (err) {
        console.error("❌ Erreur SQL :", err);
        res.status(500).json({ error: "Une erreur interne est survenue." });
    }
});




// 📌 Ajouter un utilisateur
router.post('/addUser', async (req, res) => {
    console.log("🚀 Requête reçue :", req.body);

    try {
        const { id, username, email, password, is_admin, company_name, profile_picture } = req.body;

        // Vérifier si les champs obligatoires sont fournis
        if (!id || !username || !email) {
            console.log("❌ Erreur - Champs obligatoires manquants");
            return res.status(400).json({ error: "ID, username et email sont requis." });
        }

        // Vérification du mot de passe pour les admins
        let hashedPassword = null;
        if (is_admin) {
            if (!password) {
                console.log("❌ Erreur - Un mot de passe est requis pour les administrateurs");
                return res.status(400).json({ error: "Le mot de passe est obligatoire pour un administrateur." });
            }
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Exécution de la requête SQL
        const query = `
            INSERT INTO users (id, username, email, password, is_admin, company_name, profile_picture)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            id,
            username,
            email,
            hashedPassword, // null si ce n'est pas un admin
            is_admin || 0,
            company_name || null,
            profile_picture || null
        ];

        const [result] = await db.query(query, values);

        console.log("✅ Utilisateur ajouté avec succès :", result.insertId);
        res.status(201).json({ message: "Utilisateur ajouté avec succès", id: result.insertId });

    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
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
