# AGENTS

포트폴리오/이력서 static site. 빌드 스텝 없음 — `index.html` + `css/` + `js/` + `data/*.json`을 그대로 서빙한다. `js/script.js`의 `fetch()` 때문에 로컬 확인은 HTTP 서버가 필요하다(`file://` 불가).

## 세션 baton과 durable 기억은 외부 wiki에서 관리한다

이 저장소는 세션 handoff/메모리 사본을 두지 않는다. Canonical 위치는 외부 project-rag vault다:

- 경로: 환경변수 `$PROJECT_RAG_PATH`가 있으면 그 값, 없으면 `D:\obsidian-storage\project-rag`. 그 아래 `resume\` 폴더가 이 프로젝트의 wiki 루트다.
- 진입점: `resume\index.md`
- 세션 baton + durable 작업 기억: `resume\session-memory.md`
- 도메인 문서: `resume\blog-cross-links.md` 등 (`index.md`의 Navigation 참조)

이 vault는 자체 git으로만 버전 관리되며 이 저장소의 원격(GitHub)에는 올라가지 않는다. 저장소의 `.agent/session-handoff.md`는 gitignored 스텁이며 위 위치를 가리키기만 한다.

### 에이전트 진입/종료 절차

- **작업 시작**: `resume\session-memory.md`를 읽는다. `Status`, `Current state`, `Remaining tasks`를 현재 작업에 반영한다. load-bearing한 내용(파일 경로, "done" 주장)은 실제 저장소 상태와 교차 확인한다.
- **작업 종료 전**: 같은 파일의 `Current state` / `Changed` / `Remaining tasks` / `Notes` 절을 최신 상태로 교체하고, `Session log`에 한 줄 append한다. 원문 토큰·PII 금지.
- 다른 도구(Antigravity, Codex 등)도 같은 파일 경로를 읽고 쓰도록 한다 — 이 규칙은 도구 비종속이다.

## 검증

정적 서버로 서빙 후 3개 뷰(`#resumePage` / `#summaryPage` / `#domainPage`)와 인쇄(🖨️ `printResume()`) 출력을 확인한다. 인쇄는 `@media print`에서 데스크톱 3단 레이아웃을 축소 없이 페이지당 한 화면으로 낸다.
