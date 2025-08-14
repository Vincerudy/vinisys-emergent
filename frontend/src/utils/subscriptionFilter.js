// Mapping des permissions du menu vers les fonctionnalités d'abonnement
export const SUBSCRIPTION_FEATURES_MAP = {
  // Facturation
  'view_quotes': 'facturation',
  'view_invoices': 'facturation', 
  'view_clients': 'facturation',
  'view_recette_page': 'recette',
  'manage_invoice_param': 'facturation',
  
  // Stock
  'view_stock': 'stock',
  'manage_stock': 'stock',
  'view_inventory': 'inventaire_manuel',
  'manage_inventory': 'inventaire_manuel',
  'import_products': 'import_produits',
  
  // Notes de frais (liées à facturation dans le plan Starter)
  'create_expense': 'facturation',
  'view_expenses': 'facturation',
  'validate_expenses': 'facturation',
  
  // Autres fonctionnalités toujours disponibles
  'view_dashboard': true,
  'view_profile': true,
  'view_settings': true
};

// Fonction pour filtrer le menu selon l'abonnement
export const filterMenuBySubscription = (menuItems, hasFeature) => {
  return menuItems.map(menuItem => {
    // Filtrer les sous-menus
    if (menuItem.dropdownMenu) {
      const filteredDropdown = menuItem.dropdownMenu.filter(subItem => {
        if (!subItem.permission) return true; // Si pas de permission, toujours visible
        
        const requiredFeature = SUBSCRIPTION_FEATURES_MAP[subItem.permission];
        if (requiredFeature === true) return true; // Toujours disponible
        if (!requiredFeature) return true; // Si pas mappé, disponible par défaut
        
        return hasFeature(requiredFeature);
      });
      
      // Si plus de sous-menus, masquer le menu principal
      if (filteredDropdown.length === 0) {
        return null;
      }
      
      return {
        ...menuItem,
        dropdownMenu: filteredDropdown
      };
    }
    
    // Pour les éléments de menu sans sous-menu
    if (menuItem.permission) {
      const requiredFeature = SUBSCRIPTION_FEATURES_MAP[menuItem.permission];
      if (requiredFeature === true) return menuItem;
      if (!requiredFeature) return menuItem;
      
      return hasFeature(requiredFeature) ? menuItem : null;
    }
    
    return menuItem;
  }).filter(Boolean); // Retirer les éléments null
};