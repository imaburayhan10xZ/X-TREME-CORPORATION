import { LayoutDashboard, Users, Package, CreditCard, RefreshCw, AlertTriangle, FileText, Activity, Settings, BellRing, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/contexts/SettingsContext';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Users', icon: Users, path: '/users' },
  { name: 'Packages', icon: Package, path: '/packages' },
  { name: 'Payments', icon: CreditCard, path: '/payments' },
  { name: 'Renewals', icon: RefreshCw, path: '/renewals' },
  { name: 'OBB Fees', icon: AlertTriangle, path: '/obb-fees' },
  { name: 'Alerts', icon: BellRing, path: '/alerts' },
  { name: 'Reports', icon: FileText, path: '/reports' },
  { name: 'Activity Logs', icon: Activity, path: '/activity-logs' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const companyName = settings.company_name || "X-TREME CORP";
  const firstLetter = companyName.charAt(0).toUpperCase();

  // Highlight the last word if it has multiple words
  const nameParts = companyName.split(' ');
  const lastWord = nameParts.length > 1 ? nameParts.pop() : '';
  const firstParts = nameParts.join(' ');

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black italic">{firstLetter}</div>
        <span className="font-bold tracking-tight text-lg text-slate-900 truncate">
          {firstParts || companyName} {lastWord && <span className="text-indigo-600">{lastWord}</span>}
        </span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md font-medium transition",
                isActive 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-600 hover:bg-slate-50"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 flex-1">
          <div className="h-9 w-9 rounded-full bg-slate-200 border border-white flex items-center justify-center font-bold text-slate-600">AD</div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate">Admin</p>
            <p className="text-[10px] text-slate-500 uppercase font-medium tracking-tighter">System</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition" title="Log Out">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}

