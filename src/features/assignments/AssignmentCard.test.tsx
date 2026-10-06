import { render, screen } from '@testing-library/react'; import userEvent from '@testing-library/user-event'; import { AssignmentCard } from './AssignmentCard'; import { usePinStore } from './pinStore';
const assignment = { id: 'card-1', title: 'Ôn React', subject: 'Toán' as const, dueDate: '2099-01-01', completed: false };
beforeEach(() => usePinStore.setState({ pinnedIds: [] }));
test('renders assignment content', () => { render(<AssignmentCard assignment={assignment} onToggleComplete={jest.fn()} />); expect(screen.getByText('Ôn React')).toBeInTheDocument(); });
test('complete button calls callback', async () => { const fn = jest.fn(); render(<AssignmentCard assignment={assignment} onToggleComplete={fn} />); await userEvent.click(screen.getByText('Hoàn thành')); expect(fn).toHaveBeenCalledWith('card-1'); });
test('pin button toggles Zustand state', async () => { render(<AssignmentCard assignment={assignment} onToggleComplete={jest.fn()} />); await userEvent.click(screen.getByRole('button', { name: 'Ghim bài tập' })); expect(usePinStore.getState().pinnedIds).toContain('card-1'); });
