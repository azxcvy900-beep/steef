import Link from 'next/link';

export default function DashboardPage() {
  const stats = [
    { label: 'مهام اليوم',       value: '0',  icon: '✅', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { label: 'مشاريع نشطة',     value: '0',  icon: '📁', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { label: 'أفكار مسجلة',     value: '0',  icon: '💡', color: 'bg-amber-500/10  text-amber-400  border-amber-500/20'  },
    { label: 'موافقات معلقة',   value: '0',  icon: '⏳', color: 'bg-red-500/10    text-red-400    border-red-500/20'    },
  ];

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">لوحة التحكم</h1>
        <p className="text-gray-400">
          {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border p-5 ${stat.color} backdrop-blur-sm`}
          >
            <div className="text-3xl mb-3">{stat.icon}</div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/chat',      label: 'محادثة مع سيف',     icon: '💬', desc: 'تحدث مع وكيلك مباشرة' },
            { href: '/tasks',     label: 'إضافة مهمة',         icon: '➕', desc: 'أضف مهمة جديدة' },
            { href: '/projects',  label: 'مشروع جديد',         icon: '🚀', desc: 'ابدأ مشروع جديد' },
            { href: '/ideas',     label: 'تسجيل فكرة',         icon: '💡', desc: 'احفظ فكرة قبل أن تنساها' },
            { href: '/reports',   label: 'التقرير اليومي',      icon: '📊', desc: 'استعرض تقرير اليوم' },
            { href: '/approvals', label: 'الموافقات المعلقة',   icon: '⏳', desc: 'راجع طلبات الموافقة' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-indigo-500/50 hover:bg-gray-750 transition-all duration-200"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="font-medium text-white text-sm mb-1">{action.label}</div>
              <div className="text-xs text-gray-500">{action.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">حالة النظام</h2>
        <div className="space-y-3">
          {[
            { name: 'وكيل سيف التنفيذي',  status: 'نشط',      ok: true  },
            { name: 'قاعدة البيانات',       status: 'غير مكوّن', ok: false },
            { name: 'نموذج Gemini AI',      status: 'جاهز',     ok: true  },
            { name: 'نظام الموافقات',       status: 'نشط',      ok: true  },
            { name: 'سجل التدقيق',          status: 'نشط',      ok: true  },
          ].map((s) => (
            <div key={s.name} className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">{s.name}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  s.ok
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
