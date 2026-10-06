import { memo, Profiler, useCallback, type ProfilerOnRenderCallback } from 'react';
import type { Assignment } from '../../types';
import { calcDaysLeft } from './assignmentUtils';
import { usePinStore } from './pinStore';

interface Props {
  assignment: Assignment;
  onToggleComplete: (id: string) => void;
  onDelete?: (id: string) => void;
}

declare global { interface Window { __assignmentCardRenderCount?: number; __assignmentCardProfilerCommits?: number; } }

const recordRender: ProfilerOnRenderCallback = () => {
  if (typeof window !== 'undefined') window.__assignmentCardProfilerCommits = (window.__assignmentCardProfilerCommits ?? 0) + 1;
};

export function AssignmentCardContent({ assignment, onToggleComplete, onDelete }: Props) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && new URLSearchParams(window.location.search).get('profile') === '1') {
    window.__assignmentCardRenderCount = (window.__assignmentCardRenderCount ?? 0) + 1;
  }
  const togglePin = usePinStore(state => state.togglePin);
  const isPinned = usePinStore(state => state.isPinned(assignment.id));
  const complete = useCallback(() => onToggleComplete(assignment.id), [onToggleComplete, assignment.id]);

  return <article className={`card ${assignment.completed ? 'completed' : ''}`} data-testid={`assignment-${assignment.id}`}>
    <div>
      <h3>{assignment.title}</h3>
      <span>{assignment.subject} · {assignment.completed ? 'Đã hoàn thành' : `Còn ${calcDaysLeft(assignment.dueDate)} ngày`}</span>
    </div>
    <div className="actions">
      <button aria-label={isPinned ? 'Bỏ ghim' : 'Ghim bài tập'} onClick={() => togglePin(assignment.id)}>{isPinned ? '★' : '☆'}</button>
      <button onClick={complete}>{assignment.completed ? 'Mở lại' : 'Hoàn thành'}</button>
      {onDelete && <button onClick={() => onDelete(assignment.id)}>Xoá</button>}
    </div>
  </article>;
}

export const AssignmentCard = memo(AssignmentCardContent);
export function ProfiledAssignmentCard(props: Props) {
  return <Profiler id={`AssignmentCard:${props.assignment.id}`} onRender={recordRender}><AssignmentCard {...props} /></Profiler>;
}
export function ProfiledBaselineAssignmentCard(props: Props) {
  return <Profiler id={`AssignmentCard:${props.assignment.id}`} onRender={recordRender}><AssignmentCardContent {...props} /></Profiler>;
}
