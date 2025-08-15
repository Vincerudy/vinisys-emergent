
export const menuList = [
    {
        id: 0,
        name: "Facturation",
        path: "#",
        icon: 'feather-grid',
        dropdownMenu: [
            {
                id: 1,
                name: "Devis",
                path: "/facturation/devis",
                subdropdownMenu: false,
                permission: 'view_quotes',
            },
            {
                id: 2,
                name: "Factures",
                path: "/facturation/factures",
                subdropdownMenu: false,
                permission: 'view_invoices',
            },
            {
                id: 3,
                name: "Clients",
                path: "/facturation/clients",
                subdropdownMenu: false,
                permission: 'view_clients',
            },
            {
                id: 4,
                name: "Cahier de recette",
                path: "/facturation/recette",
                subdropdownMenu: false,
                permission: 'view_recette_page',
            }, 
            {
                id: 5,
                name: "Paramétrage facturation",
                path: "/facturation/parametrage",
                subdropdownMenu: false,
                permission: 'manage_invoice_param',
            }
        ]
    },
    {
        id: 2,
        name: "Achats & Dépenses",
        path: "#",
        icon: 'feather-shopping-cart',
        permission: 'view_depenses',
        dropdownMenu: [
            {
                id: 1,
                name: "Tableau de bord",
                path: "/achats",
                subdropdownMenu: false,
                permission: 'view_depenses',
            },
            {
                id: 2,
                name: "Liste des dépenses",
                path: "/achats/liste",
                subdropdownMenu: false,
                permission: 'view_depenses',
            },
            {
                id: 3,
                name: "Fournisseurs",
                path: "/achats/fournisseurs",
                subdropdownMenu: false,
                permission: 'view_depenses',
            },
            {
                id: 4,
                name: "Paramétrage",
                path: "/achats/parametrage",
                subdropdownMenu: false,
                permission: 'view_depenses',
            }
        ]
    },
    {
        id: 3,
        name: "Gestion stock",
        path: "#",
        icon: 'feather-archive',
        dropdownMenu: [
            {
                id: 2,
                name: "Nouveau produit",
                path: "/produit",
                subdropdownMenu: false,
                permission: 'create_product',
            },  
            {
                id: 3,
                name: "Import Produits - Service",
                path: "/import-produit",
                subdropdownMenu: false,
                permission: 'manage_stock',
            },  
            {
                id: 4,
                name: "Catalogue",
                path: "/liste-produits",
                subdropdownMenu: false,
                permission: 'view_stock',
            },  
            {
                id: 5,
                name: "Mouvement de stock",
                path: "/mouvements",
                subdropdownMenu: false,
                permission: 'manage_stock',
            },  
            
            {
                id: 6,
                name: "Inventaire manuel",
                path: "/inventaire-manuel",
                subdropdownMenu: false,
                permission: 'manage_inventory',
            },  
            {
                id: 7,
                name: "Inventaire automatisé",
                path: "/Inventaire-auto",
                subdropdownMenu: false,
                permission: 'manage_inventory',
            },  
           
          
     
        ]
    },
    {
        id: 10,
        name: "Notes de frais",
        path: "#",
        icon: 'feather-file-text',
        permission: 'view_notes_frais',
        dropdownMenu: [
            {
                id: 1,
                name: "Tableau de bord",
                path: "/notes-frais",
                subdropdownMenu: false,
                permission: 'view_notes_frais',
            },
            {
                id: 2,
                name: "Liste des notes",
                path: "/notes-frais/liste",
                subdropdownMenu: false,
                permission: 'view_notes_frais',
            },
            {
                id: 3,
                name: "Créer une note",
                path: "/notes-frais/nouvelle",
                subdropdownMenu: false,
                permission: 'create_expense',
            },
            {
                id: 6,
                name: "Paramétrage",
                path: "/notes-frais/parametrage",
                subdropdownMenu: false,
                permission: 'manage_expense_categories',
            },
            {
                id: 4,
                name: "Validation notes",
                path: "/notes-frais/validation",
                subdropdownMenu: false,
                permission: 'validate_expenses',
            },
            {
                id: 5,
                name: "Historique",
                path: "/notes-frais/historique",
                subdropdownMenu: false,
                permission: 'view_notes_frais',
            }
        ]
    },
    
    // Page Rapport - Directement accessible
    {
        id: 95,
        name: "Rapport",
        path: "/rapport",
        icon: 'feather-bar-chart-2',
        permission: 'access_reports',
        dropdownMenu: [], // Tableau vide au lieu de false
    },
    
    {
        id: 9,
        name: "Paramétrage",
        path: "#",
        icon: 'feather-settings',
        dropdownMenu: [
            {
                id: 1,
                name: "Général",
                path: "/societe/configuration",
                subdropdownMenu: false,
                permission: 'campany_setting',
            },  
            {
                id: 2,
                name: "Paramètres de messagerie",
                path: "/societe/serveur-mail",
                subdropdownMenu: false,
                permission: 'campany_setting',
            },
            {
                id: 3,
                name: "Utilisateurs et rôles",
                path: "/societe/roles",
                subdropdownMenu: false,
                permission: 'view_users',
            },
          
     
        ]
    },
    
    // Page Assistance avec Mise à niveau
    {
        id: 96,
        name: "Assistance",
        path: "#",
        icon: 'feather-help-circle',
        dropdownMenu: [
            {
                id: 1,
                name: "Mettre à niveau",
                path: "/abonnement/plans",
                subdropdownMenu: false,
            }
        ]
    },
     
 
]
