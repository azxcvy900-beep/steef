import { Sidebar } from '@/components/layout/Sidebar';
import { getUserTasks } from '@/app/actions/tasks';
import { Task } from '@/types/models.types';

// Hardcoded for Phase 2 until Auth is implemented
const USER_ID = 'user_001';

export const dynamic = 'force-dynamic';

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'CRITICAL': return 'bg-red-900/50 text-red-400 border-red-800';
    case 'HIGH': return 'bg-orange-900/50 text-orange-400 border-orange-800';
    case 'MEDIUM': return 'bg-blue-900/50 text-blue-400 border-blue-800';
    default: return 'bg-gray-800 text-gray-400 border-gray-700';
  }
}

export default async function TasksPage() {
  const tasks = await getUserTasks(USER_ID);

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden" dir="rtl">
      <Sidebar />
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white">المهام النشطة</h1>
            <p className="text-gray-400 mt-2">قائمة المهام التي تم إنشاؤها عبر الوكيل سيف</p>
          </header>

          {tasks.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800">
              <div className="text-5xl mb-4 opacity-50">📋</div>
              <h2 className="text-xl text-gray-300">لا توجد مهام حالياً</h2>
              <p className="text-gray-500 mt-2">اطلب من سيف إنشاء مهمة جديدة لك</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tasks.map((task: Task) => (
                <div key={task.id} className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                    {task.description && <p className="text-gray-400 mt-1 text-sm">{task.description}</p>}
                    <div className="flex gap-2 mt-3 text-xs font-medium">
                      <span className={`px-2 py-1 rounded-md border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="px-2 py-1 rounded-md bg-gray-800 text-gray-300 border border-gray-700">
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {task.createdAt ? new Date((task.createdAt as any).seconds * 1000 || task.createdAt).toLocaleDateString('ar-SA') : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
