import type { Assignment } from '../../types';
import { calcStats } from '../assignments/assignmentUtils';

export default function Statistics({ assignments }: { assignments: Assignment[] }) {
  const stats = calcStats(assignments);
  return <section aria-label="Thống kê">
    <h2>Thống kê</h2>
    <p>Tổng: {stats.total} · Đã xong: {stats.completed} · Quá hạn: {stats.overdue}</p>
    <ul>{Object.entries(stats.bySubject).map(([name, count]) => <li key={name}>{name}: {count}</li>)}</ul>
  </section>;
}
