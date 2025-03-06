const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

// ✅ 1️⃣ Récupérer tous les intervenants
// Récupérer tous les intervenants par le propriétaire
router.get("/recuperertout/:id", async (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM intervenant WHERE proprietaire = ?";
    
    try {
      const [results] = await db.query(sql, [id]);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: "Erreur lors de la récupération des intervenants", details: err });
    }
  });
  
  // Récupérer un intervenant par son ID
  router.get("/recupererun/:id", async (req, res) => {
    const { id } = req.params;
    const sql = "SELECT id, name, email, phone, role, profile_picture, timestamp FROM intervenant WHERE id = ?";
    
    try {
      const [result] = await db.query(sql, [id]);
      if (result.length === 0) {
        return res.status(404).json({ error: "Intervenant non trouvé" });
      }
      res.json(result[0]);
    } catch (err) {
      res.status(500).json({ error: "Erreur lors de la récupération de l'intervenant", details: err });
    }
});

  
router.post("/ajouterun", async (req, res) => {
  const { id, name, email, phone, role, password, profile_picture, proprietaire } = req.body;
  const timestamp = Date.now();

  if (!id || !name || !email || !password || !proprietaire) {
    return res.status(400).json({ error: "Les champs obligatoires sont manquants" });
  }

  try {
    // Hasher le mot de passe avant l'insertion

    const sql = "INSERT INTO intervenant (id, name, email, phone, role, password, profile_picture, timestamp, proprietaire) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    await db.query(sql, [id, name, email, phone, role, password, profile_picture, timestamp, proprietaire]);

    res.status(201).json({ message: "Intervenant ajouté avec succès", id });
  } catch (err) {
    console.error("Erreur lors de l'ajout de l'intervenant:", err); // Log dans la console
    res.status(500).json({ error: "Erreur lors de l'ajout de l'intervenant", details: err.message }); // Retourner l'erreur détaillée
  }
});


  
  
  // Modifier un intervenant
  router.put("/modifierun/:id", async (req, res) => {
    const { id } = req.params;
    let { name, email, phone, role, password, profile_picture } = req.body;
  
    try {
      let sql = "UPDATE intervenant SET name = ?, email = ?, phone = ?, role = ?, profile_picture = ? WHERE id = ?";
      let params = [name, email, phone, role, profile_picture, id];

      // Si un nouveau mot de passe est fourni, on le hash avant mise à jour
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        sql = "UPDATE intervenant SET name = ?, email = ?, phone = ?, role = ?, password = ?, profile_picture = ? WHERE id = ?";
        params = [name, email, phone, role, hashedPassword, profile_picture, id];
      }

      const [result] = await db.query(sql, params);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Intervenant non trouvé" });
      }
      res.json({ message: "Intervenant mis à jour avec succès" });
    } catch (err) {
      res.status(500).json({ error: "Erreur lors de la mise à jour de l'intervenant", details: err });
    }
});

  
  // Supprimer un intervenant
  router.delete("/suprimerun/:id", async (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM intervenant WHERE id = ?";
  
    try {
      const [result] = await db.query(sql, [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Intervenant non trouvé" });
      }
      res.json({ message: "Intervenant supprimé avec succès" });
    } catch (err) {
      res.status(500).json({ error: "Erreur lors de la suppression de l'intervenant", details: err });
    }
  });
  
  // Supprimer tous les intervenants
  router.delete("/suprimertout", async (req, res) => {
    const sql = "DELETE FROM intervenant";
  
    try {
      await db.query(sql);
      res.json({ message: "Tous les intervenants ont été supprimés" });
    } catch (err) {
      res.status(500).json({ error: "Erreur lors de la suppression des intervenants", details: err });
    }
  });
  
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    try {
      // Récupérer l'utilisateur avec son email
      const sql = "SELECT id, name, email, password FROM intervenant WHERE email = ?";
      const [users] = await db.query(sql, [email]);

      if (users.length === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      const user = users[0];

      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Mot de passe incorrect" });
      }

      // Supprimer le mot de passe avant de renvoyer les infos
      delete user.password;

      res.json({ message: "Connexion réussie", user });
    } catch (err) {
      res.status(500).json({ error: "Erreur lors de la connexion", details: err });
    }
});


module.exports = router;
