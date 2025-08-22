
export const menuList = [

    {
        id: 2,

        name: "Facturation",
        path: "/facturation/dashboard",
        icon: 'feather-file-text',
        permission: 'view_invoices',
        dropdownMenu: false

    },
    {
        id: 3,
        name: "Dépenses",
        path: "/achats",
        icon: 'feather-shopping-cart',
        permission: 'view_invoices',
        dropdownMenu: false
    },
    {
        id: 4,
        name: "Notes de frais",

        path: "/notes-frais",
        icon: 'feather-credit-card',
        permission: 'view_invoices',
        dropdownMenu: false

    },
    {
        id: 5,
        name: "Rapport",
        path: "/rapport",
        icon: 'feather-bar-chart-2',

        permission: 'view_invoices',
        dropdownMenu: false

    },
    {
        id: 6,
        name: "Paramétrage",
        path: "/parametrage",
        icon: 'feather-settings',
        permission: 'view_invoices',
        dropdownMenu: false
    },
    {
        id: 7,
        name: "Plans",
        path: "/abonnement/plans",
        icon: 'feather-package',
        permission: 'view_invoices',
        dropdownMenu: false
 
    }
]
