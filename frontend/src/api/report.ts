import client from './client';

interface ReportPair {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  mentor: { firstName: string; lastName: string; email: string };
  employee: { firstName: string; lastName: string; email: string };
  tasks: Array<{
    title: string; description?: string; deadline: string;
    status: string; priority: string;
  }>;
  meetings: Array<{ scheduledAt: string; notes?: string; summary?: string }>;
  feedback: Array<{
    rating: number; comment?: string;
    giver: { firstName: string; lastName: string; role: string };
  }>;
}

const statusLabels: Record<string, string> = {
  active: 'Активна', completed: 'Завершена', paused: 'Приостановлена',
};
const taskStatusLabels: Record<string, string> = {
  not_started: 'Не начата', in_progress: 'В процессе', completed: 'Выполнена',
};
const priorityLabels: Record<string, string> = {
  high: 'Высокий', medium: 'Средний', low: 'Низкий',
};
const roleLabels: Record<string, string> = {
  mentor: 'Наставник', employee: 'Сотрудник', hr: 'HR',
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtDt(d: string) {
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function buildHtml(pair: ReportPair): string {
  const total = pair.tasks.length;
  const done = pair.tasks.filter(t => t.status === 'completed').length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const now = new Date();

  const tasksHtml = pair.tasks.length === 0
    ? '<p class="empty">Задачи не созданы</p>'
    : pair.tasks.map(t => {
        const overdue = new Date(t.deadline) < now && t.status !== 'completed';
        return `<div class="task ${t.status === 'completed' ? 'done' : ''}">
          <span class="task-title">${t.title}</span>
          <span class="meta">${taskStatusLabels[t.status]} · ${priorityLabels[t.priority]} · Дедлайн: ${fmt(t.deadline)}${overdue ? ' ⚠ ПРОСРОЧЕНА' : ''}</span>
          ${t.description ? `<span class="desc">${t.description}</span>` : ''}
        </div>`;
      }).join('');

  const meetingsHtml = pair.meetings.length === 0
    ? '<p class="empty">Встречи не запланированы</p>'
    : pair.meetings.map(m => `<div class="item">
        <b>${fmtDt(m.scheduledAt)}</b>
        ${m.notes ? `<span class="meta">Повестка: ${m.notes}</span>` : ''}
        ${m.summary ? `<span class="meta green">Итоги: ${m.summary}</span>` : ''}
      </div>`).join('');

  const feedbackHtml = pair.feedback.length === 0
    ? '<p class="empty">Отзывы не оставлены</p>'
    : pair.feedback.map(f => `<div class="item">
        <b>${f.giver.firstName} ${f.giver.lastName} (${roleLabels[f.giver.role]})</b> — оценка: ${f.rating}/5
        ${f.comment ? `<span class="meta">«${f.comment}»</span>` : ''}
      </div>`).join('');

  return `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
  <title>Отчёт — ${pair.employee.firstName} ${pair.employee.lastName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a1a; font-size: 13px; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    h2 { font-size: 15px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 24px; }
    .subtitle { color: #666; margin-bottom: 24px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; background: #f8f8f8; padding: 12px 16px; border-radius: 6px; }
    .info-grid span { display: block; }
    .label { color: #666; font-size: 11px; }
    .val { font-weight: 600; }
    .progress-bar { background: #e5e7eb; border-radius: 4px; height: 10px; margin: 8px 0; }
    .progress-fill { background: #3b82f6; height: 10px; border-radius: 4px; width: ${progress}%; }
    .task { padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
    .task.done { opacity: 0.6; }
    .task-title { font-weight: 600; display: block; }
    .meta { display: block; font-size: 11px; color: #666; margin-top: 2px; }
    .desc { display: block; font-size: 12px; color: #444; margin-top: 2px; }
    .green { color: #16a34a !important; }
    .item { padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
    .item b { display: block; }
    .empty { color: #999; font-style: italic; }
    .footer { margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
    @media print { body { margin: 20px; } }
  </style></head><body>
  <h1>Отчёт об адаптации</h1>
  <p class="subtitle">Сформирован: ${fmtDt(now.toISOString())}</p>

  <h2>Информация о паре</h2>
  <div class="info-grid">
    <span><span class="label">Наставник</span><span class="val">${pair.mentor.firstName} ${pair.mentor.lastName}</span>${pair.mentor.email}</span>
    <span><span class="label">Сотрудник</span><span class="val">${pair.employee.firstName} ${pair.employee.lastName}</span>${pair.employee.email}</span>
    <span><span class="label">Статус</span><span class="val">${statusLabels[pair.status]}</span></span>
    <span><span class="label">Период</span><span class="val">${fmt(pair.startDate)} — ${fmt(pair.endDate)}</span></span>
  </div>
  <div style="margin-top:12px">
    <span class="label">Прогресс: ${progress}% (${done} из ${total} задач)</span>
    <div class="progress-bar"><div class="progress-fill"></div></div>
  </div>

  <h2>Задачи</h2>${tasksHtml}
  <h2>Встречи</h2>${meetingsHtml}
  <h2>Обратная связь</h2>${feedbackHtml}

  <div class="footer">Система наставничества · Отчёт создан автоматически</div>
  <script>window.onload = () => { window.print(); }</script>
  </body></html>`;
}

export const reportApi = {
  downloadPairReport: async (pairId: string) => {
    const res = await client.get(`/report/pair/${pairId}`);
    const pair: ReportPair = res.data.data;
    const html = buildHtml(pair);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  },
};
