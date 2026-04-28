import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Gavel, History, CreditCard, Settings, Users, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = ({ isAdmin = false }) => {
  const location = useLocation();

  const userLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'My Auctions', icon: Gavel, path: '/my-auctions' },
    { name: 'Bidding History', icon: History, path: '/history' },
    { name: 'Payments', icon: CreditCard, path: '/payments' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const adminLinks = [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { name: 'Manage Users', icon: Users, path: '#manage-users' },
    { name: 'All Auctions', icon: Gavel, path: '#all-auctions' },
    { name: 'System Logs', icon: Activity, path: '#logs' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className="w-64 flex-shrink-0 hidden lg:block mr-8">
      <div className="sticky top-24 glass-card p-4 h-[calc(100vh-8rem)] flex flex-col gap-2">
        <div className="px-3 py-2 mb-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {isAdmin ? 'Admin Menu' : 'Main Menu'}
        </div>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group font-medium text-sm",
                isActive 
                  ? "bg-primary/20 text-primary border border-primary/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]" 
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              )}
            >
              <link.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-text-secondary group-hover:text-white")} />
              {link.name}
            </Link>
          );
        })}
        
        {isAdmin && (
          <div className="mt-auto px-3 py-4 border-t border-white/10">
             <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 text-center">
               <p className="text-xs text-danger mb-2 font-medium">Server Status</p>
               <div className="flex items-center justify-center gap-2 text-sm text-white">
                 <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> Online
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
