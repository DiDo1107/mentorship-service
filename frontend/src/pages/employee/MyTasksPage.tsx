import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { pairsApi } from '../../api/pairs';
import { tasksApi } from '../../api/tasks';
import { Task, TaskStatus, MentorPair } from '../../types';
import TaskComments from '../../components/TaskComments';

const statusLabels: Record<TaskStatus, string> = {
  not_started: 'Не начата',
  in_progress: 'В процессе',
  completed: 'Выполнена',
};

const statusBadge: Record<TaskStatus, string> = {
  not_started: 'status-not-started',
  in_progress: 'status-in-progress',
  completed: 'status-completed',
};

const priorityColors: Record<string, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500',
};


export default function MyTasksPage() {
  const [pair, setPair] = useState<MentorPair | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const pairsRes = await pairsApi.getAll();
      const activePair = (pairsRes.data.data || [])[0];
      if (!activePair) { setLoading(false); return; }
      setPair(activePair);
      const tasksRes = await tasksApi.getByPair(activePair.id);
      setTasks(tasksRes.data.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartTask(task: Task) {
    try {
      const res = await tasksApi.update(task.id, { status: 'in_progress' });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data.data! : t)));
      toast.success('Задача взята в работу');
    } catch {
      toast.error('Не удалось обновить статус');
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Загрузка...</div>;
  }

  if (!pair) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">У вас нет активного плана адаптации</p>
      </div>
    );
  }

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Мои задачи</h1>
        <p className="text-gray-500 mt-1">{completed} из {tasks.length} задач выполнено</p>
      </div>

      <div className="card">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Общий прогресс</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'not_started', 'in_progress', 'completed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'Все' : statusLabels[s]}
            {s !== 'all' && (
              <span className="ml-1 text-xs opacity-75">
                ({tasks.filter((t) => t.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((task) => {
          const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';
          return (
            <div
              key={task.id}
              className={`card border-l-4 ${priorityColors[task.priority]} ${task.status === 'completed' ? 'opacity-70' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={statusBadge[task.status]}>{statusLabels[task.status]}</span>
                    {isOverdue && <span className="badge-high">Просрочена</span>}
                  </div>
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  )}
                  <p className={`text-xs mt-1 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                    Дедлайн: {format(new Date(task.deadline), 'd MMMM yyyy', { locale: ru })}
                  </p>
                  {task.fileUrl && (
                    <a
                      href={task.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      📎 {task.fileName || 'Вложение'}
                    </a>
                  )}
                  <TaskComments taskId={task.id} />
                </div>
                {task.status === 'not_started' && (
                  <button
                    onClick={() => handleStartTask(task)}
                    className="btn-secondary text-sm flex-shrink-0"
                  >
                    Начать
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <span className="text-xs text-gray-400 flex-shrink-0 text-right">
                    Ожидает<br />наставника
                  </span>
                )}
                {task.status === 'completed' && (
                  <span className="text-xs text-green-600 flex-shrink-0">✓ Выполнена</span>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card text-center py-8 text-gray-500">
            Задач с выбранным статусом нет
          </div>
        )}
      </div>
    </div>
  );
}
