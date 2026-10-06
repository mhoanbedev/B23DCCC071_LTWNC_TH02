import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
type Theme = 'light' | 'dark';
interface ThemeValue { theme: Theme; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeValue | undefined>(undefined);
export function ThemeProvider({ children }: { children: ReactNode }) { const [theme, setTheme] = useState<Theme>('light'); const value = useMemo(() => ({ theme, toggleTheme: () => setTheme(x => x === 'light' ? 'dark' : 'light') }), [theme]); return <ThemeContext.Provider value={value}><div data-theme={theme}>{children}</div></ThemeContext.Provider>; }
export const useTheme = () => { const value = useContext(ThemeContext); if (!value) throw new Error('useTheme must be used inside ThemeProvider'); return value; };
