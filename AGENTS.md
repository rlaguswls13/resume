# AGENTS

포트폴리오/이력서 static site. 빌드 스텝 없음 — `index.html` + `css/` + `js/` + `data/*.json`을 그대로 서빙한다. `js/script.js`의 `fetch()` 때문에 로컬 확인은 HTTP 서버가 필요하다(`file://` 불가).

## 세션 baton과 durable 기억은 외부 wiki에서 관리한다

이 저장소는 취업 서류 산출물과 세션 handoff/메모리 사본을 두지 않는다. Canonical 위치는 외부 project-rag vault다:

- 경로: 환경변수 `$PROJECT_RAG_PATH`가 있으면 그 값, 없으면 `D:\obsidian-storage\project-rag`. 그 아래 `resume\` 폴더가 이 프로젝트의 wiki 루트다.
- 진입점: `resume\index.md`
- 세션 baton + durable 작업 기억: `resume\session-memory.md`
- 도메인 문서: `resume\blog-cross-links.md` 등 (`index.md`의 Navigation 참조)

이 vault는 자체 git으로만 버전 관리되며 이 저장소의 원격(GitHub)에는 올라가지 않는다. 저장소의 `.agent/session-handoff.md`는 gitignored 스텁이며 위 위치를 가리키기만 한다.

### 산출물 저장 경계

- 이력서, 경력기술서, 자기소개서, 통합본, 기업분석, 면접자료, MOC, DOCX/PDF 및 문서 생성 스크립트는 모두 외부 Wiki의 `resume\` 아래에서만 생성·수정·보관한다.
- 저장소에는 위 산출물의 사본이나 미러를 만들지 않는다. 정적 사이트 소스(`index.html`, `css/`, `js/`, `data/`, `assets/`)와 사이트 검증 도구만 유지한다.
- 사용자에게 산출물을 안내할 때는 반드시 `D:\obsidian-storage\project-rag\resume` 아래의 절대 경로를 링크한다.

### 에이전트 진입/종료 절차

- **작업 시작**: `resume\session-memory.md`를 읽는다. `Status`, `Current state`, `Remaining tasks`를 현재 작업에 반영한다. load-bearing한 내용(파일 경로, "done" 주장)은 실제 저장소 상태와 교차 확인한다.
- **작업 종료 전**: 같은 파일의 `Current state` / `Changed` / `Remaining tasks` / `Notes` 절을 최신 상태로 교체하고, `Session log`에 한 줄 append한다. 원문 토큰·PII 금지.
- 다른 도구(Antigravity, Codex 등)도 같은 파일 경로를 읽고 쓰도록 한다 — 이 규칙은 도구 비종속이다.

## 문서 라이프사이클 규칙 (필수 적용)

취업 서류의 작성·이동·정리 요청을 받으면 작업 전에 `D:\obsidian-storage\project-rag\resume\00-MOC\09-Document-Lifecycle-Rule.md`를 읽고 따른다.

1. **검토:** 새 문서는 `05-targets/<회사-공고>-검토/`에 `*_검토시안.md`로 만들고 사용자 승인을 받는다.
2. **승인:** 승인되면 같은 턴에 `01-resumes`·`02-career-descriptions`·`03-cover-letters`·`05-targets` 등 목적 폴더로 표준 파일명으로 이동하고 index·MOC·대시보드·세션 기억을 갱신한다.
3. **결과:** 사용자가 대화창에 전형 결과를 알려 주면 `지원결과_통합기록.md`에 기록하고, 최종 결과면 해당 회사 파일을 `99-archive/<회사>/`로 옮기며 `지원현황_대시보드.md` 통계를 갱신한다.

- **예외:** 회사 전용 문서 없이 공통 서류로 바로 지원한 경우는 파일 이동 없이 통합기록과 대시보드에 결과만 기록한다.

## 내용 변경 시 공통(대표) 파일 우선 컨펌 규칙

- 취업 서류 내용(이력서, 경력기술서, 자기소개서, 통합본 등)의 신규 추가나 내용 변경이 필요한 경우, 전체 32개사에 일괄 적용하지 않고 **공통(대표) 파일(`*공통*`)을 우선 수정**한다.
- 수정한 공통(대표) 파일의 내용 및 출력 형식을 사용자에게 먼저 제시하여 **무조건 컨펌(승인)을 받은 후에**, 전체 31개 타깃사 반영 여부를 묻고 승인받아서 후속 전개한다.

## 취업 서류 산출물 생성 규칙

- 결과 Markdown 산출물의 유일한 저장 위치는 외부 Wiki(`D:\obsidian-storage\project-rag\resume`)다. 저장소 사본은 생성하지 않는다.
- 내용 신규 생성이나 수정 요청은 **Markdown 원본(`.md`)만 생성·수정**하고 작업을 종료한다.
- 사용자가 **DOCX 생성을 명시적으로 요청한 경우에만** 승인된 Markdown 원본을 기존 문서 포맷에 맞춰 `.docx`로 변환하고 렌더링 검증한다.
- PDF 생성·변환은 작업 흐름에서 삭제하며 수행하지 않는다.
- 내용 작업만 요청받은 경우 DOCX/PDF 빌드 스크립트 실행, 페이지 수 검증, 렌더 이미지 생성, 바이너리 동기화를 수행하지 않는다.

## 검증

자동 점검: `node test-playwright/verify-site.js`(3개 뷰 렌더링, 경력 데이터, `?company=` 폴백, 블로그 링크, 인쇄 레이아웃·페이지 수). 데이터나 `js/script.js`·`css/style.css`를 바꾼 뒤 실행한다.

정적 서버로 서빙 후 3개 뷰(`#resumePage` / `#summaryPage` / `#domainPage`)와 인쇄(🖨️ `printResume()`) 출력을 확인한다. 인쇄는 `@media print`에서 데스크톱 3단 레이아웃을 축소 없이 페이지당 한 화면으로 낸다.

