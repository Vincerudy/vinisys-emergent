import { createHashRouter, useNavigate, Navigate } from "react-router-dom";
import RootLayout from "../layout/root";
import Home from "../pages/home";
import Analytics from "../pages/analytics";
import ReportsSales from "../pages/reports-sales";
import ReportsLeads from "../pages/reports-leads";
import ReportsProject from "../pages/reports-project";
import AppsChat from "../pages/apps-chat";
import LayoutApplications from "../layout/layoutApplications";
import AppsEmail from "../pages/apps-email";
import ReportsTimesheets from "../pages/reports-timesheets";
import LoginCover from "../pages/login-cover";
import AppsTasks from "../pages/apps-tasks";
import AppsNotes from "../pages/apps-notes";
import AppsCalender from "../pages/apps-calender";
import AppsStorage from "../pages/apps-storage";
import Proposalist from "../pages/proposal-list";
import CustomersList from "../pages/customers-list";
import ProposalView from "../pages/proposal-view";
import ProposalEdit from "../pages/proposal-edit";
import LeadsList from "../pages/leadsList";
import CustomersView from "../pages/customers-view";
import CustomersCreate from "../pages/customers-create";
import ProposalCreate from "../pages/proposal-create";
import ProduitDetail from "../pages/ProduitDetail";
import LeadsView from "../pages/leads-view";
import LeadsCreate from "../pages/leads-create";
import PaymentList from "../pages/payment-list";
import PaymentView from "../pages/payment-view";
import PaymentCreate from "../pages/payment-create";
import ProjectsList from "../pages/projects-list";
import ProjectsView from "../pages/projects-view";
import ProjectsCreate from "../pages/projects-create";
import SettingsGaneral from "../pages/settings-ganeral";
import LayoutSetting from "../layout/layoutSetting";
import ListeProduits from "../pages/ListeProduits";
import MouvementsStockPage from "../pages/MouvementsStockPage";
import SettingsSeo from "../pages/settings-seo";
import SettingsTags from "../pages/settings-tags";
import SettingsEmail from "../pages/settings-email";
import SettingsTasks from "../pages/settings-tasks";
import SettingsLeads from "../pages/settings-leads";
import SettingsMiscellaneous from "../pages/settings-miscellaneous";
import SettingsRecaptcha from "../pages/settings-recaptcha";
import SettingsLocalization from "../pages/settings-localization";
import SettingsCustomers from "../pages/settings-customers";
import SettingsGateways from "../pages/settings-gateways";
import SettingsFinance from "../pages/settings-finance";
import SettingsSupport from "../pages/settings-support";
import LayoutAuth from "../layout/layoutAuth";
import LoginMinimal from "../pages/login-minimal";
import LoginCreative from "../pages/login-creative";
import RegisterCover from "../pages/register-cover";
import RegisterMinimal from "../pages/register-minimal";
import RegisterCreative from "../pages/register-creative";
import ResetCover from "../pages/reset-cover";
import { useAuth } from '../contexte/AuthContext';
import ResetMinimal from "../pages/reset-minimal";
import ResetCreative from "../pages/reset-creative";
import ErrorCover from "../pages/error-cover";
import ErrorCreative from "../pages/error-creative";
import ErrorMinimal from "../pages/error-minimal";
import OtpCover from "../pages/otp-cover";
import OtpMinimal from "../pages/otp-minimal";
import OtpCreative from "../pages/otp-creative";
import MaintenanceCover from "../pages/maintenance-cover";
import MaintenanceMinimal from "../pages/maintenance-minimal";
import MaintenanceCreative from "../pages/maintenance-creative";
import HelpKnowledgebase from "../pages/help-knowledgebase";
import WidgetsLists from "../pages/widgets-lists";
import WidgetsTables from "../pages/widgets-tables";
import WidgetsCharts from "../pages/widgets-charts";
import WidgetsStatistics from "../pages/widgets-statistics";
import WidgetsMiscellaneous from "../pages/widgets-miscellaneous";
import Connexion from "../pages/Connexion";
import FacturationPage from "../pages/FacturationPage";
import DevisPage from "../pages/DevisPage";
import ParametrageFacturationPage from "../pages/ParametrageFacturationPage";
import ClientParamétragePage from "../pages/ClientParamétragePage";
import CahierRecettePage from "../pages/CahierRecettePage";
import Configuration from "../pages/Configuration";  
import ConfigurationServeurMail from "../pages/ConfigurationServeurMail";
import ConfigurationRole from "../pages/ConfigurationRole";
import AlertFacturation from "../components/composantsFacture/AlertFacturation"
import ResetPassword from "../pages/ResetPassword";

