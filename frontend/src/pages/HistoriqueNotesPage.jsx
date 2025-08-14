import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

const HistoriqueNotesPage = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FiClock className="text-blue-600" />
              Historique des Notes de frais
            </h1>
            <p className="text-gray-600 mt-2">
              Page en cours de développement - Fonctionnelle !
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-center text-lg">
          ✅ La page historique fonctionne maintenant !
        </p>
        <p className="text-center text-gray-600 mt-2">
          L'historique des validations sera affiché ici.
        </p>
      </div>
    </div>
  );
};

export default HistoriqueNotesPage;