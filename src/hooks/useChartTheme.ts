import { useTheme } from '../contexts/ThemeContext';

export interface ChartTheme {
  isDark: boolean;
  gridColor: string;
  tickColor: string;
  cursorColor: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  subtextColor: string;
}

export const useChartTheme = (): ChartTheme => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    isDark,
    gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#edf1f5',
    tickColor: isDark ? '#9aa0ac' : '#7a8797',
    cursorColor: isDark ? '#353846' : '#dfe4eb',
    tooltipBg: isDark ? '#1a1d24' : '#ffffff',
    tooltipBorder: isDark ? '#2a2d36' : '#e3e9f0',
    tooltipText: isDark ? '#e8e9ed' : '#0f2a3b',
    subtextColor: isDark ? '#9aa0ac' : '#7a8797',
  };
};

export default useChartTheme;
