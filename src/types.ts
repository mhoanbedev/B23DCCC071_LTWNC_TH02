export type Subject = 'Toán' | 'Ngữ văn' | 'Tiếng Anh' | 'Khoa học' | 'Lịch sử';
export interface Assignment { id: string; title: string; subject: Subject; dueDate: string; completed: boolean; }
