const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

router.get("/toutlesadmins", async (req, res) => {
  try {
      const [users] = await db.query("SELECT * FROM users"); // Utilise `await` au lieu d'une callback
      res.json(users);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});
  
  // 📌 2. Récupérer un utilisateur par ID
  // 📌 1. Récupérer un administrateur par ID
router.get("/recupereradmin/:id", async (req, res) => {
  try {
      const userId = req.params.id;
      const [results] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

      if (results.length === 0) {
          return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      res.json(results[0]);
  } catch (err) {
      res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
  }
});

// 📌 2. Ajouter un administrateur
router.post("/ajouteradmin", async (req, res) => {
  try {
      const { id, username, email, password, is_admin, company_name, profile_picture } = req.body;

      if (!id || !username || !email || !password) {
          return res.status(400).json({ error: "Veuillez remplir tous les champs obligatoires" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await db.query(
          "INSERT INTO users (id, username, email, password, is_admin, company_name, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [id, username, email, hashedPassword, is_admin || 0, company_name || null, profile_picture || null]
      );

      res.status(201).json({ message: "Utilisateur ajouté avec succès" });
  } catch (err) {
      res.status(500).json({ error: "Erreur lors de l'ajout de l'utilisateur" });
  }
});

// 📌 3. Modifier un administrateur
router.put("/modifieradmin/:id", async (req, res) => {
  try {
      const userId = req.params.id;
      const { username, email, password, is_admin, company_name, profile_picture } = req.body;

      let hashedPassword = null;
      if (password) {
          hashedPassword = await bcrypt.hash(password, 10);
      }

      const [result] = await db.query(
          "UPDATE users SET username = ?, email = ?, password = COALESCE(?, password), is_admin = ?, company_name = ?, profile_picture = ? WHERE id = ?",
          [username, email, hashedPassword, is_admin, company_name, profile_picture, userId]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      res.json({ message: "Utilisateur mis à jour avec succès" });
  } catch (err) {
      res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
  }
});

// 📌 4. Supprimer un administrateur
router.delete("/supprimeradmin/:id", async (req, res) => {
  try {
      const userId = req.params.id;
      const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
      res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
  }
});
module.exports = router;
