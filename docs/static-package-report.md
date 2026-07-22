# 정적 배포 패키지 보고서

## 포함한 파일

`deploy-static`에는 정적 수동 모드 실행에 필요한 파일만 포함했다.

- `index.html`: 앱 진입점, 제품명과 첫 화면 헤더, `styles.css`, `js/app.js`를 로드한다.
- `styles.css`: 전체 레이아웃, 입력 카드, 결과 패널, 반응형 스타일을 제공한다.
- `js/app.js`: 화면 렌더링, 상태 관리, 수동 AI 채팅 복사·붙여넣기 흐름을 제어한다.
- `js/data.js`: 선택지 데이터와 메타데이터를 제공한다.
- `js/engine.js`: DOM 비의존 규칙 기반 보조 엔진이다.
- `js/input.js`: preset/custom 입력 정규화와 검증을 제공한다.
- `js/prompt.js`: AI 채팅용 1차 요청과 선택한 축의 2차 요청을 생성한다.
- `js/ai.js`: AI 응답 계약, mock, fallback, 선택적 API 요청 구조를 제공한다.
- `js/interpretation.js`: 규칙 기반 참고 해석과 fallback 단서를 제공한다.

`js/interpretation.js`는 초기 예상 목록에는 없었지만 `js/app.js`가 직접 import하는 필수 모듈이라 포함했다.

## 제외한 파일

- `.env`: 실제 환경 변수와 API 키가 들어갈 수 있으므로 제외했다.
- `.env.example`: 예시 키만 들어 있지만 정적 배포에는 필요 없으므로 제외했다.
- `.git`, `.gitignore`: 배포 실행에 필요 없으므로 제외했다.
- `server.js`: 선택적 API 프록시 서버이며 수동 정적 모드에는 필요 없으므로 제외했다.
- `README.md`: 배포 앱 실행에 필요 없으므로 제외했다.
- `docs/`: 문서이므로 배포 폴더에는 포함하지 않았다.
- `tests/`: 개발 검증용이므로 제외했다.
- `node_modules`, `package.json`, `package-lock.json`: 현재 프로젝트에는 정적 실행에 필요한 패키지 의존성이 없고, 배포 폴더에도 포함하지 않았다.
- `outputs/`, `work/`, `.agents/`, `.codex/`: 로컬 작업 산출물 또는 내부 메타데이터이므로 제외했다.

## server.js를 제외한 이유

기본 모드는 사용자가 앱에서 AI 채팅용 요청문을 복사하고, AI 응답 JSON을 다시 붙여 넣는 수동 흐름이다. 이 흐름은 브라우저 안에서만 동작하며 `server.js`나 `/api/interpret`가 필요하지 않다.

`server.js`는 `?apiAi=1`을 명시적으로 붙인 선택적 API 모드에서만 필요하다. 정적 호스팅에 `server.js`를 올려도 서버 기능이 실행되지 않으므로 배포 패키지에서 제외했다.

## .env와 .env.example을 제외한 이유

`.env`는 실제 `OPENAI_API_KEY`를 담을 수 있어 정적 배포에 포함하면 안 된다. `.env.example`은 가짜 예시 값만 담고 있지만 앱 실행에는 필요 없으므로 함께 제외했다.

## 정적 수동 모드 작동 구조

1. `index.html`이 `styles.css`와 `js/app.js`를 상대경로로 로드한다.
2. `js/app.js`가 필요한 로컬 모듈을 `./data.js`, `./engine.js`, `./input.js`, `./prompt.js`, `./ai.js`, `./interpretation.js`로 불러온다.
3. 기본 URL에서는 `getPromptMode({ search: "" })`가 `manual`을 반환한다.
4. 사용자가 입력을 작성하고 AI 채팅 요청문을 복사한다.
5. 사용자가 AI 응답 JSON을 붙여 넣으면 앱이 로컬에서 파싱하고 렌더링한다.

## 외부 요청 발생 여부

기본 접속 상태에서는 외부 API 호출이 활성화되지 않는다. `deploy-static/js/app.js` 안에 `/api/interpret` 호출 코드가 남아 있지만, 이는 `?apiAi=1` 모드에서만 실행되는 선택적 경로다.

검증 결과:

- 기본 모드: `manual`
- `?apiAi=1`: `api`
- `?mockAi=1`: `mock`

## 실제 키 검색 결과

프로젝트와 `deploy-static`에서 다음 위험 패턴을 검색했다.

- `OPENAI_API_KEY=sk-...`
- `Authorization: Bearer sk-...`
- `sk-proj-...`
- 긴 `sk-...` 토큰 형태
- `C:\Users\SAMSUNG`
- 이메일 형태 문자열

검색에서 나온 `risk-to-individual-profit-to-company`는 선택지 데이터의 ID이며 OpenAI 키가 아니다. 실제 API 키나 개인 토큰은 발견되지 않았다.

## 상대경로 검사 결과

`deploy-static/index.html`의 로컬 리소스 경로:

- `href="styles.css"`: 정상 상대경로
- `src="js/app.js"`: 정상 상대경로

문제 가능성이 있는 `C:\Users\...`, `file:///...`, `/js/app.js`, `/styles.css` 경로는 발견되지 않았다.

## 로컬 검증 결과

Node 표준 모듈로 `deploy-static` 폴더를 임시 정적 서버로 열어 파일 응답을 확인했다.

- `/index.html`: 200
- `/styles.css`: 200
- `/js/app.js`: 200
- `<title>세계사 조건 렌즈</title>` 확인
- `href="styles.css"` 확인
- `src="js/app.js"` 확인

전체 원본 테스트도 통과했다.

- `prompt`: 239
- `ai`: 40
- `app`: 198
- `server`: 7
- `interpretation`: 45
- `engine`: 20
- `input`: 43

원본 JavaScript와 `deploy-static` JavaScript 문법 검사도 통과했다. 원본 파일과 배포 폴더 파일의 SHA-256 해시도 모두 일치했다.

## 사용자가 직접 확인해야 할 항목

실제 호스팅 서비스에 업로드한 뒤 데스크톱 브라우저에서 다음을 확인한다.

- 첫 화면에 `세계사 조건 렌즈`가 표시되는지
- 소개문과 입력 영역이 표시되는지
- AI 채팅용 요청 복사 버튼이 보이는지
- 전용 GPT 또는 커스텀 GPT 관련 버튼이 없는지
- 정상 `axis-finder` JSON을 붙여 넣으면 방향 카드가 표시되는지
- 방향 선택 후 2차 요청을 복사할 수 있는지
- 정상 `editor` JSON을 붙여 넣으면 최종 결과가 표시되는지
- 잘못된 JSON에 수정 가능한 오류 안내가 나오는지
- 브라우저 콘솔에 로드 오류가 없는지
