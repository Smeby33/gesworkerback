const express = require('express');
const db = require('../db');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const multer = require('multer');
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite à 10MB par fichier
  }
});
const fs = require('fs');
const path = require('path');

/**
 * @route GET /comments/task/:taskId
 * @description Récupère tous les commentaires d'une tâche spécifique avec leurs pièces jointes
//  */
// router.get('/recupertoutcomment/:taskId', async (req, res) => {
//     const taskId = req.params.taskId;

//     try {

//         // 2. Récupérer les commentaires avec les informations de l'auteur
//         const [comments] = await db.query(`
//             SELECT 
//                 c.id, 
//                 c.text, 
//                 c.created_at, 
//                 c.updated_at, 
//                 c.is_pinned,
//                 c.status,
//                 CASE 
//                     WHEN c.author_type = 'intervenant' THEN i.name
//                     ELSE u.name
//                 END as author_name,
//                 c.author_type
//             FROM comments c
//             LEFT JOIN intervenant i ON c.author_id = i.id AND c.author_type = 'intervenant'
//             LEFT JOIN users u ON c.author_id = u.id AND c.author_type = 'user'
//             ORDER BY c.is_pinned DESC, c.created_at DESC
//         `, [taskId]);

//         // 3. Récupérer les pièces jointes pour chaque commentaire
//         const commentsWithAttachments = await Promise.all(
//             comments.map(async comment => {
//                 const [attachments] = await db.query(`
//                     SELECT id, file_url, file_name, file_type 
//                     FROM comment_attachments 
//                     WHERE comment_id = ?
//                 `, [comment.id]);
                
//                 return {
//                     ...comment,
//                     created_at: moment(comment.created_at).format('YYYY-MM-DDTHH:mm'),
//                     updated_at: moment(comment.updated_at).format('YYYY-MM-DDTHH:mm'),
//                     attachments: attachments || []
//                 };
//             })
//         );

//         res.json(commentsWithAttachments);
//     } catch (error) {
//         console.error('Erreur:', error);
//         res.status(500).json({ 
//             error: 'Erreur lors de la récupération des commentaires',
//             details: error.message
//         });
//     }
// });

/**
 * @route GET /comments/:id
 * @description Récupère un commentaire spécifique par son ID
 */
