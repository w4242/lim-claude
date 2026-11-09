import { Header } from './components/Header.jsx';
import { useTheme } from './theme/useTheme.js';

const stats = [
  { label: '진행 중인 프로젝트', value: '12' },
  { label: '이번 주 완료', value: '38' },
  { label: '팀원', value: '7' },
];

const tasks = [
  { name: '로그인 화면 개선', owner: '임희섭', status: 'done' },
  { name: 'API 응답 속도 측정', owner: '김민지', status: 'progress' },
  { name: '결제 오류 수정', owner: '박준호', status: 'blocked' },
];

const statusLabel = { done: '완료', progress: '진행 중', blocked: '막힘' };

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="container">
        <section className="intro">
          <h1>대시보드</h1>
          <p className="muted">오른쪽 위 스위치로 라이트 모드와 다크 모드를 전환할 수 있습니다.</p>
        </section>

        <section className="stats" aria-label="요약">
          {stats.map((stat) => (
            <div className="card" key={stat.label}>
              <p className="muted">{stat.label}</p>
              <p className="stat__value">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="card">
          <h2>작업 목록</h2>
          <table className="table">
            <thead>
              <tr>
                <th>작업</th>
                <th>담당자</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.name}>
                  <td>{task.name}</td>
                  <td className="muted">{task.owner}</td>
                  <td>
                    <span className={`badge badge--${task.status}`}>{statusLabel[task.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2>새 작업 추가</h2>
          <form className="form" onSubmit={(e) => e.preventDefault()}>
            <label>
              작업 이름
              <input type="text" placeholder="예: 다크 모드 QA" />
            </label>
            <div className="form__actions">
              <button type="submit" className="button button--primary">추가</button>
              <button type="button" className="button button--secondary">취소</button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
