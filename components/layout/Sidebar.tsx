
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
      { id: 'h-common', label: 'Main Registry', icon: Zap, path: '#', isHeader: true },
      { id: 'dash', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { id: 'chats', label: 'Communication Hub', icon: MessageSquare, path: '/communication' }
    );

    // Super Admin Section
    if (hasRole('super_admin')) {
      items.push(
        { id: 'h-super', label: 'Platform Engine', icon: ShieldAlert, path: '#', isHeader: true },
        { id: 'schools', label: 'Institution Registry', icon: School, path: '/super-admin' },
        { id: 'global-users', label: 'Global Accounts', icon: Globe, path: '/global-users' },
        { id: 'plans', label: 'Membership Tiers', icon: Package, path: '/plans' },
        { id: 'audit-logs', label: 'Security Audit', icon: History, path: '/audit-logs' },
        { id: 'system-jobs', label: 'Process Queue', icon: Cpu, path: '/system-jobs' },
        { id: 'rbac', label: 'Role Authority', icon: Lock, path: '/roles-permissions' }
      );
    }

    // School Admin Section
    if (hasRole('school_admin')) {
      items.push(
        { id: 'h-academic', label: 'Academic Framework', icon: Layers, path: '#', isHeader: true },
        { id: 'sessions', label: 'Sessions & Terms', icon: CalendarIcon, path: '/academic-sessions' },
        { id: 'sections', label: 'Divisions / Units', icon: Layers, path: '/sections' },
        { id: 'classes', label: 'Class Inventory', icon: School, path: '/classes' },
        { id: 'subjects', label: 'Curriculum Manager', icon: BookOpen, path: '/subjects' },
        { id: 'subject-assign', label: 'Faculty Mapping', icon: UserPlus, path: '/subject-assignments' },
        
        { id: 'h-staff', label: 'Personnel', icon: Users, path: '#', isHeader: true },
        { id: 'teachers', label: 'Academic Faculty', icon: UserCheck, path: '/teachers' },
        { id: 'staff', label: 'Operational Staff', icon: Users, path: '/staff' },

        { id: 'h-students', label: 'Student Management', icon: GraduationCap, path: '#', isHeader: true },
        { id: 'students', label: 'Master Registry', icon: GraduationCap, path: '/students' },
        { id: 'guardians', label: 'Guardian Index', icon: UserCheck, path: '/guardians' },
        { id: 'promotions', label: 'Cohort Promotions', icon: ArrowUpCircle, path: '/promotions' }
      );
    }

    // Teacher Section
    if (hasRole('teacher')) {
      items.push(
        { id: 'h-lms', label: 'LMS Center', icon: ClipboardList, path: '#', isHeader: true },
        { id: 'lesson-notes', label: 'Lesson Vault', icon: FileText, path: '/lesson-notes' },
        { id: 'assignments', label: 'Task Manager', icon: ClipboardList, path: '/assignments' },
        { id: 'attendance', label: 'Daily Register', icon: CalendarCheck, path: '/attendance' },
        { id: 'assessments', label: 'Evaluations', icon: ListChecks, path: '/assessments' },
        { id: 'results', label: 'Gradebook', icon: Trophy, path: '/results' }
      );
    }

    // Finance Group
    if (hasRole('finance_officer') || hasRole('school_admin')) {
      items.push(
        { id: 'h-finance', label: 'Revenue & Finance', icon: CreditCard, path: '#', isHeader: true },
        { id: 'fees', label: 'Fee Schedules', icon: Wallet, path: '/fees' },
        { id: 'fee-types', label: 'Billing Categories', icon: Layers, path: '/fee-structures' },
        { id: 'invoices', label: 'Invoice Ledger', icon: Receipt, path: '/invoices' },
        { id: 'payments', label: 'Settlement Log', icon: CreditCard, path: '/payments' }
      );
    }

    // Student & Guardian Common
    if (hasRole('student')) {
      items.push(
        { id: 'h-learning', label: 'My Education', icon: BookOpen, path: '#', isHeader: true },
        { id: 'stud-assign', label: 'My Tasks', icon: ClipboardList, path: '/assignments' },
        { id: 'stud-attend', label: 'Attendance', icon: CalendarCheck, path: '/attendance' },
        { id: 'stud-results', label: 'My Results', icon: Trophy, path: '/results' }
      );
    }

    items.push(
      { id: 'h-settings', label: 'Configuration', icon: Settings, path: '#', isHeader: true },
      { id: 'profile', label: 'My Profile', icon: UserCheck, path: '/profile' },
      { id: 'settings', label: 'System Settings', icon: Settings, path: '/settings' }
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
            <span className="text-xl font-bold text-gray-800 tracking-tight font-outfit">eSchool</span>
          </div>
          
          <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              if (item.isHeader) {
                return (
                  <p key={item.id} className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 pt-6 pb-2">
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
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-primary font-medium'}`}
                >
                  <Icon size={16} />
                  <span className="text-xs truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="mb-4 px-4 flex items-center gap-2">
               <ShieldCheck size={14} className="text-green-500" />
               <span className="text-[10px] font-black text-gray-400 uppercase truncate">Context: {user?.role.replace('_', ' ')}</span>
            </div>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-black text-[10px] uppercase tracking-widest">
              <LogOut size={16} /> Terminate Session
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
