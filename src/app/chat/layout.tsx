import { Sidebar } from '@/components/layout/Sidebar';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden" dir="rtl">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-800 bg-gray-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <h2 className="font-semibold text-white">سيف — وكيلك التنفيذي</h2>
            <span className="text-xs text-gray-500 mr-auto">
              Gemini 2.0 Flash • جميع الإجراءات تحت إشرافك
            </span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
