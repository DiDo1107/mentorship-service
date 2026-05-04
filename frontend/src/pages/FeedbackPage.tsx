import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { feedbackApi } from '../api/feedback';
import { pairsApi } from '../api/pairs';
import { useAuthStore } from '../store/authStore';
import { Feedback, MentorPair } from '../types';

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={onChange ? 'button' : 'button'}
          onClick={() => onChange?.(star)}
          className={`text-2xl transition-colors ${
            star <= value ? 'text-yellow-400' : 'text-gray-300'
          } ${onChange ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const { id: pairId } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [pair, setPair] = useState<MentorPair | null>(null);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasGiven, setHasGiven] = useState(false);

  useEffect(() => {
    if (!pairId) return;
    Promise.all([
      pairsApi.getById(pairId),
      feedbackApi.getByPair(pairId),
    ]).then(([pairRes, fbRes]) => {
      setPair(pairRes.data.data || null);
      const list = fbRes.data.data || [];
      setFeedbackList(list);
      setHasGiven(list.some((f) => f.giverId === user?.id));
    });
  }, [pairId, user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pair || !user) return;
    setLoading(true);
    try {
      const receiverId = user.role === 'employee' ? pair.mentor.id : pair.employee.id;
      await feedbackApi.create({ pairId: pairId!, receiverId, rating, comment });
      toast.success('Обратная связь отправлена');
      const res = await feedbackApi.getByPair(pairId!);
      setFeedbackList(res.data.data || []);
      setHasGiven(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Ошибка';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!pair) return <div className="text-gray-500">Загрузка...</div>;

  const roleLabels: Record<string, string> = {
    mentor: 'Наставник',
    employee: 'Сотрудник',
    hr: 'HR',
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          ← Назад
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Обратная связь</h1>
          <p className="text-gray-500">
            {pair.mentor.firstName} {pair.mentor.lastName} —{' '}
            {pair.employee.firstName} {pair.employee.lastName}
          </p>
        </div>
      </div>

      {!hasGiven && (user?.role === 'mentor' || user?.role === 'employee') && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {user.role === 'employee'
              ? 'Оцените работу наставника'
              : 'Оцените прогресс сотрудника'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Оценка</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="label">Комментарий</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Опишите ваш опыт..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Отправка...' : 'Отправить отзыв'}
            </button>
          </form>
        </div>
      )}

      {hasGiven && (
        <div className="card bg-green-50 border-green-200">
          <p className="text-green-700 font-medium">Вы уже оставили обратную связь для этой пары</p>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Все отзывы ({feedbackList.length})
        </h2>
        {feedbackList.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Отзывов пока нет</p>
        ) : (
          <div className="space-y-4">
            {feedbackList.map((fb) => (
              <div key={fb.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {fb.giver?.firstName} {fb.giver?.lastName}
                      <span className="text-xs text-gray-400 font-normal ml-2">
                        ({roleLabels[fb.giver?.role || '']})
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      → {fb.receiver?.firstName} {fb.receiver?.lastName}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(fb.createdAt), 'd MMM yyyy', { locale: ru })}
                  </span>
                </div>
                <StarRating value={fb.rating} />
                {fb.comment && (
                  <p className="text-sm text-gray-700 mt-2">{fb.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
