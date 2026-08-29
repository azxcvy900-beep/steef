import { Sidebar } from '@/components/layout/Sidebar';

function PlaceholderPage({ title, icon, description }: { title: string; icon: string; description: string }) {
  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden" dir="rtl">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">{icon}</div>
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400">{description}</p>
          <p className="text-sm text-indigo-400 mt-4">قيد التطوير — Phase 2</p>
        </div>
      </main>
    </div>
  );
}

export default PlaceholderPage;
