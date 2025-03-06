const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

// 🔹 Récupérer toutes les entreprises
const { v4: uuidv4 } = require('uuid');

// Récupérer tous les clients par le propriétaire
router.get("/client/:id", async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM clients WHERE proprietaire = ?";

  try {
    const [results] = await db.query(sql, [id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des entreprises", details: err.message });
  }
});

// Récupérer une entreprise par ID
router.get("/prendre/:id", async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM clients WHERE id = ?";

  try {
    const [result] = await db.query(sql, [id]);
    if (result.length === 0) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'entreprise", details: err.message });
  }
});

// Ajouter une entreprise
router.post("/ajout", async (req, res) => {
  const { company_name, contact, email, address, description, proprietaire } = req.body;

  if (!company_name || !contact || !email) {
    return res.status(400).json({ error: "Les champs obligatoires sont manquants" });
  }

  const id = uuidv4(); // Générer un ID unique
  const timestamp = new Date().toISOString();

  const sql = "INSERT INTO clients (id, company_name, contact, email, address, description, timestamp, proprietaire) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  try {
    const [result] = await db.query(sql, [id, company_name, contact, email, address, description, timestamp, proprietaire]);
    res.status(201).json({ message: "Entreprise ajoutée avec succès", id });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'ajout de l'entreprise", details: err.message });
  }
});

// Modifier une entreprise par ID
router.put("/modification/:id", async (req, res) => {
  const { id } = req.params;
  const { company_name, contact, email, address, description } = req.body;

  const sql = "UPDATE clients SET company_name = ?, contact = ?, email = ?, address = ?, description = ? WHERE id = ?";

  try {
    const [result] = await db.query(sql, [company_name, contact, email, address, description, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }
    res.json({ message: "Entreprise mise à jour avec succès" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'entreprise", details: err.message });
  }
});

module.exports = router;
