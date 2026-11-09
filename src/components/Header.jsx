import { ThemeToggle } from './ThemeToggle.jsx';

export function Header({ theme, onToggleTheme }) {
  return (
    <header className="header">
      <div className="header__inner">
        <a className="header__brand" href="#">
          Lim Claude
        </a>
        <nav className="header__nav" aria-label="주요 메뉴">
          <a href="#" aria-current="page">대시보드</a>
          <a href="#">프로젝트</a>
          <a href="#">설정</a>
        </nav>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
