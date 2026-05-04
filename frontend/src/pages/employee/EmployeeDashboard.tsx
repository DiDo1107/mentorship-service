import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { dashboardApi } from '../../api/dashboard';
import { MentorPair, Task, Meeting } from '../../types';

interface EmployeeData {
  pair: MentorPair;
  progress: number;
  overdueTasks: number;
  upcomingTasks: Task[];
}

const statusLabels: Record<string, string> = {
  not_started: 'Не начата',
  in_progress: 'В процессе',
  completed: 'Выполнена',
};

const priorityColors: Record<string, string> = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-yellow-700 bg-yellow-50',
  low: 'text-green-700 bg-green-50',
};

export default function EmployeeDashboard() {
  const [data, setData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get().then((res) => {
      setData(res.data.data as EmployeeData);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Загрузка...</div>;
  }

  if (!data) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 text-lg">У вас ещё нет активного плана адаптации</p>
        <p className="text-gray-400 text-sm mt-2">HR-менеджер назначит вам наставника</p>
      </div>
    );
  }

  const { pair, progress, overdueTasks, upcomingTasks } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Мой прогресс</h1>
        <p className="text-gray-500 mt-1">
          Наставник: {pair.mentor.firstName} {pair.mentor.lastName}
        </p>
      </div>

      {/* Progress card */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Прогресс адаптации</h2>
          <span className="text-2xl font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-4 mb-3">
          <div
            className={`h-4 rounded-full transition-all ${
              progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Начало: {format(new Date(pair.startDate), 'd MMM yyyy', { locale: ru })}
          </span>
          <span>
            Окончание: {format(new Date(pair.endDate), 'd MMM yyyy', { locale: ru })}
          </span>
        </div>
        {overdueTasks > 0 && (
          <div className="mt-3 p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700 font-medium">
              ⚠ У вас {overdueTasks} просроченных задач
            </p>
          </div>
        )}
      </div>

      {/* Upcoming tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Ближайшие задачи</h2>
          <Link to="/employee/tasks" className="text-sm text-blue-600 hover:underline">
            Все задачи →
          </Link>
        </div>

        {upcomingTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Все задачи выполнены! 🎉</p>
        ) : (
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-2 h-8 rounded-full flex-shrink-0 ${
                    task.priority === 'high'
                      ? 'bg-red-500'
                      : task.priority === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    До {format(new Date(task.deadline), 'd MMM', { locale: ru })} •{' '}
                    {statusLabels[task.status]}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${priorityColors[task.priority]}`}>
                  {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming meetings */}
      {pair.meetings && pair.meetings.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ближайшие встречи</h2>
          <div className="space-y-3">
            {pair.meetings.slice(0, 3).map((meeting: Meeting) => (
              <div key={meeting.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-500 text-xl">📅</div>
                <div>
                  <p className="font-medium text-gray-900">
                    {format(new Date(meeting.scheduledAt), 'd MMMM, HH:mm', { locale: ru })}
                  </p>
                  {meeting.notes && (
                    <p className="text-sm text-gray-500">{meeting.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link to="/employee/tasks" className="btn-primary flex-1 text-center">
          Все задачи
        </Link>
        <Link to={`/pairs/${pair.id}/feedback`} className="btn-secondary flex-1 text-center">
          Оставить отзыв
        </Link>
      </div>
    </div>
  );
}