// Pages Dépenses
import TableauBordDepenses from "../pages/TableauBordDepenses";
import AjoutDepense from "../pages/AjoutDepense";
import DetailsDepense from "../pages/DetailsDepense";
import ParametresDepenses from "../pages/ParametresDepenses";
import ValidationDepenses from "../pages/ValidationDepenses";

// Nouveaux modules refondus
import AchatsPage from "../pages/AchatsPage";
import NotesfraisPage from "../pages/NotesfraisPage";
import NouvelAchatPage from "../pages/NouvelAchatPage";
import ListeAchatsPage from "../pages/ListeAchatsPage";
import ListeNotesPage from "../pages/ListeNotesPage";
import NouvelleNoteFraisPage from "../pages/NouvelleNoteFraisPage";
import NoteDetailPage from "../pages/NoteDetailPage";
import ParametrageFraisPage from "../pages/ParametrageFraisPage";
import TestNoteFraisPage from "../pages/TestNoteFraisPage";
import ValidationNotesPage from "../pages/ValidationNotesPage";
import HistoriqueNotesPage from "../pages/HistoriqueNotesPage";
import FournisseursPage from "../pages/FournisseursPage";

import axios from "axios";
import ImportProduitsPage from "../pages/ImportProduitsPage";
import InventaireManuel from "../pages/InventaireManuel";
import InventaireAutomatise from "../pages/InventaireAutomatise";
import ClientCompaniesPage from "../pages/pilotage/ClientCompaniesPage";
import AdminDashboard from "../pages/AdminDashboard";
import UserManagement from "../components/composantsFacture/UserManagement";
import { hasPermission } from '../contexte/permissions';
import ParametrageSocieteClient from "../pages/pilotage/ParametrageSocieteClient";
import ListeTicketClient from "../pages/ListeTicketClient";
import TicketDetail from "../pages/TicketDetail";
import ListeTicketsMaintenance from "../pages/pilotage/ListeTicketsMaintenance";
import TicketDetailMaintenance from "../pages/pilotage/TicketDetailMaintenance";
import Ticketchat from "../pages/Ticketchat";

import TestPage from "../pages/TestPage";

