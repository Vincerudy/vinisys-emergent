// Test de syntaxe simplifié pour les types de frais
const express = require('express');
const mysql = require('mysql2');

const app = express();

// Test API simple
app.get('/api/types-frais/test', async (req, res) => {
    try {
        res.json({ 
            success: true,
            message: 'API Test OK'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

console.log('Test syntax file loaded successfully');