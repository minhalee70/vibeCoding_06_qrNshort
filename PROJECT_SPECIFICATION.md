# QR코드 & URL 단축 통합 웹 서비스 개요 및 기능 명세서

## 1. 프로젝트 개요 (Project Overview)
본 프로젝트는 **고화질 QR코드 생성** 기능과 **긴 웹 주소를 짧게 줄여주는 URL 단축 서비스**를 제공하는 웹 애플리케이션 플랫폼입니다. 현대적인 Glassmorphism 인터페이스와 마우스 트래킹 배경 애니메이션, 그리고 신뢰성 높은 OpenAPI 연동을 기반으로 직관적이고 반응성 뛰어난 사용자 경험(UX)을 선사합니다.

- **프로젝트 명**: QR Craft & URL Shortener Platform
- **기술 스택**: HTML5, CSS3 (Vanilla CSS, Glassmorphism Design System), JavaScript (ES6+), FontAwesome Icons, Google Fonts (Plus Jakarta Sans, Noto Sans KR)
- **외부 OpenAPI**: `is.gd`, `spoo.me`, `TinyURL` (Multi-level Fallback OpenAPI Engine)

---

## 2. 서비스 주요 특징 및 디렉토리 구조 (Architecture)

```
c:\Users\user\Desktop\프로젝트06
├── index.html              # 루트 메인 리다이렉트 / 진입 포털
├── url2qr/                 # [QR코드 생성 모듈]
│   ├── index.html          # QR코드 생성기 메인 화면 (네비게이션 탭 포함)
│   ├── style.css           # QR코드 디자인 시스템 및 애니메이션
│   ├── app.js              # QRCode 생성, 이미지 다운로드, 캔버스 렌더링
│   └── js/qrcode.min.js    # QRCode JS 라이브러리
└── urlShort/               # [URL 단축 모듈 - 신규 추가]
    ├── index.html          # URL 단축기 메인 화면
    ├── style.css           # 단축기 반응형 Glassmorphic 스타일시트
    └── app.js              # OpenAPI 단축 요청, 버튼 동적 제어, 복사/알림 로직
```

---

## 3. 세부 기능 명세서 (Functional Specifications)

### A. 상단 공통 네비게이션 (Navigation System)
| 기능 | 설명 | 구현 상태 |
| :--- | :--- | :---: |
| **'QR코드' 버튼** | 클릭 시 `url2qr/index.html` 페이지로 즉시 이동 및 탭 활성화 | ✅ 완료 |
| **'URL단축' 버튼** | 클릭 시 `urlShort/index.html` 페이지로 즉시 이동 및 탭 활성화 | ✅ 완료 |
| **상호 연동 (Bridge)** | URL 단축 후 '이 단축주소로 QR 생성' 클릭 시 QR코드 생성기로 자동 연결 및 QR 생성 | ✅ 완료 |

---

### B. URL 단축 서비스 (`urlShort`)
| 요구사항 번호 | 주요 기능 명세 | 세부 구현 내용 |
| :---: | :--- | :--- |
| **3-1** | **핵심 UI 구성요소** | • **URL 입력창** (`#urlInput`): 원본 URL 입력 폼<br>• **'단축하기' 버튼** (`#shortenBtn`): 단축 요청 실행 버튼<br>• **읽기 전용 출력 상자** (`#outputUrl`): 단축 결과를 안전하게 보여주는 `readonly` input 필드 |
| **3-2** | **버튼 비활성화 조건** | • 입력 필드가 비어있을 경우 '단축하기' 버튼이 동적으로 `disabled` 상태로 변환되며 클릭 불가 처리<br>• 입력값이 1자 이상 들어올 경우 즉시 활성화 스타일로 전환 |
| **3-3** | **OpenAPI 연동 및 출력** | • '단축하기' 클릭 시 OpenAPI (`is.gd`, `spoo.me`, `TinyURL`)로 비동기(`fetch`) 단축 요청<br>• 요청 성공 시 단축 결과를 읽기 전용 출력 상자 및 이동 링크에 실시간 표출<br>• 네트워크 오류 대비 다중 Fallback 엔진 탑재 |
| **3-4** | **클립보드 자동 복사 및 알림** | • '복사' 버튼 클릭 시 클립보드에 자동 복사 (`navigator.clipboard`) 실행<br>• 요구사항에 맞춰 **'복사하였습니다' `alert` 알림창** 팝업 출력<br>• 시각적 편의를 위한 Toast 안내 메시지 및 버튼 상태 변화 제공 |

---

### C. QR 코드 생성 서비스 (`url2qr`)
| 기능 | 세부 구현 내용 |
| :--- | :--- |
| **고화질 QR 생성** | 입력된 URL 기반으로 실시간 QR코드 캔버스 생성 및 스캔 라인 이펙트 제공 |
| **JPG 이미지 저장** | 생성된 QR 코드를 원클릭으로 JPG 그래픽 파일 저장 다운로드 |
| **이미지 복사 & 링크 이동** | QR 코드 이미지 복사 및 타겟 사이트 바로 가기 기능 |

---

## 4. 사용자 가이드 (How to Use)
1. 브라우저에서 `index.html` 또는 `urlShort/index.html`을 엽니다.
2. 상단 네비게이션 탭에서 **[QR코드]**와 **[URL단축]** 기능을 자유롭게 전환합니다.
3. **[URL단축]** 메뉴에서 긴 URL 주소를 입력창에 넣으면 '단축하기' 버튼이 활성화됩니다.
4. **[단축하기]**를 누르면 OpenAPI를 호출하여 단축된 URL이 출력 상자에 나타납니다.
5. **[복사]** 버튼을 클릭하면 **'복사하였습니다'** 알림창과 함께 클립보드로 복사됩니다.
6. 필요한 경우 **[이 단축주소로 QR 생성]**을 눌러 해당 주소의 QR 코드를 즉시 생성할 수 있습니다.