const testToken = async (value, logout) =>{
    console.log('MOI MOUKO', value)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/token`, {
        headers: {
          'Authorization': `Bearer ${value}` // Envoie le token dans les en-têtes
        }
      });
  
      if (response.status === 200) {
        console.log('Token valide');
      }
      //alert('valide')
    } catch (error) {
      if (error.response && error.response.status === 401) {
        logout()
        console.log('Token expiré');
        localStorage.clear();  // On déconnecte l'utilisateur
        //alert('invalide')
      } else {
        console.error('Erreur lors de la vérification du token:', error);
      }
    }
}

const ProtectedRoute = ({ element, requiredPermissions }) => {
    const { token, logout } = useAuth();
  
    // Tester la validité du token (par ex. expiration)
    testToken(token, logout);
  
    if (!token) {
      // Pas connecté, redirige vers login
      return <Navigate to="/" replace />;
    }
  
    if (requiredPermissions && !hasPermission(requiredPermissions)) {
      // Permissions manquantes, accès refusé (tu peux aussi rediriger vers une page dédiée)
      return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent:'center', alignItems: 'center', color:'black', backgroundColor: '#ffa286'}}>Accès refusé : vous n'avez pas les permissions nécessaires.</div>;
    }
  
    // Tout est OK, afficher l'élément demandé
    return element;
};
  

const PublicRoute = ({ element }) => {
    const { token } = useAuth();
    return token ? <Navigate to="/home" /> : element;
  };

 
 

export const publicRoute = createHashRouter([
    {

        path: "/",
        element: <RootLayout />,
        children: [
            {
                path: "/",
                element: <PublicRoute element={<Connexion />} />,
            },
            {
                path: "/home",
                element: <ProtectedRoute element={<Home />} />,
            },
            {
                path: "/facturation/factures",
                element: <ProtectedRoute element={<FacturationPage />} requiredPermissions="view_invoices"  />,
            },
            {
                path: "/facturation/devis",
                element: <ProtectedRoute element={<DevisPage />} requiredPermissions="view_quotes"   />,
            },
            {
                path: "/facturation/parametrage",
                element: <ProtectedRoute element={<ParametrageFacturationPage />} requiredPermissions="manage_invoice_param"  />,
            },
            {
                path: "/facturation/clients",
                element: <ProtectedRoute element={<ClientParamétragePage />} requiredPermissions="view_clients"   />,
            },
            {
                path: "/facturation/recette",
                element: <ProtectedRoute element={<CahierRecettePage />} requiredPermissions="view_recette_page" />,
            },
            {
                path: "/societe/configuration",
                element: <ProtectedRoute element={<Configuration />} requiredPermissions="campany_setting"/>,
            },
            {
                path: "/societe/serveur-mail",
                element: <ProtectedRoute element={<ConfigurationServeurMail />} requiredPermissions="campany_setting"  />,
            },
            {
                path: "/societe/roles",
                element: <ProtectedRoute element={<ConfigurationRole />} requiredPermissions="view_users"   />,
            },
            {
                path: "/societe/roles/user/:user_id", 
                element: <ProtectedRoute element={<UserManagement />} />,
            },
            {
                path: "/societe/roles/user", 
                element: <ProtectedRoute element={<UserManagement />} requiredPermissions="manage_users" />,
            },
            {
                path: "/alertes",
                element: <ProtectedRoute element={<AlertFacturation />} />,
            },
            {
                path: "/liste-produits",
                element: <ProtectedRoute element={<ListeProduits />} requiredPermissions="view_stock"  />,
            },
            {
                path: "/produit/:id",
                element: <ProtectedRoute element={<ProduitDetail />} requiredPermissions="view_stock"  />,

            },
            {
                path: "/produit",
                element: <ProtectedRoute element={<ProduitDetail />} requiredPermissions="create_product" />,

            },
            {
                path: "/mouvements",
                element: <ProtectedRoute element={<MouvementsStockPage />} requiredPermissions="manage_stock" />,

            },
            {
                path: "/Import-produit",
                element: <ProtectedRoute element={<ImportProduitsPage />} requiredPermissions="manage_stock" />,
            },
            {
                path: "/inventaire-manuel",
                element: <ProtectedRoute element={<InventaireManuel />} requiredPermissions="manage_inventory" />
            },
            {
                path: "/Inventaire-auto",
                element: <ProtectedRoute element={<InventaireAutomatise />} requiredPermissions="manage_inventory" />
            },
            {
                path: "/listes/tickets",
                element: < ProtectedRoute element= {<ListeTicketClient/>}/>
         
            },
            {
                path: "/listes/ticket",
                element: < ProtectedRoute element= {<TicketDetail/>}/>
         
            },
            {
                path: "/listes/ticket/:user_id",
                element: < ProtectedRoute element= {<TicketDetail/>}/>
         
            },
,
            {
                path: "/admin/societe/parametrage/:societe_id", 
                element: < ProtectedRoute element= {<ParametrageSocieteClient/>}/>
            },
            {
                path: "/admin", 
                element : < ProtectedRoute element= {<AdminDashboard/>}/>
            },
            {
                path: "/admin/societe",
                element: < ProtectedRoute element={<ClientCompaniesPage/>}/>
            },
            {
                path: "/chat",
                element: < ProtectedRoute element={<Ticketchat/>}/>
            },
            {
                path: "/admin/tickets",
                element: < ProtectedRoute element= {<ListeTicketsMaintenance/>}/>
         
            },
            {
                path: "/admin/tickets/:user_id",
                element: < ProtectedRoute element= {<TicketDetailMaintenance/>}/>
         
            },
            {
                path: "/admin/tickets",
                element: < ProtectedRoute element= {<TicketDetailMaintenance/>}/>
         
            },
            {
                path: "/apps-storage",
                element: <ProtectedRoute element={<AppsStorage />} />,
            },
            {
                path: "/proposal-list",
                element: <ProtectedRoute element={<Proposalist />} />,
            },
            {
                path: "/customers-list",
                element: <ProtectedRoute element={<CustomersList />} />,
            },
            {
                path: "/proposal-view",
                element: <ProtectedRoute element={<ProposalView />} />,
            },
            {
                path: "/proposal-edit",
                element: <ProtectedRoute element={<ProposalEdit />} />,
            },
            {
                path: "/leadsList",
                element: <ProtectedRoute element={<LeadsList />} />,
            },
            {
                path: "/customers-view",
                element: <ProtectedRoute element={<CustomersView />} />,
            },
            {
                path: "/customers-create",
                element: <ProtectedRoute element={<CustomersCreate />} />,
            },
            {
                path: "/proposal-create",
                element: <ProtectedRoute element={<ProposalCreate />} />,
            },
            {
                path: "/leads-view",
                element: <ProtectedRoute element={<LeadsView />} />,
            },
            {
                path: "/leads-create",
                element: <ProtectedRoute element={<LeadsCreate />} />,
            },
            {
                path: "/payment-list",
                element: <ProtectedRoute element={<PaymentList />} />,
            },
            {
                path: "/payment-view",
                element: <ProtectedRoute element={<PaymentView />} />,
            },
            {
                path: "/payment-create",
                element: <ProtectedRoute element={<PaymentCreate />} />,
            },
            {
                path: "/projects-list",
                element: <ProtectedRoute element={<ProjectsList />} />,
            },
            {
                path: "/projects-view",
                element: <ProtectedRoute element={<ProjectsView />} />,
            },
            {
                path: "/projects-create",
                element: <ProtectedRoute element={<ProjectsCreate />} />,
            },
            {
                path: "/settings-ganeral",
                element: <ProtectedRoute element={<SettingsGaneral />} />,
            },
            {
                path: "/settings-seo",
                element: <ProtectedRoute element={<SettingsSeo />} />,
            },
            {
                path: "/settings-tags",
                element: <ProtectedRoute element={<SettingsTags />} />,
            },
            {
                path: "/settings-email",
                element: <ProtectedRoute element={<SettingsEmail />} />,
            },
            {
                path: "/settings-tasks",
                element: <ProtectedRoute element={<SettingsTasks />} />,
            },
            {
                path: "/settings-leads",
                element: <ProtectedRoute element={<SettingsLeads />} />,
            },
            {
                path: "/settings-miscellaneous",
                element: <ProtectedRoute element={<SettingsMiscellaneous />} />,
            },
            {
                path: "/settings-recaptcha",
                element: <ProtectedRoute element={<SettingsRecaptcha />} />,
            },
            {
                path: "/settings-localization",
                element: <ProtectedRoute element={<SettingsLocalization />} />,
            },
            {
                path: "/settings-customers",
                element: <ProtectedRoute element={<SettingsCustomers />} />,
            },
            {
                path: "/settings-gateways",
                element: <ProtectedRoute element={<SettingsGateways />} />,
            },
            {
                path: "/settings-finance",
                element: <ProtectedRoute element={<SettingsFinance />} />,
            },
            {
                path: "/settings-support",
                element: <ProtectedRoute element={<SettingsSupport />} />,
            },
            // Routes Dépenses (anciennes - compatibilité)
            {
                path: "/depenses",
                element: <ProtectedRoute element={<TableauBordDepenses />} />,
            },
            {
                path: "/depenses/tableau-bord",
                element: <ProtectedRoute element={<TableauBordDepenses />} />,
            },
            {
                path: "/depenses/nouveau",
                element: <ProtectedRoute element={<AjoutDepense />} />,
            },
            {
                path: "/depenses/:id/details",
                element: <ProtectedRoute element={<DetailsDepense />} />,
            },
            {
                path: "/depenses/:id/modifier",
                element: <ProtectedRoute element={<AjoutDepense />} />,
            },
            {
                path: "/depenses/validation",
                element: <ProtectedRoute element={<ValidationDepenses />} />,
            },
            {
                path: "/depenses/parametres",
                element: <ProtectedRoute element={<ParametresDepenses />} />,
            },
            
            // Nouveaux modules refondus
            {
                path: "/achats",
                element: <ProtectedRoute element={<AchatsPage />} />,
            },
            {
                path: "/achats/nouveau",
                element: <ProtectedRoute element={<NouvelAchatPage />} />,
            },
            {
                path: "/achats/liste",
                element: <ProtectedRoute element={<ListeAchatsPage />} />,
            },
            {
                path: "/achats/fournisseurs",
                element: <ProtectedRoute element={<FournisseursPage />} />,
            },
            {
                path: "/notes-frais",
                element: <ProtectedRoute element={<NotesfraisPage />} />,
            },
            {
                path: "/notes-frais/nouvelle",
                element: <ProtectedRoute element={<NouvelleNoteFraisPage />} />,
            },
            {
                path: "/notes-frais/liste",
                element: <ProtectedRoute element={<ListeNotesPage />} />,
            },
            {
                path: "/notes-frais/note/:id",
                element: <ProtectedRoute element={<NoteDetailPage />} />,
            },
            {
                path: "/notes-frais/edit/:id",
                element: <ProtectedRoute element={<NouvelleNoteFraisPage />} />,
            },
            {
                path: "/notes-frais/validation",
                element: <ProtectedRoute element={<ValidationNotesPage />} />,
            },
            {
                path: "/notes-frais/historique",
                element: <ProtectedRoute element={<HistoriqueNotesPage />} />,
            },
            {
                path: "/reset-password/:token",
                element: <ResetPassword />,
            },
            
        ]
    },
]);
