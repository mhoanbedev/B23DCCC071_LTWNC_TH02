import { useMemo } from 'react';
import { Provider, useSelector } from 'react-redux';
import { store, type RootState } from './store';
import { ThemeProvider, useTheme } from './features/theme/ThemeContext';
import { AssignmentForm } from './features/assignments/AssignmentForm';
import { AssignmentList } from './features/assignments/AssignmentList';
import { isOverdue } from './features/assignments/assignmentUtils';
import './styles.css';

function Summary() {
  const items = useSelector((state: RootState) => state.assignments.items);
  const data = useMemo(() => {
    const completed = items.filter(item => item.completed).length;
    return {
      total: items.length,
      completed,
      pending: items.length - completed,
      overdue: items.filter(item => isOverdue(item)).length,
    };
  }, [items]);

  return <section className="summary" id="statistics" aria-label="Tổng quan bài tập">
    <div><span>Tất cả</span><strong>{data.total}</strong></div>
    <div><span>Chưa hoàn thành</span><strong>{data.pending}</strong></div>
    <div><span>Đã hoàn thành</span><strong>{data.completed}</strong></div>
    <div><span>Quá hạn</span><strong className={data.overdue ? 'danger' : ''}>{data.overdue}</strong></div>
  </section>;
}

function ThemeControl() {
  const { theme, toggleTheme } = useTheme();
  return <button className="theme-button" onClick={toggleTheme}>{theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}</button>;
}

function Shell() {
  return <div className="app">
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#main" aria-label="Assignment Manager">Assignment Manager</a>
        <nav aria-label="Điều hướng chính">
          <a className="active" href="#assignments">Bài tập</a>
          <a href="#statistics">Thống kê</a>
        </nav>
        <ThemeControl />
      </div>
    </header>

    <main id="main">
      <div className="page-heading">
        <div>
          <p className="section-label">BÀI TẬP</p>
          <h1>Quản lý công việc học tập</h1>
          <p>Theo dõi thời hạn và tiến độ của tất cả bài tập tại một nơi.</p>
        </div>
      </div>

      <Summary />

      <section className="workspace" id="assignments">
        <div className="workspace-heading">
          <div>
            <h2>Danh sách bài tập</h2>
            <p>Thêm bài tập mới hoặc cập nhật trạng thái công việc.</p>
          </div>
        </div>
        <AssignmentForm />
        <AssignmentList />
      </section>
    </main>
  </div>;
}

export default function App() {
  return <Provider store={store}><ThemeProvider><Shell /></ThemeProvider></Provider>;
}
