import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { notificationsApi } from '../api/notifications';
import { Notification } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';

const roleLabels: Record<string, string> = {
  hr: 'HR-менеджер',
  mentor: 'Наставник',
  employee: 'Сотрудник',
};

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function loadNotifications() {
    try {
      const res = await notificationsApi.getAll();
      setNotifications(res.data.data || []);
    } catch {}
  }

  async function handleOpen() {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      try {
        await notificationsApi.markAllRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch {}
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        title="Уведомления"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-3 border-b border-gray-100 font-medium text-sm text-gray-700">
            Уведомления
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-400">Нет уведомлений</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 text-sm ${n.read ? 'text-gray-500' : 'text-gray-800 bg-blue-50'}`}
                >
                  <p>{n.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(n.createdAt), 'd MMM, HH:mm', { locale: ru })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { user, refreshToken, logout } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {}
    logout();
    navigate('/login');
    toast.success('Вы вышли из системы');
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">Наставничество</h1>
          <p className="text-xs text-gray-500 mt-1">Система адаптации</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {user?.role === 'hr' && (
            <>
              <NavItem to="/hr/dashboard">Дашборд</NavItem>
              <NavItem to="/hr/pairs">Все пары</NavItem>
              <NavItem to="/hr/pairs/create">Создать пару</NavItem>
              <NavItem to="/hr/users">Пользователи</NavItem>
            </>
          )}
          {user?.role === 'mentor' && (
            <>
              <NavItem to="/mentor/dashboard">Мои подопечные</NavItem>
            </>
          )}
          {user?.role === 'employee' && (
            <>
              <NavItem to="/employee/dashboard">Мой прогресс</NavItem>
              <NavItem to="/employee/tasks">Мои задачи</NavItem>
            </>
          )}
          <div className="border-t border-gray-100 mt-2 pt-2">
            <NavItem to="/profile">Мой профиль</NavItem>
          </div>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold">
              {user?.firstName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{roleLabels[user?.role || '']}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full btn-secondary text-sm">
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-3 flex justify-end">
          <NotificationBell />
        </div>
        <div className="max-w-6xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
