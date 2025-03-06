const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');



const router = express.Router();

// Récupérer toutes les tâches d'une entreprise spécifique
router.get('/tasks-by-owner/:ownerId', async (req, res) => {
    const ownerId = parseInt(req.params.ownerId, 10);

    if (isNaN(ownerId)) {
        return res.status(400).json({ error: "L'ID du propriétaire est invalide" });
    }

    try {
        const query = `
           SELECT 
            t.id, t.title, t.date_debut, t.date_fin, t.statut, t.priorite,
            c.company_name AS company,
            IFNULL(GROUP_CONCAT(DISTINCT cat.name), '') AS categories,
            IFNULL(GROUP_CONCAT(DISTINCT i.name), '') AS intervenants
        FROM tasks t
        JOIN clients c ON t.company = c.id
        LEFT JOIN task_categories tc ON t.id = tc.task_id
        LEFT JOIN categories cat ON tc.category_id = cat.id
        LEFT JOIN task_intervenants ti ON t.id = ti.task_id
        LEFT JOIN intervenant i ON ti.intervenant_id = i.id
        WHERE c.proprietaire = ?
        GROUP BY t.id
        ORDER BY t.date_debut DESC;


        `;

        const [tasks] = await db.query(query, [ownerId]);

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Aucune tâche trouvée pour cet utilisateur' });
        }

        res.json(tasks);
    } catch (error) {
        console.error('Erreur SQL :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des tâches', details: error.message });
    }
});



const generateTaskId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let taskId = '';
    for (let i = 0; i < 11; i++) {
        taskId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return taskId;
};
const moment = require('moment');


