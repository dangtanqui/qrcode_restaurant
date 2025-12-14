import { useI18n } from '../contexts/I18nContext'
import { useTheme } from '../contexts/ThemeContext'
import { Globe, Sun, Moon } from 'lucide-react'

export default function LanguageThemeSwitcher() {
  const { language, setLanguage, t } = useI18n()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      {/* Language Switcher */}
      <div className="relative group">
        <button
          className="flex items-center justify-center space-x-1 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          title={t('settings.language')}
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium uppercase">{language}</span>
        </button>
      </div>

      {/* Theme Toggle */}
      <button
        className="flex items-center justify-center p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        onClick={toggleTheme}
        title={theme === 'light' ? t('settings.dark') : t('settings.light')}
      >
        {theme === 'light' ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}

