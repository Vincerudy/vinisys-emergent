const mongoose = require('mongoose');

const SocieteSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  statut: { type: String, default: 'active' },
  enable_facturation: { type: Boolean, default: true },
  enable_notes_frais: { type: Boolean, default: true },
  enable_achats: { type: Boolean, default: true },
  subscription_status: { type: String, default: 'active' },
  trial_start: { type: Date },
  trial_end: { type: Date },
  subscription_plan: { type: String, default: 'basic' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

SocieteSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Societe', SocieteSchema);