// ✅ Route pour ajouter une tâche
router.post('/add-task', async (req, res) => {
    try {
        // 🔹 Récupération des données du front-end
        let { title, company, priorite, categories, intervenants, date_debut, date_fin, statut } = req.body;

        // 🔹 Vérifications des champs obligatoires
        if (!title || !company || !priorite || !categories.length || !intervenants.length || !date_debut || !date_fin) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        if (!Array.isArray(categories) || !Array.isArray(intervenants)) {
            return res.status(400).json({ error: 'Les catégories et les intervenants doivent être des tableaux' });
        }

        if (!moment(date_debut, 'YYYY-MM-DDTHH:mm', true).isValid() || 
            !moment(date_fin, 'YYYY-MM-DDTHH:mm', true).isValid()) {
            return res.status(400).json({ error: 'Les dates doivent être au format YYYY-MM-DDTHH:mm' });
        }

        // 🔹 Formatage des dates
        const formattedDateDebut = moment(date_debut, "YYYY-MM-DDTHH:mm").format('YYYY-MM-DD HH:mm:ss');
        const formattedDateFin = moment(date_fin, "YYYY-MM-DDTHH:mm").format('YYYY-MM-DD HH:mm:ss');

        // 🔹 Vérification de la priorité (conversion texte → ID)
        if (isNaN(priorite)) {
            const [result] = await db.query("SELECT id FROM priorité WHERE Type = ?", [priorite]);
            if (result.length === 0) {
                return res.status(400).json({ error: "Priorité invalide" });
            }
            priorite = result[0].id;
        }

        // 🔹 Vérification de l'entreprise (conversion nom → ID)
        const [companyData] = await db.query("SELECT id FROM clients WHERE company_name = ?", [company]);
        if (companyData.length === 0) {
            return res.status(400).json({ error: "L'entreprise spécifiée n'existe pas" });
        }
        company = companyData[0].id;

        // 🔹 Génération d’un ID unique et timestamp
        const taskId = generateTaskId();
        const timestamp = Date.now();

        // 🔹 Insérer la tâche dans `tasks`
        await db.query(`
            INSERT INTO tasks (id, title, company, priorite, date_debut, date_fin, statut, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [taskId, title, company, priorite, formattedDateDebut, formattedDateFin, statut, timestamp]);

        // 🔹 Récupération des IDs des catégories
        const categoryIds = [];
        for (const categoryName of categories) {
            const [categoryResult] = await db.query("SELECT id FROM categories WHERE name = ?", [categoryName]);
            if (categoryResult.length === 0) {
                return res.status(400).json({ error: `Catégorie '${categoryName}' invalide` });
            }
            categoryIds.push(categoryResult[0].id);
        }

        // 🔹 Insertion dans `task_categories`
        for (const categoryId of categoryIds) {
            await db.query(`
                INSERT INTO task_categories (task_id, category_id, sous_statut)
                VALUES (?, ?, ?)
            `, [taskId, categoryId, 'En attente']);
        }

        // 🔹 Récupération des IDs des intervenants
        const intervenantIds = [];
        for (const intervenantName of intervenants) {
            const [intervenantResult] = await db.query("SELECT id FROM intervenant WHERE name = ?", [intervenantName]);
            if (intervenantResult.length === 0) {
                return res.status(400).json({ error: `Intervenant '${intervenantName}' invalide` });
            }
            intervenantIds.push(intervenantResult[0].id);
        }

        // 🔹 Insertion dans `task_intervenants`
        for (const intervenantId of intervenantIds) {
            await db.query(`
                INSERT INTO task_intervenants (task_id, intervenant_id)
                VALUES (?, ?)
            `, [taskId, intervenantId]);
        }

        // ✅ Réponse de succès
        res.status(201).json({ message: 'Tâche ajoutée avec succès', taskId });

    } catch (error) {
        console.error("Erreur MySQL :", error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la tâche', details: error.sqlMessage });
    }
});






// Récupérer une tâche spécifique par son ID
router.get('/:id', async (req, res) => {
  const taskId = req.params.id;
  try {
      const [task] = await db.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
      if (task.length === 0) {
          return res.status(404).json({ error: 'Tâche non trouvée' });
      }
      res.json(task[0]);
  } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération de la tâche' });
  }
});

// Récupérer toutes les tâches d'un intervenant spécifique
router.get('/intervenant/:id', async (req, res) => {
  const intervenantId = req.params.id;
  try {
      const [tasks] = await db.query('SELECT * FROM tasks WHERE intervenants = ?', [intervenantId]);
      res.json(tasks);
  } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
  }
});

// Modifier une tâche
router.put('/:id', async (req, res) => {
  const taskId = req.params.id;
  const { title, categories, Priorité, intervenants, company, date_debut, date_fin, statut } = req.body;
  try {
      await db.query(
          'UPDATE tasks SET title = ?, categories = ?, Priorité = ?, intervenants = ?, company = ?, date_debut = ?, date_fin = ?, statut = ? WHERE id = ?',
          [title, categories, Priorité, intervenants, company, date_debut, date_fin, statut, taskId]
      );
      res.json({ message: 'Tâche mise à jour avec succès' });
  } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la tâche' });
  }
});

// Supprimer une tâche
router.delete('/:id', async (req, res) => {
  const taskId = req.params.id;
  try {
      await db.query('DELETE FROM tasks WHERE id = ?', [taskId]);
      res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la suppression de la tâche' });
  }
});

//route pour compter les taches 
router.get('/count-tasks/:ownerId', async (req, res) => {
  const ownerId = req.params.ownerId;

  try {
      const query = `
          SELECT COUNT(*) AS total 
          FROM tasks
          JOIN clients ON tasks.company = clients.id
          WHERE clients.proprietaire = ?
      `;

      console.log("Requête SQL exécutée :", query);
      console.log("Valeur de ownerId :", ownerId);

      const [rows] = await db.query(query, [ownerId]);
      res.json({ total: rows[0].total });
  } catch (error) {
      console.error('Erreur lors du comptage des tâches:', error);
      res.status(500).json({ error: 'Erreur lors du comptage des tâches', details: error.message });
  }
});


  
module.exports = router;
