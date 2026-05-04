import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { pairsApi } from '../../api/pairs';
import { User } from '../../types';

export default function CreatePairPage() {
  const [mentors, setMentors] = useState<User[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [form, setForm] = useState({
    mentorId: '',
    employeeId: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      authApi.getUsers('mentor'),
      authApi.getUsers('employee'),
    ]).then(([m, e]) => {
      setMentors(m.data.data || []);
      setEmployees(e.data.data || []);
    });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.mentorId || !form.employeeId || !form.startDate || !form.endDate) {
      toast.error('Заполните все поля');
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error('Дата окончания должна быть позже даты начала');
      return;
    }
    setLoading(true);
    try {
      await pairsApi.create({
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      });
      toast.success('Пара наставничества создана');
      navigate('/hr/pairs');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Ошибка создания пары';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Создать пару наставничества</h1>
        <p className="text-gray-500 mt-1">Назначьте наставника новому сотруднику</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Наставник</label>
            <select
              name="mentorId"
              className="input"
              value={form.mentorId}
              onChange={handleChange}
              required
            >
              <option value="">Выберите наставника</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Новый сотрудник</label>
            <select
              name="employeeId"
              className="input"
              value={form.employeeId}
              onChange={handleChange}
              required
            >
              <option value="">Выберите сотрудника</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Дата начала</label>
              <input
                type="date"
                name="startDate"
                className="input"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="label">Дата окончания</label>
              <input
                type="date"
                name="endDate"
                className="input"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Создание...' : 'Создать пару'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/hr/pairs')}
              className="btn-secondary"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
