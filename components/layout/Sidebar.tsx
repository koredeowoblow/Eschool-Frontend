
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, CreditCard, Settings,
  MessageSquare, LogOut, CalendarCheck, ClipboardList, Trophy, FileText,
  Clock, ShieldAlert, BarChart3, Heart, Library as LibraryIcon, ArrowUpCircle,
  History, Layers, Calendar as CalendarIcon, ListChecks, Wallet, Receipt,
  Lock, UserCheck, Package, Cpu, LucideIcon, School, Globe, Paperclip, 
  UserPlus, ShieldCheck, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  isHeader?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    const items: NavItem[] = [];
    if (!user) return items;

    const roles = user.roles || [];
    const hasRole = (r: string) => roles.includes(r);

    // Common Items
    items.push(
      { id: 'h-common', label: 'Home', icon: Zap, path: '#', isHeader: true },
      { id: 'dash', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { id: 'chats', label: 'Messages', icon: MessageSquare, path: '/communication' }
    );

    // Super Admin Section
    if (hasRole('super_admin')) {
      items.push(
        { id: 'h-super', label: 'Admin', icon: ShieldAlert, path: '#', isHeader: true },
        { id: 'schools', label: 'Schools', icon: School, path: '/super-admin' },
        { id: 'global-users', label: 'Users', icon: Globe, path: '/global-users' },
        { id: 'plans', label: 'Plans', icon: Package, path: '/plans' },
        { id: 'audit-logs', label: 'Logs', icon: History, path: '/audit-logs' },
        { id: 'rbac', label: 'Roles', icon: Lock, path: '/roles-permissions' }
      );
    }

    // School Admin Section
    if (hasRole('school_admin')) {
      items.push(
        { id: 'h-academic', label: 'School', icon: Layers, path: '#', isHeader: true },
        { id: 'sessions', label: 'Terms', icon: CalendarIcon, path: '/academic-sessions' },
        { id: 'sections', label: 'Sections', icon: Layers, path: '/sections' },
        { id: 'classes', label: 'Classes', icon: School, path: '/classes' },
        { id: 'subjects', label: 'Subjects', icon: BookOpen, path: '/subjects' },
        
        { id: 'h-staff', label: 'Staff', icon: Users, path: '#', isHeader: true },
        { id: 'teachers', label: 'Teachers', icon: UserCheck, path: '/teachers' },
        { id: 'staff', label: 'Other Staff', icon: Users, path: '/staff' },

        { id: 'h-students', label: 'Students', icon: GraduationCap, path: '#', isHeader: true },
        { id: 'students', label: 'Students', icon: GraduationCap, path: '/students' },
        { id: 'guardians', label: 'Guardians', icon: UserCheck, path: '/guardians' },
        { id: 'promotions', label: 'Promotions', icon: ArrowUpCircle, path: '/promotions' }
      );
    }

    // Teacher Section
    if (hasRole('teacher')) {
      items.push(
        { id: 'h-lms', label: 'Teaching', icon: ClipboardList, path: '#', isHeader: true },
        { id: 'lesson-notes', label: 'Lessons', icon: FileText, path: '/lesson-notes' },
        { id: 'assignments', label: 'Assignments', icon: ClipboardList, path: '/assignments' },
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck, path: '/attendance' },
        { id: 'assessments', label: 'Exams', icon: ListChecks, path: '/assessments' },
        { id: 'results', label: 'Results', icon: Trophy, path: '/results' }
      );
    }

    // Finance Group
    if (hasRole('finance_officer') || hasRole('school_admin')) {
      items.push(
        { id: 'h-finance', label: 'Money', icon: CreditCard, path: '#', isHeader: true },
        { id: 'fees', label: 'Fees', icon: Wallet, path: '/fees' },
        { id: 'invoices', label: 'Invoices', icon: Receipt, path: '/invoices' },
        { id: 'payments', label: 'Payments', icon: CreditCard, path: '/payments' }
      );
    }

    // Student Common
    if (hasRole('student')) {
      items.push(
        { id: 'h-learning', label: 'My School', icon: BookOpen, path: '#', isHeader: true },
        { id: 'stud-assign', label: 'My Work', icon: ClipboardList, path: '/assignments' },
        { id: 'stud-attend', label: 'Attendance', icon: CalendarCheck, path: '/attendance' },
        { id: 'stud-results', label: 'My Results', icon: Trophy, path: '/results' }
      );
    }

    items.push(
      { id: 'h-settings', label: 'Settings', icon: Settings, path: '#', isHeader: true },
      { id: 'profile', label: 'Profile', icon: UserCheck, path: '/profile' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
    );

    return items;
  };

  const navItems = getNavItems();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose}/>}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">eS</div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">eSchool</span>
          </div>
          
          <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              if (item.isHeader) {
                return (
                  <p key={item.id} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-6 pb-2">
                    {item.label}
                  </p>
                );
              }
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.id} 
                  to={item.path} 
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-primary'}`}
                >
                  <Icon size={16} />
                  <span className="text-xs font-bold">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
