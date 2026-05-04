import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { pairsApi } from '../../api/pairs';
import { MentorPair, PairStatus } from '../../types';

const statusLabels: Record<PairStatus, string> = {
  active: 'Активна',
  completed: 'Завершена',
  paused: 'Приостановлена',
};

const statusColors: Record<PairStatus, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  paused: 'bg-yellow-100 text-yellow-700',
};

export default function PairsPage() {
  const [pairs, setPairs] = useState<MentorPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PairStatus | ''>('');

  useEffect(() => {
    loadPairs();
  }, [filter]);

  async function loadPairs() {
    setLoading(true);
    try {
      const res = await pairsApi.getAll(filter as PairStatus || undefined);
      setPairs(res.data.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: PairStatus) {
    try {
      await pairsApi.updateStatus(id, status);
      toast.success('Статус обновлён');
      loadPairs();
    } catch {
      toast.error('Не удалось обновить статус');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Пары наставничества</h1>
          <p className="text-gray-500 mt-1">Управление парами адаптации</p>
        </div>
        <Link to="/hr/pairs/create" className="btn-primary">
          + Создать пару
        </Link>
      </div>

      <div className="flex gap-2">
        {(['', 'active', 'paused', 'completed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {s === '' ? 'Все' : statusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Загрузка...</div>
      ) : (
        <div className="grid gap-4">
          {pairs.map((pair) => {
            const tasks = pair.tasks || [];
            const done = tasks.filter((t) => t.status === 'completed').length;
            const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

            return (
              <div key={pair.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[pair.status]}`}>
                        {statusLabels[pair.status]}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {pair.mentor.firstName} {pair.mentor.lastName}
                      <span className="text-gray-400 font-normal mx-2">→</span>
                      {pair.employee.firstName} {pair.employee.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(pair.startDate), 'd MMM', { locale: ru })} —{' '}
                      {format(new Date(pair.endDate), 'd MMM yyyy', { locale: ru })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={pair.status}
                      onChange={(e) => handleStatusChange(pair.id, e.target.value as PairStatus)}
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(statusLabels).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                    <Link to={`/pairs/${pair.id}`} className="btn-secondary text-sm">
                      Открыть
                    </Link>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Выполнение задач</span>
                    <span>{done}/{tasks.length} задач ({progress}%)</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {pairs.length === 0 && (
            <div className="card text-center py-12 text-gray-500">
              Пар не найдено
            </div>
          )}
        </div>
      )}
    </div>
  );
}
