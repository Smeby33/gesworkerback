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
            IFNULL(GROUP_CONCAT(DISTINCT cat.name), '[]') AS categories,
            IFNULL(GROUP_CONCAT(DISTINCT i.name), '[]') AS intervenants
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
// router.put('/updatestatus/:id', async (req, res) => { 
//     const taskId = req.params.id;
//     const { statut } = req.body;

//     if (!taskId || !statut) {
//         return res.status(400).json({ error: 'ID et statut sont requis' });
//     }

//     try {
//         const [result] = await db.query(
//             'UPDATE tasks SET statut = ? WHERE id = ?',
//             [statut, taskId]
//         );

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: 'Tâche non trouvée' });
//         }

//         res.json({ message: 'Statut mis à jour avec succès', id: taskId, statut });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
//     }
// });
// router.put('/updatestatus/:id', async (req, res) => {
//     const taskId = req.params.id;
//     const { statut, categories } = req.body;

//     if (!taskId || !statut) {
//         return res.status(400).json({ error: 'ID et statut sont requis' });
//     }

//     const connection = await db.getConnection(); // Obtenir une connexion depuis le pool
//     try {
//         await connection.beginTransaction(); // Début de la transaction

//         // 1. Mise à jour du statut de la tâche
//         const [result] = await connection.execute(
//             'UPDATE tasks SET statut = ? WHERE id = ?',
//             [statut, taskId]
//         );

//         if (result.affectedRows === 0) {
//             await connection.rollback();
//             return res.status(404).json({ error: 'Tâche non trouvée' });
//         }

//         // 2. Mise à jour des sous-statuts des catégories si la liste est fournie
//         if (categories && Array.isArray(categories)) {
//             for (const { category_id, sous_statut } of categories) {
//                 await connection.execute(
//                     'UPDATE task_categories SET sous_statut = ? WHERE task_id = ? AND category_id = ?',
//                     [sous_statut, taskId, category_id]
//                 );
//             }
//         }

//         await connection.commit(); // Valider la transaction
//         res.json({ message: 'Mise à jour réussie', id: taskId, statut, categories });
//     } catch (error) {
//         await connection.rollback(); // Annuler les changements en cas d'erreur
//         console.error(error);
//         res.status(500).json({ error: 'Erreur lors de la mise à jour' });
//     } finally {
//         connection.release(); // Libérer la connexion
//     }
// });

router.put('/updatestatus/:id', async (req, res) => {
    const taskId = req.params.id;
    const { statut, categories } = req.body;
    console.log('Body reçu:', req.body);
    console.log('Paramètre ID:', req.params.id);

    if (!taskId || !statut) {
        return res.status(400).json({ error: 'ID et statut sont requis' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Mise à jour du statut de la tâche
        const [result] = await connection.execute(
            'UPDATE tasks SET statut = ? WHERE id = ?',
            [statut, taskId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }

        // Vérifier et récupérer les ID des catégories
        if (categories && Array.isArray(categories) && categories.length > 0) {
            const categoryNames = categories.map(cat => cat.name);
            const placeholders = categoryNames.map(() => '?').join(','); // éviter IN (?)
            
            const [categoryRows] = await connection.execute(
                `SELECT id, name FROM categories WHERE name IN (${placeholders})`,
                categoryNames
            );

            if (categoryRows.length === 0) {
                await connection.rollback();
                return res.status(400).json({ error: 'Aucune catégorie trouvée' });
            }

            // Associer chaque catégorie à son ID
            const categoryMap = {};
            categoryRows.forEach(row => {
                categoryMap[row.name] = row.id;
            });

            // Identifier les catégories non trouvées
            const notFoundCategories = categoryNames.filter(name => !categoryMap[name]);
            if (notFoundCategories.length > 0) {
                console.warn(`⚠️ Catégories non trouvées: ${notFoundCategories.join(', ')}`);
            }

            // Mise à jour des sous-statuts des catégories
            for (const category of categories) {
                const categoryId = categoryMap[category.name];
                if (!categoryId) {
                    console.warn(`⛔ Catégorie ignorée : ${category.name} (ID introuvable)`);
                    continue;
                }

                console.log(`✅ Mise à jour de la catégorie ${category.name} (ID: ${categoryId}) avec sous-statut ${category.sousStatut} pour la tâche ${taskId}`);

                const [updateCategoryResult] = await connection.execute(
                    'UPDATE task_categories SET sous_statut = ? WHERE task_id = ? AND category_id = ?',
                    [category.sousStatut, taskId, categoryId]
                );

                console.log("Résultat de la mise à jour :", updateCategoryResult);
            }
        }

        await connection.commit();
        res.json({ message: 'Mise à jour réussie', id: taskId, statut, categories });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    } finally {
        connection.release();
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
