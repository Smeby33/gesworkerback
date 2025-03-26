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
      // 1. Vérifier que l'intervenant existe
      const [intervenant] = await db.query('SELECT id FROM intervenant WHERE id = ?', [intervenantId]);
      if (intervenant.length === 0) {
        return res.status(404).json({ error: 'Intervenant non trouvé' });
      }
  
      // 2. Récupérer les tâches avec toutes les informations nécessaires
      const [tasks] = await db.query(`
        SELECT 
          t.id, 
          t.title, 
          c.company_name AS company,
          p.Type AS priorite,
          t.date_debut,
          t.date_fin,
          t.statut,
          t.timestamp,
          GROUP_CONCAT(DISTINCT cat.name SEPARATOR ', ') AS categories,
          GROUP_CONCAT(DISTINCT i.name SEPARATOR ', ') AS intervenants
        FROM tasks t
        JOIN clients c ON t.company = c.id
        JOIN priorité p ON t.priorite = p.id
        JOIN task_categories tc ON t.id = tc.task_id
        JOIN categories cat ON tc.category_id = cat.id
        JOIN task_intervenants ti ON t.id = ti.task_id
        JOIN intervenant i ON ti.intervenant_id = i.id
        WHERE ti.intervenant_id = ?
        GROUP BY t.id
        ORDER BY t.date_debut ASC
      `, [intervenantId]);
  
      // 3. Formater les dates pour le front-end
      const formattedTasks = tasks.map(task => ({
        ...task,
        date_debut: moment(task.date_debut).format('YYYY-MM-DDTHH:mm'),
        date_fin: moment(task.date_fin).format('YYYY-MM-DDTHH:mm'),
        categories: task.categories ? task.categories.split(', ') : [],
        intervenants: task.intervenants ? task.intervenants.split(', ') : []
      }));
  
      res.json(formattedTasks);
      
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des tâches',
        details: error.message
      });
    }
  });

  // Récupérer toutes les tâches d'un intervenant spécifique et ses intervenants
  router.get('/intervenantinters/:id', async (req, res) => {
    const intervenantId = req.params.id;

    try {
        // 1. Vérifier que l'intervenant existe (inchangé)
        const [intervenant] = await db.query('SELECT id FROM intervenant WHERE id = ?', [intervenantId]);
        if (intervenant.length === 0) {
            return res.status(404).json({ error: 'Intervenant non trouvé' });
        }

        // 2. Récupérer les tâches avec toutes les informations nécessaires (requête modifiée)
        const [tasks] = await db.query(`
            SELECT
                t.id,
                t.title,
                c.company_name AS company,
                p.Type AS priorite,
                t.date_debut,
                t.date_fin,
                t.statut,
                t.timestamp,
                GROUP_CONCAT(DISTINCT cat.name SEPARATOR ', ') AS categories,
                (
                    SELECT
                        GROUP_CONCAT(DISTINCT i2.name SEPARATOR ', ')
                    FROM
                        task_intervenants ti2
                    JOIN
                        intervenant i2 ON ti2.intervenant_id = i2.id
                    WHERE
                        ti2.task_id = t.id
                ) AS all_intervenants
            FROM
                tasks t
            JOIN
                clients c ON t.company = c.id
            JOIN
                priorité p ON t.priorite = p.id
            JOIN
                task_categories tc ON t.id = tc.task_id
            JOIN
                categories cat ON tc.category_id = cat.id
            WHERE
                t.id IN (SELECT task_id FROM task_intervenants WHERE intervenant_id = ?)
            GROUP BY
                t.id
            ORDER BY
                t.date_debut ASC;
        `, [intervenantId]);

        // 3. Formater les dates et les intervenants pour le front-end (légèrement modifié)
        const formattedTasks = tasks.map(task => ({
            ...task,
            date_debut: moment(task.date_debut).format('YYYY-MM-DDTHH:mm'),
            date_fin: moment(task.date_fin).format('YYYY-MM-DDTHH:mm'),
            categories: task.categories ? task.categories.split(', ') : [],
            intervenants: task.all_intervenants ? task.all_intervenants.split(', ') : [] // Utiliser all_intervenants
        }));

        res.json(formattedTasks);

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            error: 'Erreur lors de la récupération des tâches',
            details: error.message
        });
    }
});

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
