// Mapping des permissions du menu vers les fonctionnalités d'abonnement
export const SUBSCRIPTION_FEATURES_MAP = {
  // Facturation - Disponible pour tous les plans
  'view_quotes': 'facturation',
  'view_invoices': 'facturation', 
  'view_clients': 'facturation',
  'manage_invoice_param': 'facturation',
  
  // Notes de frais - Seulement plans payants
  'create_expense': 'notes_frais',
  'view_expenses': 'notes_frais',
  'validate_expenses': 'notes_frais',
  'manage_expense_categories': 'notes_frais',
  'view_notes_frais': 'notes_frais',
  
  // Dépenses - Seulement plans payants
  'view_purchases': 'depenses',
  'create_purchase': 'depenses',
  'manage_suppliers': 'depenses',
  'view_depenses': 'depenses',
  
  // Rapport financier - Seulement plans payants
  'view_reports': 'rapport_financier',
  'access_reports': 'rapport_financier',
  
  // Recette - Seulement plans Pro et plus
  'view_recette_page': 'recette',
  
  // Stock - Seulement plans Pro et plus
  'create_product': 'stock',
  'view_stock': 'stock',
  'manage_stock': 'stock',
  'view_inventory': 'inventaire_manuel',
  'manage_inventory': 'inventaire_manuel',
  'import_products': 'import_produits',
  
  // Paramétrage - Toujours disponible pour tous les plans
  'campany_setting': true,
  'view_users': true,
  
  // Dashboard - Toujours disponible
  'view_dashboard': true,
  'view_profile': true,
  'view_settings': true
};

// Fonction pour filtrer le menu selon l'abonnement
export const filterMenuBySubscription = (menuItems, hasFeature) => {
  return menuItems.map(menuItem => {
    // Filtrer les sous-menus
    if (menuItem.dropdownMenu && Array.isArray(menuItem.dropdownMenu) && menuItem.dropdownMenu.length > 0) {
      const filteredDropdown = menuItem.dropdownMenu.filter(subItem => {
        if (!subItem.permission) return true; // Si pas de permission, toujours visible
        
        const requiredFeature = SUBSCRIPTION_FEATURES_MAP[subItem.permission];
        if (requiredFeature === true) return true; // Toujours disponible
        if (!requiredFeature) return true; // Si pas mappé, disponible par défaut
        
        return hasFeature(requiredFeature);
      });
      
      // Si plus de sous-menus après filtrage, masquer le menu principal
      if (filteredDropdown.length === 0) {
        return null;
      }
      
      return {
        ...menuItem,
        dropdownMenu: filteredDropdown
      };
    }
    
    // Pour les éléments de menu sans sous-menu ou avec dropdownMenu vide
    if (menuItem.permission) {
      const requiredFeature = SUBSCRIPTION_FEATURES_MAP[menuItem.permission];
      if (requiredFeature === true) return menuItem;
      if (!requiredFeature) return menuItem;
      
      return hasFeature(requiredFeature) ? menuItem : null;
    }
    
    return menuItem;
  }).filter(Boolean); // Retirer les éléments null
};