router.get('/recupertoutcomment/:taskId', async (req, res) => {
    const taskId = req.params.taskId;

    try {
        // 1. Vérifier que la tâche existe
        const [task] = await db.query('SELECT id FROM tasks WHERE id = ?', [taskId]);
        if (task.length === 0) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }

        // 2. Récupérer les commentaires
        const [comments] = await db.query(`
            SELECT 
                c.id, 
                c.text, 
                c.created_at, 
                c.updated_at, 
                c.is_pinned,
                c.status,
                c.author_id,
                c.author_type,
                COALESCE(
                    CASE 
                        WHEN c.author_type = 'intervenant' THEN i.name
                        ELSE 'Administrateur'
                    END,
                    'Administrateur'
                ) as author_name
            FROM comments c
            LEFT JOIN intervenant i ON c.author_id = i.id AND c.author_type = 'intervenant'
            WHERE c.task_id = ?
            ORDER BY c.is_pinned DESC, c.created_at DESC
        `, [taskId]);

        // 3. Formater la réponse
        const commentsWithAttachments = await Promise.all(
            comments.map(async comment => {
                const [attachments] = await db.query(`
                    SELECT id, file_url, file_name, file_type 
                    FROM comment_attachments 
                    WHERE comment_id = ?
                `, [comment.id]);
                
                return {
                    ...comment,
                    created_at: moment(comment.created_at).format('YYYY-MM-DDTHH:mm'),
                    updated_at: moment(comment.updated_at).format('YYYY-MM-DDTHH:mm'),
                    attachments: attachments || []
                };
            })
        );

        res.json(commentsWithAttachments);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Aucunes infos',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});


router.post('/ajouteruncomment', upload.array('attachments'), async (req, res) => {
    const { taskId, authorId, authorType, text, parentId } = req.body; // Notez parentId ici
    const files = req.files || [];

    if (!taskId || !authorId || !text) {
        return res.status(400).json({ error: 'Les champs taskId, authorId et text sont requis' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Vérifier que la tâche existe
        const [task] = await connection.query('SELECT id FROM tasks WHERE id = ?', [taskId]);
        if (task.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }

        // 2. Créer le commentaire
        const commentId = uuidv4();
        await connection.query(`
            INSERT INTO comments (id, task_id, author_id, author_type, text, parent_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [commentId, taskId, authorId, authorType || 'intervenant', text, parentId || null]); // Utilisez parentId ici

        // 3. Gérer les pièces jointes (identique à votre code actuel)
        const attachments = [];
        if (files.length > 0) {
            for (const file of files) {
                const fileId = uuidv4();
                await connection.query(`
                    INSERT INTO comment_attachments (id, comment_id, file_url, file_name, file_type)
                    VALUES (?, ?, ?, ?, ?)
                `, [fileId, commentId, file.path, file.originalname, file.mimetype]);
                attachments.push({
                    id: fileId,
                    file_url: file.path,
                    file_name: file.originalname,
                    file_type: file.mimetype
                });
            }
        }

        await connection.commit();

        res.status(201).json({
            id: commentId,
            task_id: taskId,
            author_id: authorId,
            author_type: authorType || 'intervenant',
            text: text,
            parent_id: parentId || null, // Ajoutez ceci dans la réponse
            attachments: attachments,
            created_at: new Date().toISOString() // Ajoutez la date de création
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la création du commentaire',
            details: error.message
        });
    } finally {
        connection.release();
    }
});

router.put('/updateuncomment/:id', async (req, res) => {
    const commentId = req.params.id;
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Le champ text est requis' });
    }

    try {
        // Mettre à jour le commentaire
        const [result] = await db.query(`
            UPDATE comments 
            SET text = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [text, commentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Commentaire non trouvé' });
        }

        // Récupérer le commentaire mis à jour
        const [updatedComment] = await db.query('SELECT * FROM comments WHERE id = ?', [commentId]);
        const [attachments] = await db.query('SELECT * FROM comment_attachments WHERE comment_id = ?', [commentId]);

        res.json({
            ...updatedComment[0],
            attachments: attachments || []
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la mise à jour du commentaire',
            details: error.message
        });
    }
});

/**
 * @route DELETE /comments/:id
 * @description Supprime un commentaire et ses pièces jointes
 */
router.delete('/deleteuncomments/:id', async (req, res) => {
    const commentId = req.params.id;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Supprimer les pièces jointes associées
        await connection.query('DELETE FROM comment_attachments WHERE comment_id = ?', [commentId]);

        // 2. Supprimer le commentaire
        const [result] = await connection.query('DELETE FROM comments WHERE id = ?', [commentId]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Commentaire non trouvé' });
        }

        await connection.commit();
        res.json({ message: 'Commentaire supprimé avec succès' });
    } catch (error) {
        await connection.rollback();
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la suppression du commentaire',
            details: error.message
        });
    } finally {
        connection.release();
    }
});
// Route pour épingler/désépingler un commentaire
router.patch('/epingle/:id', async (req, res) => {
    const commentId = req.params.id;
    
    try {
      // Basculer l'état is_pinned
      const [result] = await db.query(`
        UPDATE comments 
        SET is_pinned = NOT is_pinned 
        WHERE id = ?
      `, [commentId]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Commentaire non trouvé' });
      }
  
      // Récupérer le commentaire mis à jour
      const [updatedComment] = await db.query('SELECT * FROM comments WHERE id = ?', [commentId]);
      res.json(updatedComment[0]);
    } catch (error) {
      res.status(500).json({ 
        error: 'Erreur lors de la modification du commentaire',
        details: error.message
      });
    }
  });

  /**
 * @route GET /comments/attachments/:id
 * @description Télécharge un fichier attaché à un commentaire
 */
router.get('/attachments/:id', async (req, res) => {
    try {
      const fileId = req.params.id;
      
      // 1. Récupérer les infos du fichier
      const [file] = await db.query(`
        SELECT file_url, file_name, file_type 
        FROM comment_attachments 
        WHERE id = ?
      `, [fileId]);
  
      if (!file || file.length === 0) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }
  
      const filePath = path.join(__dirname, '..', file[0].file_url);
      
      // 2. Vérifier que le fichier existe physiquement
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Fichier introuvable sur le serveur' });
      }
  
      // 3. Envoyer le fichier
      res.download(filePath, file[0].file_name, (err) => {
        if (err) {
          console.error('Erreur lors de l\'envoi du fichier:', err);
          res.status(500).json({ error: 'Erreur lors du téléchargement' });
        }
      });
  
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ 
        error: 'Erreur lors du téléchargement',
        details: error.message
      });
    }
  });

module.exports = router;