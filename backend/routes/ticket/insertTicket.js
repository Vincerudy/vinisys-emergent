const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const isAuthenticated = require('../midleware/authMiddleware');

router.post('/tickets/create', isAuthenticated, async (req, res) => {
  const societe_id = req.user.societe_id;
  const {
    description,
    reason,
    status,
    title,
    user_id, // l'utilisateur qui a créé
    // priority // ajoute si besoin
  } = req.body;

  // Validation simple des champs obligatoires (retirer priority si non utilisé)
  if (!title || !description || !status) {
    return res.status(400).json({ message: 'Certains champs obligatoires sont manquants.' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO tickets 
       (title, description, reason, status, user_id, societe_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?,  NOW())`,
      [title, description, reason, status, user_id || null, societe_id]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Ticket créé avec succès',
      ticketId: result.insertId,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erreur lors de la création du ticket :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  } finally {
    connection.release();
  }
});

router.post('/tickets/update/:id', isAuthenticated, async (req, res) => {
    const ticketId = req.params.id;
    const societe_id = req.user.societe_id;
    const {
      title,
      description,
      reason,
      status
      // priority // à ajouter si utilisé dans ta BDD
    } = req.body;
  
    // Validation des champs obligatoires
    if (!title || !description || !status) {
      return res.status(400).json({ message: 'Certains champs obligatoires sont manquants.' });
    }
  
    const connection = await db.getConnection();
  
    try {
      await connection.beginTransaction();
  
      // Vérifie si le ticket existe et appartient à la même société
      const [existingTicket] = await connection.query(
        'SELECT * FROM tickets WHERE id = ? AND societe_id = ?',
        [ticketId, societe_id]
      );
  
      if (existingTicket.length === 0) {
        return res.status(404).json({ message: 'Ticket introuvable ou accès non autorisé.' });
      }
  
      // Mise à jour du ticket
      await connection.query(
        `UPDATE tickets
         SET title = ?, description = ?, reason = ?, status = ?, updated_at = NOW()
         WHERE id = ? AND societe_id = ?`,
        [title, description, reason, status, ticketId, societe_id]
      );
  
      await connection.commit();
  
      res.status(200).json({ message: 'Ticket mis à jour avec succès.' });
    } catch (error) {
      await connection.rollback();
      console.error('Erreur lors de la mise à jour du ticket :', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
      connection.release();
    }
  });

  router.post('/maintenance/tickets/update/:id', isAuthenticated, async (req, res) => {
    const ticketId = req.params.id;
  
    const {
      title,
      description,
      reason,
      status
      // priority // à ajouter si utilisé dans ta BDD
    } = req.body;
  
    // Validation des champs obligatoires
    if (!title || !description || !status) {
      return res.status(400).json({ message: 'Certains champs obligatoires sont manquants.' });
    }
  
    const connection = await db.getConnection();
  
    try {
      await connection.beginTransaction();
  
      // Vérifie si le ticket existe et appartient à la même société
      const [existingTicket] = await connection.query(
        'SELECT * FROM tickets WHERE id = ?',
        [ticketId]
      );
  
      if (existingTicket.length === 0) {
        return res.status(404).json({ message: 'Ticket introuvable ou accès non autorisé.' });
      }
  
      // Mise à jour du ticket
      await connection.query(
        `UPDATE tickets
         SET title = ?, description = ?, reason = ?, status = ?, updated_at = NOW()
         WHERE id = ?`,
        [title, description, reason, status, ticketId]
      );
  
      await connection.commit();
  
      res.status(200).json({ message: 'Ticket mis à jour avec succès.' });
    } catch (error) {
      await connection.rollback();
      console.error('Erreur lors de la mise à jour du ticket :', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
      connection.release();
    }
  });

module.exports = router;
