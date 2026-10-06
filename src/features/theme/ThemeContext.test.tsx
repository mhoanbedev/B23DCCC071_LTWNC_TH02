import { memo } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from './ThemeContext';

let unrelatedRenderCount = 0;
function Consumer() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme}</button>;
}
const Unrelated = memo(function Unrelated() {
  unrelatedRenderCount += 1;
  return <p>Unrelated component</p>;
});

beforeEach(() => { unrelatedRenderCount = 0; });

test('theme context changes from light to dark', async () => {
  render(<ThemeProvider><Consumer /><Unrelated /></ThemeProvider>);
  expect(screen.getByText('light')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('dark')).toBeInTheDocument();
});

test('theme updates do not re-render unrelated memoized components', async () => {
  render(<ThemeProvider><Consumer /><Unrelated /></ThemeProvider>);
  expect(unrelatedRenderCount).toBe(1);
  await userEvent.click(screen.getByRole('button'));
  expect(unrelatedRenderCount).toBe(1);
});
