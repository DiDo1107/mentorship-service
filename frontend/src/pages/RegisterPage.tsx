import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi, RegisterData } from '../api/auth';

const roleOptions = [
  { value: 'employee', label: 'Новый сотрудник' },
  { value: 'mentor', label: 'Наставник' },
  { value: 'hr', label: 'HR-менеджер' },
];

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(form);
      toast.success('Аккаунт создан! Войдите в систему.');
      navigate('/login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Ошибка регистрации';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Наставничество</h1>
          <p className="text-gray-600 mt-2">Регистрация нового аккаунта</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Создать аккаунт</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Имя</label>
                <input
                  type="text"
                  name="firstName"
                  className="input"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="label">Фамилия</label>
                <input
                  type="text"
                  name="lastName"
                  className="input"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                className="input"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Пароль</label>
              <input
                type="password"
                name="password"
                className="input"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="label">Роль</label>
              <select name="role" className="input" value={form.role} onChange={handleChange}>
                {roleOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
