import { Provider } from 'react-redux'; import { render, screen, waitFor } from '@testing-library/react'; import { AssignmentList } from './AssignmentList'; import { store } from '../../store';
const renderList = () => render(<Provider store={store}><AssignmentList /></Provider>);
afterEach(() => jest.restoreAllMocks());
test('shows loading state while API is pending', () => { jest.spyOn(global, 'fetch').mockReturnValue(new Promise(() => undefined)); renderList(); expect(screen.getByRole('status')).toHaveTextContent('Đang tải'); });
test('shows assignments after successful API response', async () => { jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => [{ id: 'x', title: 'API item', subject: 'Toán', dueDate: '2099-01-01', completed: false }] } as Response); renderList(); await waitFor(() => expect(screen.getByText('API item')).toBeInTheDocument()); });
test('shows API error', async () => { jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as Response); renderList(); await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument()); });
