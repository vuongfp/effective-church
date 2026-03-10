/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AboutUs from './pages/AboutUs';
import Accounts from './pages/Accounts';
import Activities from './pages/Activities';
import AuditLogs from './pages/AuditLogs';
import Blog from './pages/Blog';
import BusinessCRMLanding from './pages/BusinessCRMLanding';
import Campaigns from './pages/Campaigns';
import ChristianOrganizations from './pages/ChristianOrganizations';
import ChurchCRMLanding from './pages/ChurchCRMLanding';
import ChurchDashboard from './pages/ChurchDashboard';
import ChurchEvents from './pages/ChurchEvents';
import ChurchFinances from './pages/ChurchFinances';
import ChurchGroups from './pages/ChurchGroups';
import ChurchMembers from './pages/ChurchMembers';
import ChurchReports from './pages/ChurchReports';
import ChurchStaff from './pages/ChurchStaff';
import ChurchVisitors from './pages/ChurchVisitors';
import CommunicationAnnouncement from './pages/CommunicationAnnouncement';
import Contacts from './pages/Contacts';
import Dashboard from './pages/Dashboard';
import EducationCareer from './pages/EducationCareer';
import EffectiveLivingLanding from './pages/EffectiveLivingLanding';
import Groups from './pages/Groups';
import Home from './pages/Home';
import KidChurch from './pages/KidChurch';
import MemberProfile from './pages/MemberProfile';
import Notes from './pages/Notes';
import OnlineGiving from './pages/OnlineGiving';
import OperationalTasks from './pages/OperationalTasks';
import Pipeline from './pages/Pipeline';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Tickets from './pages/Tickets';
import UserGuide from './pages/UserGuide';
import UserRoleManagement from './pages/UserRoleManagement';
import VolunteerManagement from './pages/VolunteerManagement';
import VisitorSignup from './pages/VisitorSignup';
import ChurchHome from './pages/ChurchHome';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AboutUs": AboutUs,
    "Accounts": Accounts,
    "Activities": Activities,
    "AuditLogs": AuditLogs,
    "Blog": Blog,
    "BusinessCRMLanding": BusinessCRMLanding,
    "Campaigns": Campaigns,
    "ChristianOrganizations": ChristianOrganizations,
    "ChurchCRMLanding": ChurchCRMLanding,
    "ChurchDashboard": ChurchDashboard,
    "ChurchEvents": ChurchEvents,
    "ChurchFinances": ChurchFinances,
    "ChurchGroups": ChurchGroups,
    "ChurchMembers": ChurchMembers,
    "ChurchReports": ChurchReports,
    "ChurchStaff": ChurchStaff,
    "ChurchVisitors": ChurchVisitors,
    "CommunicationAnnouncement": CommunicationAnnouncement,
    "Contacts": Contacts,
    "Dashboard": Dashboard,
    "EducationCareer": EducationCareer,
    "EffectiveLivingLanding": EffectiveLivingLanding,
    "Groups": Groups,
    "Home": Home,
    "KidChurch": KidChurch,
    "MemberProfile": MemberProfile,
    "Notes": Notes,
    "OnlineGiving": OnlineGiving,
    "OperationalTasks": OperationalTasks,
    "Pipeline": Pipeline,
    "Reports": Reports,
    "Settings": Settings,
    "Tickets": Tickets,
    "UserGuide": UserGuide,
    "UserRoleManagement": UserRoleManagement,
    "VolunteerManagement": VolunteerManagement,
    "VisitorSignup": VisitorSignup,
    "ChurchHome": ChurchHome,
}

export const pagesConfig = {
    mainPage: "ChurchDashboard",
    Pages: PAGES,
    Layout: __Layout,
};