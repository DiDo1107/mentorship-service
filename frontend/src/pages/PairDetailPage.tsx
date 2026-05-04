import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { pairsApi } from '../api/pairs';
import { useAuthStore } from '../store/authStore';
import { MentorPair, Task } from '../types';

const statusLabels: Record<string, string> = {
  active: 'Активна',
  completed: 'Завершена',
  paused: 'Приостановлена',
};

const taskStatusLabels: Record<string, string> = {
  not_started: 'Не начата',
  in_progress: 'В процессе',
  completed: 'Выполнена',
};

const taskStatusColors: Record<string, string> = {
  not_started: 'status-not-started',
  in_progress: 'status-in-progress',
  completed: 'status-completed',
};

const priorityLabels: Record<string, string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

const priorityBadgeClass: Record<string, string> = {
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

export default function PairDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [pair, setPair] = useState<MentorPair | null>(null);

  useEffect(() => {
    if (!id) return;
    pairsApi.getById(id).then((res) => setPair(res.data.data || null));
  }, [id]);

  if (!pair) return <div className="text-gray-500">Загрузка...</div>;

  const tasks = (pair.tasks || []) as Task[];
  const done = tasks.filter((t) => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          ← Назад
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {pair.mentor.firstName} {pair.mentor.lastName} → {pair.employee.firstName}{' '}
              {pair.employee.lastName}
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
              {statusLabels[pair.status]}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(pair.startDate), 'd MMM', { locale: ru })} —{' '}
            {format(new Date(pair.endDate), 'd MMM yyyy', { locale: ru })}
          </p>
        </div>
        {(user?.role === 'mentor' || user?.role === 'employee') && (
          <Link to={`/pairs/${id}/feedback`} className="btn-secondary">
            Обратная связь
          </Link>
        )}
        {user?.role === 'mentor' && (
          <Link to={`/mentor/pairs/${id}`} className="btn-primary">
            Управлять
          </Link>
        )}
      </div>

      <div className="card">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Прогресс</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{done} из {tasks.length} задач</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Задачи</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-400 text-sm">Задач нет</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={priorityBadgeClass[task.priority]}>
                        {priorityLabels[task.priority]}
                      </span>
                      <span className={taskStatusColors[task.status]}>
                        {taskStatusLabels[task.status]}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-400">
                      До {format(new Date(task.deadline), 'd MMM', { locale: ru })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Встречи</h2>
          {!pair.meetings || pair.meetings.length === 0 ? (
            <p className="text-gray-400 text-sm">Встреч нет</p>
          ) : (
            <div className="space-y-3">
              {pair.meetings.map((meeting) => (
                <div key={meeting.id} className="py-2 border-b border-gray-100 last:border-0">
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(meeting.scheduledAt), 'd MMMM, HH:mm', { locale: ru })}
                  </p>
                  {meeting.notes && (
                    <p className="text-xs text-gray-500 mt-0.5">{meeting.notes}</p>
                  )}
                  {meeting.summary && (
                    <p className="text-xs text-green-600 mt-0.5">✓ {meeting.summary}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
