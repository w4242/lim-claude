export function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="다크 모드"
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="theme-toggle"
      onClick={onToggle}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__icon theme-toggle__icon--sun">
          <SunIcon />
        </span>
        <span className="theme-toggle__icon theme-toggle__icon--moon">
          <MoonIcon />
        </span>
        <span className="theme-toggle__thumb" />
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
