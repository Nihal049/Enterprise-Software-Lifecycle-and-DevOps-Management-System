import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, CheckSquare, Bug, FolderGit2, 
  GitCommit, Activity, FileCheck2, PlaySquare, Settings as SettingsIcon, LogOut, ShieldAlert, Users, Timer, Sparkles
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Sprints from './pages/Sprints';
import Bugs from './pages/Bugs';
import Commits from './pages/Commits';
import Deployments from './pages/Deployments';
import TestCases from './pages/TestCases';
import Login from './pages/Login';
import Repos from './pages/Repos';
import ActivityLogs from './pages/ActivityLogs';
import Settings from './pages/Settings';
import Team from './pages/Team';
import AIAssistant from './pages/AIAssistant';

// --- RBAC: JWT DECODER UTILITY ---
// eslint-disable-next-line react-refresh/only-export-components
export const getAuthUser = () => {
  const token = localStorage.getItem('jwt_token');
  if (!token) return null;
  try {
    const payloadStr = atob(token.split('.')[1]);
    const payloadObj = JSON.parse(payloadStr);
    return {
      email: payloadObj.sub || '',
      role: payloadObj.role || 'Developer'
    };
  } catch (e) {
    console.error("Could not decode token", e);
    return null;
  }
};

// --- ACCESS DENIED FALLBACK ---
const AccessDenied = () => (
  <div className="min-h-[80vh] flex items-center justify-center animate-in fade-in zoom-in duration-300">
    <div className="bg-white p-10 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldAlert size={40} />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
      <p className="text-slate-500 mb-8 leading-relaxed">You must be a <strong className="text-slate-700">DevOps Engineer</strong> to access this module.</p>
      <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
        Return to Dashboard
      </Link>
    </div>
  </div>
);

// --- NAV ITEM COMPONENT ---
const NavItem = ({ to, icon: Icon, label, currentPath }) => {
  const isActive = currentPath === to || currentPath.startsWith(`${to}?`);
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm mb-1 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getAuthUser();

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 border-r border-slate-800 shadow-2xl z-50">
      <div className="p-6 mb-2">
        <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
          NeuroForge
        </h1>
        <p className="text-slate-500 text-xs mt-1 font-mono tracking-widest uppercase">Enterprise ALM</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 mb-3 px-2 uppercase tracking-wider">Plan & Track</p>
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" currentPath={location.pathname} />
          <NavItem to="/ai" icon={Sparkles} label="AI Copilot" currentPath={location.pathname} /> {/* <-- ADDED AI LINK */}
          <NavItem to="/sprints" icon={Timer} label="Sprints" currentPath={location.pathname} />
          <NavItem to="/tasks" icon={CheckSquare} label="Task Board" currentPath={location.pathname} />
          <NavItem to="/bugs" icon={Bug} label="Defect Tracking" currentPath={location.pathname} />
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 mb-3 px-2 uppercase tracking-wider">Code & Build</p>
          <NavItem to="/repos" icon={FolderGit2} label="Repositories" currentPath={location.pathname} />
          <NavItem to="/commits" icon={GitCommit} label="Code Commits" currentPath={location.pathname} />
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 mb-3 px-2 uppercase tracking-wider">Test & Deploy</p>
          <NavItem to="/testcases" icon={FileCheck2} label="Test Cases" currentPath={location.pathname} />
          <NavItem to="/deployments" icon={PlaySquare} label="Pipelines" currentPath={location.pathname} />
          <NavItem to="/activity" icon={Activity} label="Activity Logs" currentPath={location.pathname} />
        </div>
        
        {user?.role?.toLowerCase() === 'devops engineer' && (
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-500 mb-3 px-2 uppercase tracking-wider">Administration</p>
            <NavItem to="/team" icon={Users} label="Team Management" currentPath={location.pathname} />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800">
        <NavItem to="/settings" icon={SettingsIcon} label="User Settings" currentPath={location.pathname} />
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 mt-1 cursor-pointer border-none bg-transparent"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = getAuthUser();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role.toLowerCase() !== requiredRole.toLowerCase()) {
    return <AccessDenied />;
  }
  return children;
};

const AppLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className={`flex min-h-screen font-sans ${isLoginPage ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {!isLoginPage && <Sidebar />}
      <div className={`flex-1 transition-all ${!isLoginPage ? 'ml-64' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} /> {/* <-- ADDED AI ROUTE */}
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/sprints" element={<ProtectedRoute><Sprints /></ProtectedRoute>} />
          <Route path="/bugs" element={<ProtectedRoute><Bugs /></ProtectedRoute>} />
          <Route path="/repos" element={<ProtectedRoute><Repos /></ProtectedRoute>} />
          <Route path="/commits" element={<ProtectedRoute><Commits /></ProtectedRoute>} />
          <Route path="/testcases" element={<ProtectedRoute><TestCases /></ProtectedRoute>} />
          <Route path="/deployments" element={<ProtectedRoute><Deployments /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><ActivityLogs /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          <Route path="/team" element={
            <ProtectedRoute requiredRole="devops engineer">
              <Team />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}