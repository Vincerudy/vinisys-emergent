
export const menuList = [
    {
        id: 1,
        name: "Accueil",
        path: "/",
        icon: 'feather-home',
        permission: 'view_dashboard',
        dropdownMenu: false
    },
    {
        id: 2,
        name: "Facturation",
        path: "/facturation/dashboard",
        icon: 'feather-file-text',
        permission: 'view_facturation',
        dropdownMenu: false
    },
    {
        id: 3,
        name: "Dépenses",
        path: "/achats",
        icon: 'feather-shopping-cart',
        permission: 'view_depenses',
        dropdownMenu: false
    },
    {
        id: 4,
        name: "Notes de frais",
        path: "/notes-frais",
        icon: 'feather-credit-card',
        permission: 'view_notes_frais',
        dropdownMenu: false
    },
    {
        id: 5,
        name: "Rapport",
        path: "/rapport",
        icon: 'feather-bar-chart-2',
        permission: 'view_rapport',
        dropdownMenu: false
    },
    {
        id: 6,
        name: "Paramétrage",
        path: "/parametrage",
        icon: 'feather-settings',
        permission: 'view_parametrage',
        dropdownMenu: false
    },
    {
        id: 7,
        name: "Plans",
        path: "/plans",
        icon: 'feather-package',
        permission: 'view_plans',
        dropdownMenu: false
    },
    {
        id: 8,
        name: "Assistance",
        path: "/listes/tickets",
        icon: 'feather-help-circle',
        permission: 'view_assistance',
        dropdownMenu: false
    }
]
