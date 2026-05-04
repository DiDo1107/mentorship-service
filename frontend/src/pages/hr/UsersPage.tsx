import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { usersApi } from '../../api/users';
import { User, Role } from '../../types';

const roleLabels: Record<Role, string> = {
  hr: 'HR-менеджер',
  mentor: 'Наставник',
  employee: 'Сотрудник',
};

const emptyForm = { firstName: '', lastName: '', email: '', password: '', role: 'employee' as Role };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', role: 'employee' as Role });
  const [createForm, setCreateForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const res = await usersApi.getAll();
      setUsers(res.data.data || []);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(user: User) {
    setShowCreateForm(false);
    setEditingId(user.id);
    setEditForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role });
  }

  async function handleSave(userId: string) {
    setSaving(true);
    try {
      const res = await usersApi.update(userId, editForm);
      setUsers((prev) => prev.map((u) => (u.id === userId ? res.data.data! : u)));
      setEditingId(null);
      toast.success('Профиль обновлён');
    } catch {
      toast.error('Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await usersApi.create(createForm);
      setUsers((prev) => [...prev, res.data.data!].sort((a, b) => a.firstName.localeCompare(b.firstName)));
      setCreateForm(emptyForm);
      setShowCreateForm(false);
      toast.success('Пользователь создан');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Не удалось создать пользователя');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`Удалить пользователя ${user.firstName} ${user.lastName}?`)) return;
    try {
      await usersApi.delete(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success('Пользователь удалён');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Не удалось удалить пользователя');
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
          <p className="text-gray-500 mt-1">{users.length} пользователей в системе</p>
        </div>
        <button
          onClick={() => { setShowCreateForm(!showCreateForm); setEditingId(null); }}
          className="btn-primary"
        >
          + Создать пользователя
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="card border-2 border-blue-200 space-y-3">
          <h3 className="font-semibold text-gray-900">Новый пользователь</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Имя</label>
              <input className="input" value={createForm.firstName} onChange={(e) => setCreateForm((p) => ({ ...p, firstName: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Фамилия</label>
              <input className="input" value={createForm.lastName} onChange={(e) => setCreateForm((p) => ({ ...p, lastName: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Пароль</label>
            <input className="input" type="password" value={createForm.password} onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))} required minLength={6} />
          </div>
          <div>
            <label className="label">Роль</label>
            <select className="input" value={createForm.role} onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value as Role }))}>
              <option value="hr">HR-менеджер</option>
              <option value="mentor">Наставник</option>
              <option value="employee">Сотрудник</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Создание...' : 'Создать'}</button>
            <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">Отмена</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {users.map((user) =>
          editingId === user.id ? (
            <div key={user.id} className="card border-2 border-blue-200 space-y-3">
              <h3 className="font-semibold text-gray-900">Редактирование</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Имя</label>
                  <input className="input" value={editForm.firstName} onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Фамилия</label>
                  <input className="input" value={editForm.lastName} onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="label">Роль</label>
                <select className="input" value={editForm.role} onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value as Role }))}>
                  <option value="hr">HR-менеджер</option>
                  <option value="mentor">Наставник</option>
                  <option value="employee">Сотрудник</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleSave(user.id)} disabled={saving} className="btn-primary">{saving ? 'Сохранение...' : 'Сохранить'}</button>
                <button onClick={() => setEditingId(null)} className="btn-secondary">Отмена</button>
              </div>
            </div>
          ) : (
            <div key={user.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-blue-600 font-medium">{roleLabels[user.role]}</span>
                <button onClick={() => startEdit(user)} className="btn-secondary text-sm">Изменить</button>
                <button onClick={() => handleDelete(user)} className="text-sm text-red-500 hover:text-red-700 font-medium">Удалить</button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
