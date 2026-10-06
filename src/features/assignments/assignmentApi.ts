import type { Assignment } from '../../types';

const demoAssignments: Assignment[] = [
  { id: 'demo-1', title: 'Ôn tập React Hooks', subject: 'Lịch sử', dueDate: '2099-01-12', completed: false },
  { id: 'demo-2', title: 'Bài tập đại số', subject: 'Toán', dueDate: '2099-01-15', completed: false },
  { id: 'demo-3', title: 'Đọc hiểu văn bản', subject: 'Ngữ văn', dueDate: '2099-01-18', completed: true },
  { id: 'demo-4', title: 'Từ vựng tiếng Anh', subject: 'Tiếng Anh', dueDate: '2099-01-20', completed: false },
  { id: 'demo-5', title: 'Hệ sinh thái', subject: 'Khoa học', dueDate: '2099-01-22', completed: false },
];

export async function fetchAssignments(): Promise<Assignment[]> {
  const response = await fetch('/api/assignments');
  if (!response.ok) throw new Error('Không thể tải danh sách bài tập');
  const contentType = response.headers?.get?.('content-type') ?? '';
  // Vite returns index.html for an unknown API route in standalone dev mode.
  if (contentType.includes('text/html')) return demoAssignments;
  return response.json() as Promise<Assignment[]>;
}
