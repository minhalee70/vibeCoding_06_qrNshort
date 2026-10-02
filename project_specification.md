# 🧰 스마트 툴박스 (Smart Toolbox) - 개요 및 기능 명세서

---

## 📑 1. 프로젝트 개요 (Overview)

**스마트 툴박스(Smart Toolbox)**는 웹상에서 자주 필요한 핵심 툴인 **QR 코드 생성기**와 **URL 단축기**를 하나의 통합된 웹 애플리케이션으로 제공하는 파스텔 라이트 테마 웹 서비스입니다. 

화사한 파스텔 오라 배경 애니메이션과 글래스모피즘 UI 요소를 통합 적용하여 현대적이고 직관적인 UX/UI 경험을 전달합니다.

- **서비스명**: 스마트 툴박스 (Smart Toolbox)
- **주요 기능**: 메인 게이트웨이, QR 코드 생성 및 다운로드, 실시간 URL 단축 및 클립보드 복사
- **디자인 테마**: Bright Light Pastel Theme (화이트, 연보라, 파스텔 시안/핑크 그라데이션)

---

## 📐 2. 프로젝트 디렉터리 구조 (Directory Structure)

```
프로젝트06_1/
├── index.html               # [메인 대문] 스마트 툴박스 게이트웨이 화면
├── style.css                # [메인 대문] 디자인 시스템 및 애니메이션 CSS
├── app.js                   # [메인 대문] 마우스 추적 파스텔 오라 스크립트
├── url2qr/                  # [QR 코드 생성기 모듈]
│   ├── index.html           # QR 코드 생성 화면 ('← 홈으로' 링크 보완)
│   ├── style.css            # QR 코드 생성기 파스텔 스타일시트
│   ├── app.js               # QR 코드 생성 & Canvas Rendering 로직
│   ├── img/logo.png         # QR Craft 브랜드 로고
│   └── js/qrcode.min.js     # QRCode 렌더링 라이브러리
└── urlShort/                # [URL 단축기 모듈]
    ├── index.html           # URL 단축 화면 ('← 뒤로가기' 헤더 링크 포함)
    ├── style.css            # URL 단축 화면 디자인 시스템 (url2qr 테마 100% 동기화)
    └── app.js               # is.gd API 연동, https:// 자동 보정, 로딩 텍스트, 클립보드 복사 및 히스토리 관리
```

---

## 🎨 3. 디자인 시스템 (Design System Specification)

| 구분 | 사양 및 가이드 |
| :--- | :--- |
| **Color Palette** | • Background: `#f8fafc` Base with `#eef2ff`, `#f0fdf4`, `#faf5ff` gradient<br>• Primary Glow: `#6366f1` (Purple)<br>• Secondary Glow: `#8b5cf6` (Indigo)<br>• Accent Pink: `#ec4899`<br>• Text Main: `#0f172a`, Text Muted: `#475569` |
| **Typography** | • Font Family: `'Plus Jakarta Sans'`, `'Noto Sans KR'`, sans-serif<br>• Title: 800 Weight, Subtitle: 500 Weight |
| **Components** | • Glassmorphic Card (`backdrop-filter: blur(20px)`, `border: 1px solid rgba(203, 213, 225, 0.7)`)<br>• Gradient Button (`linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)`) |
| **Interactive** | • 마우스 위치 추적 반응형 Glowing Orbs (`--mouse-x-pct`, `--mouse-y-pct`)<br>• 3D 호버 트랜스폼 및 섀도우 확장 효과 |

---

## 📋 4. 페이지별 상세 기능 명세 (Feature Specifications)

### 4.1 메인 대문 화면 (`/index.html`)

1. **헤더 & 브랜딩**
   - 툴박스 아이콘 및 "스마트 툴박스 / Smart Toolbox" 서비스 로고 배치.
2. **히어로 영역**
   - Main Title: `"스마트 툴박스"`
   - Subtitle: `"원하는 기능을 선택해주세요"`
3. **세로 배치 2대 카드 바로가기 버튼**
   - **QR코드 생성 카드** (`card-qr`):
     - 클릭 시 `./url2qr/index.html` 로 이동.
     - QR 코드 전용 아이콘(`fa-qrcode`)과 설명문 표시.
   - **URL 단축 카드** (`card-url`):
     - 클릭 시 `./urlShort/index.html` 로 이동.
     - 가위/단축 아이콘(`fa-scissors`)과 설명문 표시.

---

### 4.2 URL 단축 기능 화면 (`/urlShort/index.html`)

1. **상단 뒤로가기 링크**
   - 좌측 상단 모서리에 `'← 뒤로가기'` (`href="../index.html"`) 미니멀 링크 배치.
2. **URL 입력 필드 & 프로토콜 자동 보정**
   - Input Placeholder: `"단축할 URL을 입력하세요 (https://...)"`
   - 사용자가 `https://` 또는 `http://`를 붙이지 않아도 자동으로 `https://`를 보정하여 단축 실행.
   - 입력값 유무에 따라 **'단축하기'** 버튼 자동 활성화/비활성화 (`disabled`).
3. **단축 처리 & 로딩 상태 ("단축 중...")**
   - 버튼 클릭 시 처리 중 버튼 텍스트가 **`"단축 중..."`** (스피너 아이콘 포함)으로 변경 및 버튼 비활성화.
   - **is.gd Free Open API** (`https://is.gd/create.php?format=json&url=...`)를 활용하여 프론트엔드/CORS 제한 없이 실제 유효한 단축 링크 발급. (TinyURL fallback)
   - API 응답 실패 시 사용자에게 `alert`로 안내하며, 가짜 404 URL을 절대 생성하지 않음.
4. **단축된 URL 출력 상자 & 복사**
   - 결과 출력 필드: `readonly` 속성 적용.
   - **'복사'** 버튼 클릭 시 클립보드 복사 (`navigator.clipboard.writeText`) 실행.
   - 복사 성공 시 `"복사하였습니다"` `alert` 알림창 표출.
   - **'새 탭에서 생성된 링크 열기'** 숏컷을 눌러 브라우저에서 실제 원본 사이트로 정상 리다이렉트되는지 검증 가능.
5. **최근 단축 히스토리**
   - LocalStorage 연동으로 최근 생성한 5개 단축 주소 자동 저장.

---

### 4.3 QR 코드 생성기 화면 (`/url2qr/index.html`)

1. **'← 홈으로' 상단 링크 추가**
   - Header 영역 좌측에 `'← 홈으로'` (`href="../index.html"`) 링크 통합.
2. **기존 고품질 기능 보존**
   - URL 입력 후 실시간 QR 코드 Canvas 렌더링 및 JPG 다운로드 기능 완벽 유지.

---

## ⚡ 5. API 및 연동 규격 (API Integration)

```javascript
// 안정적인 is.gd Open API 연동 로직
async function getShortUrl(rawUrl) {
  let formattedUrl = rawUrl.trim();
  
  // 1. https:// 프로토콜 자동 보정
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }

  // 2. is.gd API 호출 (CORS 헤더 Access-Control-Allow-Origin: * 지원)
  try {
    const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(formattedUrl)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.shorturl) {
        return { shortUrl: data.shorturl, originalUrl: formattedUrl };
      }
    }
  } catch (err) {
    console.warn('is.gd fetch error...', err);
  }

  // Fallback API (TinyURL)
  const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(formattedUrl)}`);
  if (res.ok) {
    const text = await res.text();
    if (text.startsWith('http')) {
      return { shortUrl: text.trim(), originalUrl: formattedUrl };
    }
  }

  throw new Error('단축 생성 실패');
}
```
