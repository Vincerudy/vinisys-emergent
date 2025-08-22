const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  mail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  societe_id: { type: Number, required: true },
  active: { type: Boolean, default: true },
  role: { type: String, default: 'user' },
  permissions: { type: Array, default: [] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Middleware pour mettre à jour updated_at
UserSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('User', UserSchema);