
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, CreditCard, Settings,
  MessageSquare, LogOut, CalendarCheck, ClipboardList, Trophy, FileText,
  Clock, ShieldAlert, BarChart3, Heart, Library as LibraryIcon, ArrowUpCircle,
  History, Layers, Calendar, Calculator, ListChecks, Wallet, Receipt,
  Lock, UserCheck, Package, Cpu, LucideIcon, Megaphone, CheckSquare, 
  FolderSearch, School, Globe, Paperclip, UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  isHeader?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    const items: NavItem[] = [{ label: 'Dashboard', icon: LayoutDashboard, path: '/' }];

    if (user?.role === UserRole.SUPER_ADMIN) {
      items.push(
        { label: 'Platform Engine', icon: ShieldAlert, path: '/super-admin', isHeader: true },
        { label: 'Schools', icon: School, path: '/super-admin' },
        { label: 'Users', icon: Globe, path: '/global-users' },
        { label: 'Payments', icon: CreditCard, path: '/payments' },
        { label: 'Plans', icon: Package, path: '/plans' },
        { label: 'System Settings', icon: Settings, path: '/settings' },
        { label: 'Jobs', icon: Cpu, path: '/system-jobs' },
        { label: 'Audit Logs', icon: History, path: '/audit-logs' }
      );
      return items;
    }

    if (user?.role === UserRole.GUARDIAN) {
      items.push(
        { label: 'Guardian Portal', icon: Heart, path: '/guardian-portal', isHeader: true },
        { label: 'My Children', icon: Heart, path: '/guardian-portal' },
        { label: 'Communications', icon: MessageSquare, path: '/communication' },
        { label: 'Timetables', icon: Clock, path: '/timetables' },
        { label: 'Library', icon: LibraryIcon, path: '/library' },
        { label: 'Settings', icon: Settings, path: '/profile' }
      );
      return items;
    }

    if ([UserRole.SCHOOL_ADMIN, UserRole.TEACHER].includes(user?.role as UserRole)) {
      items.push(
        { label: 'Institutional Registry', icon: Users, path: '/students', isHeader: true },
        { label: 'Students', icon: GraduationCap, path: '/students' },
        { label: 'Promotions', icon: ArrowUpCircle, path: '/promotions' },
        { label: 'Teachers', icon: Users, path: '/teachers' },
        { label: 'Guardians', icon: UserCheck, path: '/guardians' }
      );

      items.push(
        { label: 'Academic Framework', icon: Layers, path: '/classes', isHeader: true },
        { label: 'Classes', icon: School, path: '/classes' },
        { label: 'Sections', icon: Layers, path: '/sections' },
        { label: 'Subjects', icon: BookOpen, path: '/subjects' },
        { label: 'Subject Assignments', icon: UserPlus, path: '/subject-assignments' },
        { label: 'Sessions & Terms', icon: Calendar, path: '/academic-sessions' },
        { label: 'Enrollments', icon: ClipboardList, path: '/enrollments' }
      );

      items.push(
        { label: 'Learning Management', icon: ClipboardList, path: '/lesson-notes', isHeader: true },
        { label: 'Lesson Notes', icon: FileText, path: '/lesson-notes' },
        { label: 'Assignments', icon: ClipboardList, path: '/assignments' },
        { label: 'Attendance', icon: CalendarCheck, path: '/attendance' },
        { label: 'Attachments', icon: Paperclip, path: '/attachments' },
        { label: 'Assessments', icon: ListChecks, path: '/assessments' },
        { label: 'Results', icon: Trophy, path: '/results' },
        { label: 'Timetables', icon: Clock, path: '/timetables' },
        { label: 'Reports', icon: BarChart3, path: '/reports' }
      );

      items.push(
        { label: 'Administration & Finance', icon: CreditCard, path: '/finance', isHeader: true },
        { label: 'Finance Overview', icon: CreditCard, path: '/finance' },
        { label: 'Fees & Structures', icon: Wallet, path: '/fees' },
        { label: 'Invoices', icon: Receipt, path: '/invoices' },
        { label: 'Payments', icon: CreditCard, path: '/payments' },
        { label: 'Library', icon: LibraryIcon, path: '/library' },
        { label: 'Audit Logs', icon: History, path: '/audit-logs' },
        { label: 'Roles & Permissions', icon: Lock, path: '/roles-permissions' }
      );
    }

    return items;
  };

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
            {getNavItems().map((item, i) => {
              if (item.isHeader) {
                return (
                  <p key={`header-${i}`} className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 pt-6 pb-2">
                    {item.label}
                  </p>
                );
              }
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => window.innerWidth < 1024 && onClose()}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${isActive ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-primary font-medium'}`}>
                  <Icon size={16} />
                  <span className="text-xs truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-black text-[10px] uppercase tracking-widest">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
