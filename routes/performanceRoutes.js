const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/add', async (req, res) => {
    try {
        const { username, total, completed, in_progress, cancelled, progress, proprietaire } = req.body;

        // 1. Vérification de l'intervenant
        const [user] = await db.query(
          "SELECT name FROM intervenant WHERE id = ? OR name = ?", 
          [username, username]
        );

        if (!user.length) {
            return res.status(400).json({ error: "Intervenant non trouvé" });
        }

        const intervenantName = user[0].name;

        // 2. Suppression des anciennes performances
        await db.query(
          "DELETE FROM performance WHERE username = ?",
          [intervenantName]
        );

        // 3. Insertion de la nouvelle performance
        await db.query(`
            INSERT INTO performance (username, total, completed, in_progress, cancelled, progress,proprietaire)
            VALUES (?, ?, ?, ?, ?, ?,?)
        `, [intervenantName, total, completed, in_progress, cancelled, progress,proprietaire]);

        res.status(201).json({ 
          message: "Performance mise à jour avec succès",
          replaced: true // Indique qu'un remplacement a eu lieu
        });

    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).json({ 
          error: "Erreur serveur", 
          details: error.sqlMessage || error.message 
        });
    }
});

// ✅ Récupérer toutes les performances
router.get('/all/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [performances] = await db.query("SELECT * FROM performance WHERE proprietaire=?",[id]);

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
