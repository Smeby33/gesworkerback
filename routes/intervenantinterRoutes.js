const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();



// ✅ 1️⃣ Récupérer tous les intervenants
// Route pour récupérer les intervenants par propriétaire
// Récupérer tous les intervenants d'un même propriétaire
router.get("/mesintervenants/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        // 1. Vérifier que l'intervenant existe
        const [intervenant] = await db.query(
            'SELECT id, proprietaire FROM intervenant WHERE id = ?', 
            [id]
        );
        
        if (intervenant.length === 0) {
            return res.status(404).json({ error: "Intervenant non trouvé" });
        }

        const proprietaireId = intervenant[0].proprietaire;

        // 2. Récupérer les intervenants avec tâches communes
        const [intervenants] = await db.query(`
            SELECT DISTINCT i.id, i.name, i.email, i.phone, i.role, i.profile_picture, i.timestamp
            FROM intervenant i
            JOIN task_intervenants ti ON i.id = ti.intervenant_id
            WHERE i.proprietaire = ?
            AND i.id != ?
            AND EXISTS (
                SELECT 1 FROM task_intervenants ti2
                WHERE ti2.task_id = ti.task_id
                AND ti2.intervenant_id = ?
            )
            ORDER BY i.name ASC
        `, [proprietaireId, id, id]);

        res.json({
            success: true,
            data: intervenants,
            count: intervenants.length
        });

    } catch (err) {
        console.error("Erreur:", err);
        res.status(500).json({ 
            success: false,
            error: "Erreur lors de la récupération des intervenants", 
            details: err.message 
        });
    }
});
//recuperer les entreprise d'un intervenant 
router.get("/entreprises/intervenant/:id", async (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT DISTINCT c.id, c.company_name, c.contact, c.email, c.address, c.description
        FROM clients c
        JOIN tasks t ON c.id = t.company
        JOIN task_intervenants ti ON t.id = ti.task_id
        WHERE ti.intervenant_id = ?;
    `;

    try {
        const [results] = await db.query(sql, [id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ 
            error: "Erreur lors de la récupération des entreprises",
            details: err.message 
        });
    }
});

//recuperer toutes les tahces par company 
router.get("/tasks/company/:id", async (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT 
            t.id, t.title, t.date_debut, t.date_fin, t.statut, t.timestamp,
            p.Type AS priorite,
            GROUP_CONCAT(DISTINCT c.name) AS categories,
            GROUP_CONCAT(DISTINCT i.name) AS intervenants
        FROM tasks t
        LEFT JOIN priorité p ON t.priorite = p.id
        LEFT JOIN task_categories tc ON t.id = tc.task_id
        LEFT JOIN categories c ON tc.category_id = c.id
        LEFT JOIN task_intervenants ti ON t.id = ti.task_id
        LEFT JOIN intervenant i ON ti.intervenant_id = i.id
        WHERE t.company = ?
        GROUP BY t.id
    `;

    try {
        const [results] = await db.query(sql, [id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ 
            error: "Erreur lors de la récupération des tâches", 
            details: err.message 
        });
    }
});


module.exports = router;
