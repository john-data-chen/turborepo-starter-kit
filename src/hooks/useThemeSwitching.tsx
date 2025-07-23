import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

const useThemeSwitching = () => {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('theme');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const themeAction = [
    {
      id: 'toggleTheme',
      name: t('toggleTheme'),
      section: 'Theme',
      perform: toggleTheme
    },
    {
      id: 'setLightTheme',
      name: t('light'),
      section: 'Theme',
      perform: () => setTheme('light')
    },
    {
      id: 'setDarkTheme',
      name: t('dark'),
      section: 'Theme',
      perform: () => setTheme('dark')
    }
  ];

  return {
    theme,
    themeAction
  };
};

export default useThemeSwitching;
