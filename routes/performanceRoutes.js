const express = require('express');
const db = require('../db');

const router = express.Router();

// ✅ Ajouter une performance
router.post('/add', async (req, res) => {
    try {
        const { username, total, completed, in_progress, cancelled, progress } = req.body;

        console.log("📥 Données reçues :", req.body); // Debug des données reçues

        // Vérifier si l'intervenant existe
        const [userExists] = await db.query("SELECT id FROM intervenant WHERE id = ?", [username]);

        console.log("🔍 Résultat de la vérification de l'intervenant :", userExists);

        if (userExists.length === 0) {
            return res.status(400).json({ error: "L'intervenant spécifié n'existe pas." });
        }

        // Insérer les données dans la table `performance`
        await db.query(`
            INSERT INTO performance (username, total, completed, in_progress, cancelled, progress)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [username, total, completed, in_progress, cancelled, progress]);

        console.log("✅ Performance ajoutée avec succès !");
        res.status(201).json({ message: "Performance ajoutée avec succès." });

    } catch (error) {
        console.error("❌ Erreur MySQL :", error);
        res.status(500).json({ error: "Erreur lors de l'ajout de la performance", details: error.sqlMessage });
    }
});


// ✅ Récupérer toutes les performances
router.get('/all', async (req, res) => {
    try {
        const [performances] = await db.query("SELECT * FROM performance ORDER BY progress DESC");

        if (performances.length === 0) {
            return res.status(404).json({ message: "Aucune performance trouvée." });
        }

        res.json(performances);
    } catch (error) {
        console.error("Erreur MySQL :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des performances", details: error.sqlMessage });
    }
});

// ✅ Récupérer la performance d'un individu spécifique
router.get('/performanceduninter/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [performance] = await db.query("SELECT * FROM performance WHERE id = ?", [id]);

        if (performance.length === 0) {
            return res.status(404).json({ error: "Aucune performance trouvée pour cet intervenant." });
        }

        res.json(performance[0]);
    } catch (error) {
        console.error("Erreur MySQL :", error);
        res.status(500).json({ error: "Erreur lors de la récupération de la performance", details: error.sqlMessage });
    }
});

module.exports = router;
