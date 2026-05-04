import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { user, accessToken, refreshToken } = res.data.data!;
      setAuth(user, accessToken, refreshToken);
      toast.success('Добро пожаловать!');
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Ошибка входа';
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
          <p className="text-gray-600 mt-2">Система адаптации новых сотрудников</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Вход в систему</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="your@email.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Пароль</label>
              <input
                type="password"
                className="input"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Зарегистрироваться
            </Link>
          </p>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-2">Тестовые аккаунты:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>HR: hr@company.ru / password123</p>
              <p>Наставник: mentor1@company.ru / password123</p>
              <p>Сотрудник: employee1@company.ru / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
