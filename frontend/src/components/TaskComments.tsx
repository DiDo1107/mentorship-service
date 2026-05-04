import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { commentsApi } from '../api/comments';
import { TaskComment } from '../types';

const roleLabels: Record<string, string> = {
  mentor: 'Наставник',
  employee: 'Сотрудник',
  hr: 'HR',
};

export default function TaskComments({ taskId }: { taskId: string }) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && comments.length === 0) {
      loadComments();
    }
  }, [open]);

  async function loadComments() {
    setLoading(true);
    try {
      const res = await commentsApi.getByTask(taskId);
      setComments(res.data.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await commentsApi.create(taskId, text.trim());
      setComments((prev) => [...prev, res.data.data!]);
      setText('');
    } catch {
      toast.error('Не удалось отправить комментарий');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-blue-600 hover:underline"
      >
        {open ? 'Скрыть комментарии' : `Комментарии${comments.length > 0 ? ` (${comments.length})` : ''}`}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {loading ? (
            <p className="text-xs text-gray-400">Загрузка...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-400">Комментариев пока нет</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-xs font-medium text-gray-700">
                    {c.author.firstName} {c.author.lastName}
                  </span>
                  <span className="text-xs text-gray-400">· {roleLabels[c.author.role]}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {format(new Date(c.createdAt), 'd MMM, HH:mm', { locale: ru })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{c.text}</p>
              </div>
            ))
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
            <input
              className="input flex-1 text-sm py-1.5"
              placeholder="Написать комментарий..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="btn-primary text-sm py-1.5 px-3 disabled:opacity-50"
            >
              {submitting ? '...' : 'Отправить'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
