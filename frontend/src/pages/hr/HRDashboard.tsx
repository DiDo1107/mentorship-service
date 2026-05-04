import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { dashboardApi } from '../../api/dashboard';
import { reportApi } from '../../api/report';
import { MentorPair } from '../../types';

interface HRData {
  summary: {
    totalPairs: number;
    activePairs: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
    users: Record<string, number>;
  };
  pairs: Array<MentorPair & { progress: number }>;
}

function StatCard({ title, value, sub, color }: { title: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

const statusLabels: Record<string, string> = {
  active: 'Активна',
  completed: 'Завершена',
  paused: 'Приостановлена',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  paused: 'bg-yellow-100 text-yellow-700',
};

export default function HRDashboard() {
  const [data, setData] = useState<HRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownload(pairId: string) {
    setDownloadingId(pairId);
    try {
      await reportApi.downloadPairReport(pairId);
    } catch {
      // silent
    } finally {
      setDownloadingId(null);
    }
  }

  useEffect(() => {
    dashboardApi.get().then((res) => {
      setData(res.data.data as HRData);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Загрузка...</div>;
  }

  if (!data) return null;

  const taskStatusData = [
    { name: 'Не начаты', value: data.summary.totalTasks - data.summary.completedTasks - (data.pairs.reduce((acc, p) => acc + (p.tasks?.filter(t => t.status === 'in_progress').length ?? 0), 0)), fill: '#94a3b8' },
    { name: 'В процессе', value: data.pairs.reduce((acc, p) => acc + (p.tasks?.filter(t => t.status === 'in_progress').length ?? 0), 0), fill: '#3b82f6' },
    { name: 'Выполнены', value: data.summary.completedTasks, fill: '#22c55e' },
  ];

  const pairProgressData = data.pairs.map((p) => ({
    name: `${p.employee.firstName} ${p.employee.lastName}`,
    progress: p.progress,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Дашборд HR</h1>
        <p className="text-gray-500 mt-1">Общая статистика наставничества</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Всего пар" value={data.summary.totalPairs} color="text-blue-600" />
        <StatCard title="Активных пар" value={data.summary.activePairs} color="text-green-600" />
        <StatCard
          title="Выполнение задач"
          value={`${data.summary.completionRate}%`}
          sub={`${data.summary.completedTasks} из ${data.summary.totalTasks}`}
          color="text-purple-600"
        />
        <StatCard
          title="Просроченных задач"
          value={data.summary.overdueTasks}
          color="text-red-600"
        />
      </div>

      {data.summary.totalTasks > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Статусы задач</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={taskStatusData.filter((d) => d.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                  labelLine={false}
                >
                  {taskStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {pairProgressData.length > 0 && (
            <div className="card">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Прогресс по сотрудникам</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pairProgressData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="progress" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Все пары наставничества</h2>
          <Link to="/hr/pairs/create" className="btn-primary text-sm">
            + Создать пару
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-gray-600 font-medium">Наставник</th>
                <th className="text-left py-3 px-2 text-gray-600 font-medium">Сотрудник</th>
                <th className="text-left py-3 px-2 text-gray-600 font-medium">Дата окончания</th>
                <th className="text-left py-3 px-2 text-gray-600 font-medium">Прогресс</th>
                <th className="text-left py-3 px-2 text-gray-600 font-medium">Статус</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.pairs.map((pair) => (
                <tr key={pair.id} className="hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">
                    {pair.mentor.firstName} {pair.mentor.lastName}
                  </td>
                  <td className="py-3 px-2">
                    {pair.employee.firstName} {pair.employee.lastName}
                  </td>
                  <td className="py-3 px-2 text-gray-500">
                    {format(new Date(pair.endDate), 'd MMM yyyy', { locale: ru })}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 w-20">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${pair.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{pair.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[pair.status]}`}>
                      {statusLabels[pair.status]}
                    </span>
                  </td>
                  <td className="py-3 px-2 flex items-center gap-3">
                    <Link to={`/pairs/${pair.id}`} className="text-blue-600 hover:underline text-xs">
                      Подробнее
                    </Link>
                    <button
                      onClick={() => handleDownload(pair.id)}
                      disabled={downloadingId === pair.id}
                      className="text-gray-500 hover:text-gray-700 text-xs flex items-center gap-1 disabled:opacity-50"
                      title="Скачать PDF отчёт"
                    >
                      {downloadingId === pair.id ? '...' : '⬇ PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.pairs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Пар наставничества нет.{' '}
              <Link to="/hr/pairs/create" className="text-blue-600 hover:underline">
                Создать первую
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
