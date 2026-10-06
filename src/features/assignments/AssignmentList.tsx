import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { FixedSizeList as List, type ListChildComponentProps } from 'react-window';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { Assignment } from '../../types';
import { loadFailure, loadStart, loadSuccess, removeAssignment, setItems, toggleCompleted } from './assignmentsSlice';
import { fetchAssignments } from './assignmentApi';
import { AssignmentCard, ProfiledAssignmentCard, ProfiledBaselineAssignmentCard } from './AssignmentCard';
import { useDebounce } from '../../shared/hooks/useDebounce';
import { usePinStore } from './pinStore';
import { createSampleAssignments, sortPinnedFirst } from './assignmentUtils';

const Statistics = lazy(() => import('../statistics/Statistics'));
interface RowData { items: Assignment[]; onToggleComplete: (id: string) => void; onDelete: (id: string) => void; profileMode: boolean; }

function AssignmentRow({ index, style, data }: ListChildComponentProps<RowData>) {
  const assignment = data.items[index];
  const Card = data.profileMode ? ProfiledAssignmentCard : AssignmentCard;
  return <div style={style}><Card assignment={assignment} onToggleComplete={data.onToggleComplete} onDelete={data.onDelete} /></div>;
}

export function AssignmentList() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state: RootState) => state.assignments);
  const [query, setQuery] = useState('');
  const [showStats, setShowStats] = useState(false);
  const debounced = useDebounce(query, 300);
  const pinnedIds = usePinStore(state => state.pinnedIds);
  const stressMode = new URLSearchParams(window.location.search).get('stress') === '1';
  const baselineMode = new URLSearchParams(window.location.search).get('benchmark') === 'baseline';
  const profileMode = new URLSearchParams(window.location.search).get('profile') === '1';

  useEffect(() => {
    if (profileMode) window.__assignmentCardRenderCount = 0;
    dispatch(loadStart());
    fetchAssignments()
      .then(data => {
        dispatch(loadSuccess(data));
        if (stressMode) dispatch(setItems(createSampleAssignments(10000)));
      })
      .catch(reason => dispatch(loadFailure(reason instanceof Error ? reason.message : 'Có lỗi xảy ra')));
  }, [dispatch, stressMode, profileMode]);

  const toggle = useCallback((id: string) => dispatch(toggleCompleted(id)), [dispatch]);
  const remove = useCallback((id: string) => dispatch(removeAssignment(id)), [dispatch]);
  const searchTerm = baselineMode ? query : debounced;
  const filtered = useMemo(() => sortPinnedFirst(items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.subject.toLowerCase().includes(searchTerm.toLowerCase())), pinnedIds), [items, searchTerm, pinnedIds]);
  const rowData = useMemo(() => ({ items: filtered, onToggleComplete: toggle, onDelete: remove, profileMode }), [filtered, toggle, remove, profileMode]);

  if (status === 'loading') return <p role="status">Đang tải...</p>;
  if (status === 'failed') return <p role="alert">{error}</p>;

  return <section>
    <div className="toolbar">
      <input aria-label="Tìm kiếm" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm kiếm bài tập" />
      <button onClick={() => dispatch(setItems(createSampleAssignments()))}>Tạo 10.000 bài tập mẫu</button>
      <button onClick={() => setShowStats(value => !value)}>Thống kê</button>
    </div>
    {showStats && <Suspense fallback={<p>Đang tải thống kê...</p>}><Statistics assignments={items} /></Suspense>}
    {filtered.length === 0 ? <p className="empty-state">Không tìm thấy bài tập phù hợp.</p> : baselineMode ?
      <div className="baseline-list">{filtered.map(item => {
        const Card = profileMode ? ProfiledBaselineAssignmentCard : AssignmentCard;
        return <Card key={item.id} assignment={item} onToggleComplete={toggle} onDelete={remove} />;
      })}</div> :
      <List height={520} itemCount={filtered.length} itemSize={86} width="100%" itemData={rowData}>{AssignmentRow}</List>}
  </section>;
}
