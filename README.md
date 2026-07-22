# 세계사 비교 주제 찾기

사회 압력, 외부 조건, 주도 행위자, 영향을 받는 집단과 제도 변화를 조합해 참고할 만한 세계사의 사건·제도·생활상·사조·예술·문화적 흐름을 찾아보는 정적 웹앱입니다.

## 어떤 도구인가

이 도구는 어떤 역사 장면을 다른 장면과 같다고 단정하지 않습니다. 사용자가 고른 조건을 바탕으로 인간사가 반복해온 명분, 분류, 동원, 배제, 생활 전략, 문화 표현, 저항과 균열의 패턴을 조심스럽게 비교하도록 돕습니다.

완성된 역사 해설을 대신 쓰는 도구가 아닙니다. 사용자가 고른 요소를 바탕으로 AI 채팅이 가능한 역사적 쟁점을 나누어 보여주고, 사용자가 선택한 한 쟁점을 세계사의 사건, 제도, 생활상, 사상, 예술, 문화와 비교해 읽도록 돕습니다.

## 핵심 사용 흐름

1. `0단계 · 탐색 범위`에서 필요하면 우선 살펴볼 시대·지역 범위를 힌트로 적습니다. 비워두어도 됩니다.
2. 막막하면 빠른 시작 템플릿을 적용하거나, 조건, 구조, 작동과 결과 요소를 선택하거나 직접 입력합니다. 한 항목에서 보기를 여러 개 고를 수 있고, 모든 항목을 채울 필요는 없습니다.
3. `1. 요청 만들기`를 누릅니다.
4. 결과 패널 맨 위의 `2. 내 AI에 붙여넣기`를 눌러 ChatGPT, Claude, Gemini 같은 AI 채팅에 붙여 넣습니다.
5. AI가 반환한 답변을 앱으로 가져와 `3. 답변 적용하기`를 누릅니다.
6. 표시된 역사적 쟁점 3개 중 하나에서 `이 쟁점을 AI 채팅에서 더 읽기`를 누릅니다.
7. 복사된 2차 학습 프롬프트를 AI 채팅에 붙여 넣고, 긴 역사 해설은 해당 채팅창에서 이어서 읽습니다.

붙여 넣은 JSON이 최신 구조가 아니면 앱은 누락된 필드 예시를 보여주고 `다시 요청 문구 복사` 버튼을 제공합니다. 이 문구를 AI 채팅에 붙여 넣으면 `historicalCases`, `similarities`, `differences`, `humanBehaviorPattern`, `futureInsight`, `verificationKeywords`를 포함한 최신 `axis-finder` JSON을 다시 요청할 수 있습니다.

쟁점 카드의 `확인 키워드 복사` 버튼은 사례별 검색 키워드를 따로 모읍니다. 이 키워드는 참고문헌 보증이 아니라, 사용자가 사전·백과·도서관·논문 검색에서 사실관계를 다시 확인하기 위한 출발점입니다.

기본 모드는 수동 복사·붙여넣기 방식입니다. 웹페이지가 AI 채팅 대화를 자동으로 읽지 않고, 사용자가 복사 버튼을 누르기 전에는 입력 내용이 외부 API로 전송되지 않습니다.

## 로컬에서 실행하는 방법

가장 단순한 방법:

```cmd
start index.html
```

선택적 서버 모드:

```cmd
node server.js
```

그 다음 브라우저에서 `http://localhost:5173`을 엽니다. 서버 모드는 선택 기능이며, 수동 AI 채팅 방식만 사용할 때는 필수 아님입니다.

## API 키 없이 사용하는 방법

`index.html`을 직접 열어도 핵심 기능을 사용할 수 있습니다. 입력을 정리하고, AI 채팅 요청문을 복사하고, AI가 반환한 답변을 다시 붙여 넣는 흐름은 정적 파일만으로 동작합니다.

## 선택적 API 모드

OpenAI API 자동 호출은 선택 기능입니다. 기본값은 꺼져 있습니다.

- `?apiAi=1`: 로컬 `server.js`의 `/api/interpret`를 통해 API 호출
- `?mockAi=1`: 개발용 mock 응답 확인

API 모드를 사용하려면 `.env.example`을 참고해 `.env`에 `OPENAI_API_KEY`를 설정하고 `node server.js`를 실행합니다. API 사용에는 별도 비용이 발생할 수 있습니다. API 키는 브라우저 코드에 넣지 않습니다.

## 정적 배포 방법

빌드 명령은 필요 없습니다. 정적 호스팅에는 다음 파일과 폴더를 그대로 올립니다.

- `index.html`
- `styles.css`
- `js/`
- `docs/`는 선택 문서

수동 모드에서는 `server.js`와 `.env`가 필요 없습니다. `.env`는 배포하거나 커밋하지 마세요.

자세한 내용은 [docs/deployment.md](docs/deployment.md)를 참고하세요.

## 테스트 실행 방법

```cmd
node tests\prompt.test.mjs
node tests\ai.test.mjs
node tests\app.test.mjs
node tests\server.test.mjs
node tests\interpretation.test.mjs
node tests\engine.test.mjs
node tests\input.test.mjs
```

문법 검사:

```cmd
node --check js\prompt.js
node --check js\ai.js
node --check js\app.js
node --check server.js
```

## 프로젝트 구조

- `index.html`: 정적 앱 진입점
- `styles.css`: 레이아웃, 입력 카드, 결과 패널, 반응형 스타일
- `js/data.js`: 선택지 데이터
- `js/engine.js`: DOM 비의존 규칙 기반 보조 엔진
- `js/input.js`: preset/custom 입력 정규화
- `js/interpretation.js`: 규칙 기반 참고 해석과 fallback 단서
- `js/prompt.js`: AI 채팅 요청문 생성
- `js/ai.js`: AI 응답 계약, mock, fallback, 선택적 API 요청 구조
- `js/app.js`: UI 렌더링, 상태 관리, 복사·붙여넣기 흐름
- `server.js`: 선택적 API 프록시 서버
- `docs/spec.md`: 설계 기록
- `docs/manual-chatgpt-workflow.md`: 수동 AI 채팅 사용법
- `docs/deployment.md`: 배포 안내
- `docs/release-checklist.md`: 릴리스 점검표

## 현재 한계

- 기본 모드는 외부 AI를 직접 호출하지 않습니다.
- AI 채팅 답변은 그대로 붙여 넣으면 됩니다.
- 저장, 공유, PDF, 로그인, 자동 방향 선택은 없습니다.
- 규칙 기반 엔진은 점수판이 아니라 내부 참고와 fallback 용도입니다.
- API 모드는 로컬 서버와 별도 키 설정이 필요합니다.
- 사이트 안에서 실제 검색/API 기반 출처 검증 루프는 제공하지 않습니다. 현재 제품은 AI가 검증 키워드를 남기고, 사용자가 별도 검색으로 직접 확인하는 방식입니다.
- 빠른 시작 템플릿은 학습 질문을 여는 예시일 뿐이며 특정 사건을 정답으로 추천하지 않습니다.
