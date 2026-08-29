'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: '🏠' },
  { href: '/chat',      label: 'المحادثة',     icon: '💬' },
  { href: '/tasks',     label: 'المهام',        icon: '✅' },
  { href: '/projects',  label: 'المشاريع',      icon: '📁' },
  { href: '/ideas',     label: 'الأفكار',       icon: '💡' },
  { href: '/approvals', label: 'الموافقات',     icon: '⏳', badge: 0 },
  { href: '/activity',  label: 'النشاط',        icon: '📋' },
  { href: '/reports',   label: 'التقارير',      icon: '📊' },
  { href: '/settings',  label: 'الإعدادات',     icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 border-l border-gray-800 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl">
            ⚡
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">وكيلي سيف</h1>
            <p className="text-xs text-gray-500">المساعد التنفيذي الذكي</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-150',
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <span className="text-lg w-6 text-center">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-amber-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
            م
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">المستخدم</p>
            <p className="text-xs text-gray-500">وكيل تنفيذي نشط</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400" title="متصل" />
        </div>
      </div>
    </aside>
  );
}
