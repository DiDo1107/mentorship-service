import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { pairsApi } from '../../api/pairs';
import { tasksApi } from '../../api/tasks';
import { meetingsApi } from '../../api/meetings';
import { uploadApi } from '../../api/upload';
import { MentorPair, Task, Meeting, TaskPriority, TaskStatus } from '../../types';
import TaskComments from '../../components/TaskComments';

const priorityLabels: Record<TaskPriority, string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

const statusLabels: Record<TaskStatus, string> = {
  not_started: 'Не начата',
  in_progress: 'В процессе',
  completed: 'Выполнена',
};

const priorityBadge: Record<TaskPriority, string> = {
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

const statusBadge: Record<TaskStatus, string> = {
  not_started: 'status-not-started',
  in_progress: 'status-in-progress',
  completed: 'status-completed',
};

interface TaskForm {
  title: string;
  description: string;
  deadline: string;
  priority: TaskPriority;
  file: File | null;
}

interface MeetingForm {
  scheduledAt: string;
  notes: string;
}

export default function MenteePage() {
  const { id } = useParams<{ id: string }>();
  const [pair, setPair] = useState<MentorPair | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'meetings'>('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [taskForm, setTaskForm] = useState<TaskForm>({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    file: null,
  });
  const [meetingForm, setMeetingForm] = useState<MeetingForm>({ scheduledAt: '', notes: '' });

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  async function loadData() {
    const [pairRes, tasksRes, meetingsRes] = await Promise.all([
      pairsApi.getById(id!),
      tasksApi.getByPair(id!),
      meetingsApi.getByPair(id!),
    ]);
    setPair(pairRes.data.data || null);
    setTasks(tasksRes.data.data || []);
    setMeetings(meetingsRes.data.data || []);
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    try {
      let fileName: string | undefined;
      let fileUrl: string | undefined;
      if (taskForm.file) {
        const uploadRes = await uploadApi.uploadPdf(taskForm.file);
        fileName = uploadRes.data.data?.fileName;
        fileUrl = uploadRes.data.data?.fileUrl;
      }
      await tasksApi.create({
        pairId: id!,
        title: taskForm.title,
        description: taskForm.description,
        deadline: new Date(taskForm.deadline).toISOString(),
        priority: taskForm.priority,
        fileName,
        fileUrl,
      });
      toast.success('Задача создана');
      setShowTaskForm(false);
      setTaskForm({ title: '', description: '', deadline: '', priority: 'medium', file: null });
      const res = await tasksApi.getByPair(id!);
      setTasks(res.data.data || []);
    } catch {
      toast.error('Не удалось создать задачу');
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm('Удалить задачу?')) return;
    try {
      await tasksApi.delete(taskId);
      toast.success('Задача удалена');
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch {
      toast.error('Не удалось удалить задачу');
    }
  }

  async function handleTaskStatusChange(task: Task, status: TaskStatus) {
    try {
      const res = await tasksApi.update(task.id, { status });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data.data! : t)));
      toast.success('Статус задачи обновлён');
    } catch {
      toast.error('Не удалось обновить статус');
    }
  }

  async function handleCreateMeeting(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingMeeting) {
        await meetingsApi.update(editingMeeting.id, {
          scheduledAt: new Date(meetingForm.scheduledAt).toISOString(),
          notes: meetingForm.notes,
        });
        toast.success('Встреча обновлена');
      } else {
        await meetingsApi.create({
          pairId: id!,
          scheduledAt: new Date(meetingForm.scheduledAt).toISOString(),
          notes: meetingForm.notes,
        });
        toast.success('Встреча запланирована');
      }
      setShowMeetingForm(false);
      setEditingMeeting(null);
      setMeetingForm({ scheduledAt: '', notes: '' });
      const res = await meetingsApi.getByPair(id!);
      setMeetings(res.data.data || []);
    } catch {
      toast.error('Ошибка');
    }
  }

  async function handleAddSummary(meeting: Meeting) {
    const summary = prompt('Итоги встречи:', meeting.summary || '');
    if (summary === null) return;
    try {
      await meetingsApi.update(meeting.id, { summary });
      toast.success('Итоги сохранены');
      const res = await meetingsApi.getByPair(id!);
      setMeetings(res.data.data || []);
    } catch {
      toast.error('Ошибка');
    }
  }

  async function handleDeleteMeeting(meetingId: string) {
    if (!confirm('Удалить встречу?')) return;
    try {
      await meetingsApi.delete(meetingId);
      toast.success('Встреча удалена');
      setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    } catch {
      toast.error('Не удалось удалить встречу');
    }
  }

  if (!pair) return <div className="text-gray-500">Загрузка...</div>;

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/mentor/dashboard" className="text-gray-400 hover:text-gray-600">← Назад</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {pair.employee.firstName} {pair.employee.lastName}
          </h1>
          <p className="text-gray-500">{pair.employee.email}</p>
        </div>
        <Link
          to={`/pairs/${id}/feedback`}
          className="ml-auto btn-secondary text-sm"
        >
          Обратная связь
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Прогресс адаптации</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {completedTasks} из {tasks.length} задач выполнено •
          Адаптация до {format(new Date(pair.endDate), 'd MMMM yyyy', { locale: ru })}
        </p>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {(['tasks', 'meetings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors -mb-px ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'tasks' ? `Задачи (${tasks.length})` : `Встречи (${meetings.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <button onClick={() => setShowTaskForm(!showTaskForm)} className="btn-primary">
            + Добавить задачу
          </button>

          {showTaskForm && (
            <form onSubmit={handleCreateTask} className="card space-y-3">
              <h3 className="font-semibold text-gray-900">Новая задача</h3>
              <div>
                <label className="label">Название</label>
                <input
                  className="input"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Описание</label>
                <textarea
                  className="input"
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Дедлайн</label>
                  <input
                    type="date"
                    className="input"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm((p) => ({ ...p, deadline: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="label">Приоритет</label>
                  <select
                    className="input"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value as TaskPriority }))}
                  >
                    <option value="high">Высокий</option>
                    <option value="medium">Средний</option>
                    <option value="low">Низкий</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Прикрепить PDF (необязательно)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="input"
                  onChange={(e) => setTaskForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                />
                {taskForm.file && (
                  <p className="text-xs text-gray-500 mt-1">Выбран: {taskForm.file.name}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Создать</button>
                <button type="button" onClick={() => setShowTaskForm(false)} className="btn-secondary">Отмена</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className={`card ${task.status === 'completed' ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={priorityBadge[task.priority]}>{priorityLabels[task.priority]}</span>
                      <span className={statusBadge[task.status]}>{statusLabels[task.status]}</span>
                      {new Date(task.deadline) < new Date() && task.status !== 'completed' && (
                        <span className="badge-high">Просрочена</span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Дедлайн: {format(new Date(task.deadline), 'd MMM yyyy', { locale: ru })}
                    </p>
                    {task.fileUrl && (
                      <a
                        href={task.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        📎 {task.fileName || 'Вложение'}
                      </a>
                    )}
                    <TaskComments taskId={task.id} />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskStatusChange(task, e.target.value as TaskStatus)}
                      className="input text-sm py-1 px-2"
                    >
                      <option value="not_started">Не начата</option>
                      <option value="in_progress">В процессе</option>
                      <option value="completed">Выполнена</option>
                    </select>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500 text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">Задач пока нет</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="space-y-4">
          <button onClick={() => { setShowMeetingForm(!showMeetingForm); setEditingMeeting(null); }} className="btn-primary">
            + Запланировать встречу
          </button>

          {showMeetingForm && (
            <form onSubmit={handleCreateMeeting} className="card space-y-3">
              <h3 className="font-semibold text-gray-900">
                {editingMeeting ? 'Редактировать встречу' : 'Новая встреча'}
              </h3>
              <div>
                <label className="label">Дата и время</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={meetingForm.scheduledAt}
                  onChange={(e) => setMeetingForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Заметки / повестка</label>
                <textarea
                  className="input"
                  rows={2}
                  value={meetingForm.notes}
                  onChange={(e) => setMeetingForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">
                  {editingMeeting ? 'Сохранить' : 'Создать'}
                </button>
                <button type="button" onClick={() => { setShowMeetingForm(false); setEditingMeeting(null); }} className="btn-secondary">
                  Отмена
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(new Date(meeting.scheduledAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
                    </p>
                    {meeting.notes && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Повестка:</span> {meeting.notes}
                      </p>
                    )}
                    {meeting.summary && (
                      <p className="text-sm text-green-700 mt-1 bg-green-50 rounded p-2">
                        <span className="font-medium">Итоги:</span> {meeting.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleAddSummary(meeting)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {meeting.summary ? 'Изменить итоги' : 'Добавить итоги'}
                    </button>
                    <button
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className="text-sm text-gray-400 hover:text-red-500"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {meetings.length === 0 && (
              <div className="text-center py-8 text-gray-500">Встреч пока нет</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
