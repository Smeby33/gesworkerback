const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

// 📌 Récupérer toutes les catégories
// Récupérer toutes les priorités
router.get("/toutesprioritys", async (req, res) => {
  const sql = "SELECT * FROM priorité";

  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  
module.exports = router;
