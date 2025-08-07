
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
        name: "Dépenses",
        path: "#",
        icon: 'feather-credit-card',
        hasDropdown: true,
        dropdownMenu: [
            {
                id: 1,
                name: "Tableau de bord",
                path: "/depenses",
                subdropdownMenu: false,
                permission: 'view_expenses',
            },
            {
                id: 2,
                name: "Nouvelle dépense",
                path: "/depenses/nouveau",
                subdropdownMenu: false,
                permission: 'create_expenses',
            },
            {
                id: 3,
                name: "Validation",
                path: "/depenses/validation",
                subdropdownMenu: false,
                permission: 'validate_expenses',
            },
            {
                id: 4,
                name: "Paramètres",
                path: "/depenses/parametres",
                subdropdownMenu: false,
                permission: 'manage_expense_settings',
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
     
 
]
