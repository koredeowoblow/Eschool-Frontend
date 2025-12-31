import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users, GraduationCap, BookOpen, CreditCard, Settings,
  MessageSquare, LogOut, CalendarCheck, ClipboardList, Trophy, FileText,
  Clock, ShieldAlert, BarChart3, Heart, Library as LibraryIcon, ArrowUpCircle,
  History, Layers, Calendar as CalendarIcon, ListChecks, Wallet, Receipt,
  Lock, UserCheck, Package, Cpu, LucideIcon, School, Globe, Paperclip,
  UserPlus, ShieldCheck, Zap, LayoutDashboard, Building, CalendarRange,
  CalendarDays, Link as LinkIcon, PenTool, BadgeDollarSign, Tags, Percent,
  UserCog, FileInput, Activity
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
    const isSuperAdmin = hasRole('super_admin');
    const isSchoolAdmin = hasRole('school_admin') || isSuperAdmin;
    const isTeacher = hasRole('teacher');
    const isStudent = hasRole('student');

    // Common Header (Dashboard)
    items.push(
      { id: 'h-common', label: 'Home', icon: Zap, path: '#', isHeader: true },
      { id: 'dash', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { id: 'chats', label: 'Messages', icon: MessageSquare, path: '/communication' }
    );

    // 1. Platform Administration (Super Admin Exclusive)
    if (isSuperAdmin) {
      items.push(
        { id: 'h-super', label: 'Platform Administration', icon: ShieldAlert, path: '#', isHeader: true },
        { id: 'super-schools', label: 'Schools', icon: School, path: '/super-admin' },
        { id: 'super-users', label: 'Global Users', icon: Globe, path: '/global-users' },
        { id: 'super-plans', label: 'Membership Plans', icon: Package, path: '/plans' },
        { id: 'super-payments', label: 'Platform Payments', icon: BadgeDollarSign, path: '/payments' },
        { id: 'super-settings', label: 'System Settings', icon: Settings, path: '/settings' },

        { id: 'h-monitor', label: 'System Monitoring', icon: Activity, path: '#', isHeader: true },
        { id: 'super-audit', label: 'Audit Logs', icon: ShieldCheck, path: '/audit-logs' },
        { id: 'super-jobs', label: 'System Jobs', icon: Cpu, path: '/system-jobs' },
        { id: 'super-roles', label: 'Role Management', icon: UserCog, path: '/roles-permissions' }
      );
    }

    // 2. Academic / School Admin Panel (Super Admin + School Admin)
    if (isSchoolAdmin) {
      items.push(
        { id: 'h-academic', label: 'Academic', icon: BookOpen, path: '#', isHeader: true },
        { id: 'acad-sessions', label: 'Sessions', icon: CalendarRange, path: '/academic-sessions' },
        { id: 'acad-sections', label: 'Sections', icon: Layers, path: '/sections' },
        { id: 'acad-classes', label: 'Classes', icon: School, path: '/classes' },
        { id: 'acad-subjects', label: 'Subjects', icon: BookOpen, path: '/subjects' },
        { id: 'acad-assign', label: 'Assign Subjects', icon: LinkIcon, path: '/subject-assignments' },

        { id: 'h-staff', label: 'Staff Management', icon: Users, path: '#', isHeader: true },
        { id: 'staff-teachers', label: 'Teachers', icon: UserCheck, path: '/teachers' },
        { id: 'staff-generic', label: 'Staff', icon: UserCog, path: '/staff' },

        { id: 'h-students', label: 'Students', icon: GraduationCap, path: '#', isHeader: true },
        { id: 'stud-list', label: 'Students', icon: GraduationCap, path: '/students' },
        { id: 'stud-guardians', label: 'Guardians', icon: Heart, path: '/guardians' },
        { id: 'stud-promotions', label: 'Promotions', icon: ArrowUpCircle, path: '/promotions' }
      );
    }

    // 3. Assessment
    if (isSchoolAdmin || isTeacher) {
      items.push(
        { id: 'h-assess', label: 'Assessment', icon: ListChecks, path: '#', isHeader: true },
        { id: 'ass-assignments', label: 'Assignments', icon: ClipboardList, path: '/assignments' },
      );

      if (isSchoolAdmin || isTeacher) {
        items.push({ id: 'ass-submissions', label: 'Submissions', icon: FileInput, path: '/assignments/submissions' });
      }

      items.push(
        { id: 'ass-assessments', label: 'Assessments', icon: PenTool, path: '/assessments' },
        { id: 'ass-results', label: 'Results', icon: Trophy, path: '/results' }
      );

      if (isSchoolAdmin) {
        items.push({ id: 'ass-reports', label: 'Academic Reports', icon: BarChart3, path: '/reports' });
      }
    }

    // 4. Finance
    if (isSchoolAdmin) {
      items.push(
        { id: 'h-finance', label: 'Finance', icon: BadgeDollarSign, path: '#', isHeader: true },
        { id: 'fin-fees', label: 'Fees List', icon: Wallet, path: '/fees' },
        { id: 'fin-payments', label: 'General Payments', icon: CreditCard, path: '/payments' },
        { id: 'fin-invoices', label: 'Invoices', icon: Receipt, path: '/invoices' },
        { id: 'fin-types', label: 'Fee Categories', icon: Tags, path: '/fee-structures' }
      );
    }

    // 5. Settings
    if (isSchoolAdmin) {
      items.push(
        { id: 'h-school-settings', label: 'School Settings', icon: Settings, path: '#', isHeader: true },
        { id: 'set-profile', label: 'School Profile', icon: Building, path: '/profile' },
        { id: 'set-grading', label: 'Grading System', icon: Percent, path: '/grading-scales' }
      );
    }

    // Teacher Specific
    if (isTeacher) {
      if (!isSchoolAdmin) {
        items.push({ id: 'h-teach', label: 'Teaching', icon: BookOpen, path: '#', isHeader: true });
      }
      items.push(
        { id: 'teach-lessons', label: 'Lesson Notes', icon: FileText, path: '/lesson-notes' },
        { id: 'teach-attend', label: 'Attendance', icon: CalendarCheck, path: '/attendance' }
      );
    }

    // Student
    if (isStudent && !isSchoolAdmin && !isTeacher) {
      items.push(
        { id: 'h-learning', label: 'My School', icon: BookOpen, path: '#', isHeader: true },
        { id: 'stud-assign', label: 'My Work', icon: ClipboardList, path: '/assignments' },
        { id: 'stud-attend', label: 'Attendance', icon: CalendarCheck, path: '/attendance' },
        { id: 'stud-results', label: 'My Results', icon: Trophy, path: '/results' }
      );
    }

    // Generic Settings
    if (!isSchoolAdmin && !isSuperAdmin) {
      items.push(
        { id: 'h-user-settings', label: 'Settings', icon: Settings, path: '#', isHeader: true },
        { id: 'user-profile', label: 'Profile', icon: UserCheck, path: '/profile' },
      );
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
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
                  {Icon && <Icon size={16} />}
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
