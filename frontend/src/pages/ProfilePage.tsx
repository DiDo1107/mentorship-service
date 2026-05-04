import { useAuthStore } from '../store/authStore';

const roleLabels: Record<string, string> = {
  hr: 'HR-менеджер',
  mentor: 'Наставник',
  employee: 'Сотрудник',
};

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Мой профиль</h1>

      <div className="card space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <span className="text-sm text-blue-600 font-medium">{roleLabels[user.role]}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Роль</p>
            <p className="text-gray-900">{roleLabels[user.role]}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-400">
        Для изменения данных профиля обратитесь к HR-менеджеру.
      </p>
    </div>
  );
}
