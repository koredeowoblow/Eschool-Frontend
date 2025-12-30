
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
      { id: 'h-common', label: 'Main Menu', icon: Zap, path: '#', isHeader: true },
      { id: 'dash', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { id: 'chats', label: 'Internal Comms', icon: MessageSquare, path: '/communication' }
    );

    // Super Admin Section
    if (hasRole('super_admin')) {
      items.push(
        { id: 'h-super', label: 'Platform Engine', icon: ShieldAlert, path: '#', isHeader: true },
        { id: 'schools', label: 'Schools', icon: School, path: '/super-admin' },
        { id: 'global-users', label: 'Global Users', icon: Globe, path: '/global-users' },
        { id: 'plans', label: 'Membership Plans', icon: Package, path: '/plans' },
        { id: 'platform-payments', label: 'Platform Payments', icon: CreditCard, path: '/payments' },
        { id: 'sys-settings', label: 'System Settings', icon: Settings, path: '/settings' },
        { id: 'audit-logs', label: 'Audit Logs', icon: History, path: '/audit-logs' },
        { id: 'system-jobs', label: 'System Jobs', icon: Cpu, path: '/system-jobs' },
        { id: 'rbac', label: 'Role Management', icon: Lock, path: '/roles-permissions' }
      );
    }

    // School Admin Section
    if (hasRole('school_admin')) {
      items.push(
        { id: 'h-academic', label: 'Academic Framework', icon: Layers, path: '#', isHeader: true },
        { id: 'sessions', label: 'Sessions & Terms', icon: CalendarIcon, path: '/academic-sessions' },
        { id: 'sections', label: 'Divisions / Sections', icon: Layers, path: '/sections' },
        { id: 'classes', label: 'Class Rooms', icon: School, path: '/classes' },
        { id: 'subjects', label: 'Subject Manager', icon: BookOpen, path: '/subjects' },
        { id: 'subject-assign', label: 'Faculty Mapping', icon: UserPlus, path: '/subject-assignments' },
        
        { id: 'h-staff', label: 'Human Resources', icon: Users, path: '#', isHeader: true },
        { id: 'teachers', label: 'Teachers', icon: UserCheck, path: '/teachers' },
        { id: 'staff', label: 'Staff Management', icon: Users, path: '/staff' },

        { id: 'h-students', label: 'Student Registry', icon: GraduationCap, path: '#', isHeader: true },
        { id: 'students', label: 'Students', icon: GraduationCap, path: '/students' },
        { id: 'guardians', label: 'Guardians', icon: UserCheck, path: '/guardians' },
        { id: 'promotions', label: 'Promotions', icon: ArrowUpCircle, path: '/promotions' }
      );
    }

    // Teacher Section
    if (hasRole('teacher')) {
      items.push(
        { id: 'h-lms', label: 'LMS Engine', icon: ClipboardList, path: '#', isHeader: true },
        { id: 'lesson-notes', label: 'Lesson Notes', icon: FileText, path: '/lesson-notes' },
        { id: 'assignments', label: 'Assignments', icon: ClipboardList, path: '/assignments' },
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck, path: '/attendance' },
        { id: 'assessments', label: 'Assessments', icon: ListChecks, path: '/assessments' },
        { id: 'results', label: 'Results Portal', icon: Trophy, path: '/results' },
        { id: 'reports-teach', label: 'Academic Reports', icon: BarChart3, path: '/reports' }
      );
    }

    // Exams Officer Section
    if (hasRole('exams_officer')) {
      items.push(
        { id: 'h-exams', label: 'Exams & Results', icon: Trophy, path: '#', isHeader: true },
        { id: 'results-review', label: 'Review Results', icon: ListChecks, path: '/results' },
        { id: 'acad-history', label: 'Academic History', icon: History, path: '/results' },
        { id: 'acad-reports', label: 'Academic Reports', icon: BarChart3, path: '/reports' }
      );
    }

    // Finance Officer / Admin Finance
    if (hasRole('finance_officer') || hasRole('school_admin')) {
      items.push(
        { id: 'h-finance', label: 'Financial Control', icon: CreditCard, path: '#', isHeader: true },
        { id: 'fees', label: 'Fees Registry', icon: Wallet, path: '/fees' },
        { id: 'fee-types', label: 'Fee Categories', icon: Layers, path: '/fee-structures' },
        { id: 'invoices', label: 'Invoices', icon: Receipt, path: '/invoices' },
        { id: 'payments', label: 'Record Payment', icon: CreditCard, path: '/payments' },
        { id: 'fin-reports', label: 'Finance Reports', icon: BarChart3, path: '/reports' }
      );
    }

    // Student Section
    if (hasRole('student')) {
      items.push(
        { id: 'h-learning', label: 'Learning Center', icon: BookOpen, path: '#', isHeader: true },
        { id: 'stud-assign', label: 'My Assignments', icon: ClipboardList, path: '/assignments' },
        { id: 'stud-attend', label: 'My Attendance', icon: CalendarCheck, path: '/attendance' },
        { id: 'stud-results', label: 'My Results', icon: Trophy, path: '/results' },
        { id: 'stud-fees', label: 'Fees & Finance', icon: Receipt, path: '/finance' }
      );
    }

    // Guardian Section
    if (hasRole('guardian')) {
      items.push(
        { id: 'h-guardian', label: 'Guardian Portal', icon: Heart, path: '#', isHeader: true },
        { id: 'my-wards', label: 'My Children', icon: Heart, path: '/guardian-portal' },
        { id: 'ward-results', label: 'Results View', icon: Trophy, path: '/results' },
        { id: 'ward-finance', label: 'Fee Payments', icon: CreditCard, path: '/finance' }
      );
    }

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
               <span className="text-[10px] font-black text-gray-400 uppercase truncate">Primary: {user?.role.replace('_', ' ')}</span>
            </div>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-black text-[10px] uppercase tracking-widest">
              <LogOut size={16} /> Logout Session
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
