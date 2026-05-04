import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { dashboardApi } from '../../api/dashboard';
import { MentorPair } from '../../types';

type MentorPairWithProgress = MentorPair & { progress: number; overdueTasks: number };

const priorityColors: Record<string, string> = {
  high: 'text-red-600',
  medium: 'text-yellow-600',
  low: 'text-green-600',
};

export default function MentorDashboard() {
  const [pairs, setPairs] = useState<MentorPairWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get().then((res) => {
      setPairs((res.data.data as MentorPairWithProgress[]) || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Мои подопечные</h1>
        <p className="text-gray-500 mt-1">{pairs.length} активных пар наставничества</p>
      </div>

      {pairs.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">У вас пока нет подопечных</p>
          <p className="text-sm text-gray-400 mt-1">HR-менеджер назначит вам новых сотрудников</p>
        </div>
      )}

      <div className="grid gap-6">
        {pairs.map((pair) => (
          <div key={pair.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {pair.employee.firstName} {pair.employee.lastName}
                </h3>
                <p className="text-sm text-gray-500">{pair.employee.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Адаптация до {format(new Date(pair.endDate), 'd MMMM yyyy', { locale: ru })}
                </p>
              </div>
              <Link to={`/mentor/pairs/${pair.id}`} className="btn-primary text-sm">
                Управлять
              </Link>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Прогресс адаптации</span>
                <span className="font-medium text-gray-900">{pair.progress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    pair.progress >= 80 ? 'bg-green-500' : pair.progress >= 40 ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${pair.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-500">Задач всего: </span>
                <span className="font-medium">{pair.tasks?.length || 0}</span>
              </div>
              {pair.overdueTasks > 0 && (
                <div>
                  <span className="text-red-500">Просрочено: </span>
                  <span className="font-medium text-red-600">{pair.overdueTasks}</span>
                </div>
              )}
              {pair.meetings && pair.meetings.length > 0 && (
                <div>
                  <span className="text-gray-500">Следующая встреча: </span>
                  <span className="font-medium">
                    {format(new Date(pair.meetings[0].scheduledAt), 'd MMM', { locale: ru })}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
