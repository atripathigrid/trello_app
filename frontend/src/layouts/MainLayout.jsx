import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, Kanban } from 'lucide-react';

export default function MainLayout() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-surface border-b border-surfaceHover px-4 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-primary-600 p-1.5 rounded-md">
            <Kanban className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Trello Clone</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300">
            <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center font-semibold text-primary-50">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <span>{user?.first_name} {user?.last_name}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-white hover:bg-surfaceHover p-2 rounded-md transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>
      
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
