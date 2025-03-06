const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

// 📌 Récupérer toutes les catégories
// Récupérer toutes les catégories
router.get("/toutescategories", async (req, res) => {
  const sql = "SELECT * FROM categories";
  
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer une seule catégorie par ID
router.get("/unecategorie/:id", async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM categories WHERE id = ?";
  
  try {
    const [results] = await db.query(sql, [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter une nouvelle catégorie
router.post("/ajouterunecategorie", async (req, res) => {
  const { name, icon } = req.body;
  
  if (!name || !icon) {
    return res.status(400).json({ message: "Nom et icône requis" });
  }

  const sql = "INSERT INTO categories (name, icon) VALUES (?, ?)";
  
  try {
    const [result] = await db.query(sql, [name, icon]);
    res.status(201).json({ id: result.insertId, name, icon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modifier une catégorie existante
router.put("/modifierunegategorie/:id", async (req, res) => {
  const { id } = req.params;
  const { name, icon } = req.body;

  const sql = "UPDATE categories SET name = ?, icon = ? WHERE id = ?";
  
  try {
    const [result] = await db.query(sql, [name, icon, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.json({ message: "Catégorie mise à jour avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer une catégorie
router.delete("/suprimerunecategorie/:id", async (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM categories WHERE id = ?";
  
  try {
    const [result] = await db.query(sql, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.json({ message: "Catégorie supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
  
  
module.exports = router;
