/* ============================================================
   SITE DATA — 문구/이미지는 이 파일만 고치면 페이지 전체에 반영돼요.
   ※ 아래 이름·회사·수치·사례는 전부 "예시 데이터"예요. 실제 정보로 바꿔주세요.
   (img / photo 값을 채우면 직접 찍은 이미지로 바뀌어요. 예: 'assets/work01.jpg')
   ============================================================ */
window.SITE_DATA = {
  name: '김서영',
  resume: '',                         // 이력서 PDF 경로 예: 'assets/resume.pdf' (비우면 버튼 숨김)
  role: 'UI/UX · Web · Marketing',

  hero: {
    title: ['Baking Ideas,', 'Spreading Stories.'],
    sub: '아이디어를 굽고, 이야기를 바릅니다.',
    role: '모두의 재밌는 경험을 위해 설계하는 사람',
    cue: '스크롤해서 토스트를 구워보세요'
  },

  profile: {
    photo: '',                       // 예: 'assets/profile.jpg'
    bio: [
      '조화로움을 위해, 새로운 시도를 거듭하며 나아가겠습니다.'
    ],
    /* 성격 키워드 + 실제 사례 한 줄 (예시) */
    keywords: [
      { k: '조율력', d: '의견이 갈린 [프로젝트]에서 [방법]으로 합의를 이끌었어요.' },
      { k: '상상력', d: '[상황]에서 [아이디어]를 제안해 [결과]로 이어졌어요' },
      { k: '완주력', d: '[어려운 상황]에서도 [기간] 동안 끝까지 마무리해 [결과]를 냈어요' }
    ]
  },

  career: [
{ period: '2027.02 졸업 예정', title: '서울여자대학교', desc: '[인문대학] 일어일문학과, [연계전공] 디지털융합경영전공' },
{ period: '2026.09 — 2026.12', title: '안양 그린 아카데미 실무형 교육', desc: 'AI 워크플로우 기반 UXUI 제작 실무자 양성반' },
{ period: '2023 — 2026', title: '수학학원 보조강사', desc: '3년간 수업 보조, 학생 질의응답과 학습 관리 담당' },
{ period: '2021 — 2023', title: '서울여대 일어일문학과 학생회 보도국', desc: '일원 -> 보도국장, 행사 기획 · 학과 SNS 운영 · 뉴스레터 디자인 · 학과신문 발행' },
{ period: '2021.02', title: '안양외국어고등학교 졸업', desc: '일어학과 교육과정 이수' }
  ],

  certs: [
    { name: 'JLPT N1',     org: '일본국제교육지원협회', date: '2027.01' },
    { name: '컴퓨터활용능력 2급', org: '대한상공회의소',   date: '2026.12' },
    { name: 'GTQ 1급 / ITQ',    org: '한국생산성본부',   date: '2026' }
  ],

skills: [
  { title: 'DESIGN TOOL', sub: '디자인 프로그램', icon: 'i-browser',
    items: [
      ['Figma', 85, 'assets/skill-figma.png'],
      ['Photoshop', 70, 'assets/skill-ps.png'],
      ['Illustrator', 70, 'assets/skill-ai.png'],
      ['HTML / CSS', 75, 'assets/skill-html.png'],
      ['Clipstudio', 80, 'assets/skill-clip.png']
    ] },
  { title: 'WORK TOOL', sub: '업무·협업 프로그램', icon: 'i-phone',
    items: [
      ['Word, hwp', 90, 'assets/skill-word.png'],
      ['PPT, 캔바, 미리캔버스', 90,'assets/skill-ppt.png'],
      ['Excel', 65, 'assets/skill-excel.png'],
      ['Notion', 70, 'assets/skill-notion.png'],
      ['Discord', 80, 'assets/skill-discord.png']
    ] }
],

  /* 취미 메뉴판 — photo 에 이미지 경로를 넣으면 사진으로 바뀌어요 (비우면 일러스트) */
  hobbies: [
    { name: '다이어리 쓰기', en: 'DIARY', stat: '6년째', icon: 'i-diary', photo: '',
      desc: '일상과 계획을 기록하고 직접 꾸며요. 아이디어와 스스로를 정리하는 시간을 보내요.' },
    { name: '게임', en: 'GAME', stat: 'MMORPG · AOS', icon: 'i-pad', photo: '',
      desc: '함께 플레이하며 협동하는 즐거움, 게임의 이벤트와 UI, 서사 등을 흥미롭게 관찰하고 플레이해요.' },
    { name: '사진 찍기', en: 'PHOTO', stat: '일상 기록', icon: 'i-camera', photo: '',
      desc: '시간과 날씨, 계절에 따라 달라지는 풍경과 사람, 물건 등을 기록하는 걸 좋아해요.' }
  ],

  /* cat: web | ui | promotion | other
     steps: [['단계명','한 줄 설명'], …]  ·  metrics: [['지표명','수치'], …]
     problem(문제) → steps(과정) → result/metrics(결과) 순서로 상세에 표시돼요 */
  /* ※ w2 · u1 · u2 · p2 · o1 · o2 는 아직 예시 데이터예요. 실제 작업으로 바꾸거나 지워주세요. */
  works: [
    { id: 'w1', cat: 'web', title: '국내 화장품 브랜드 AIBB 웹사이트 리뉴얼', year: '2026', role: '기획 · 웹 디자인 · 구현',
      period: '2026.11 (2주)', team: '1인 진행',
      summary: '“My color, My choice” — 컬러를 고르는 즐거움을 담은 반응형 쇼핑 웹사이트', img: '',
      tools: ['Figma', 'Photoshop', 'HTML/CSS', 'Claude AI'],
      problem: 'PC에서도 모바일 화면이 가운데 고정되어 있어 정보 밀도와 몰입감이 낮았어요. 컬러가 많아 선택이 어렵고, 룩북에서 마음에 든 제품을 바로 살 수 없는 구조였어요.',
      goal: '원하는 컬러를 빠르게 찾고, 즐겁게 비교하고, 망설임 없이 구매까지 이어지는 흐름 만들기',
      steps: [['리서치', '현행 사이트를 진단하고 올리브영·아모레퍼시픽 톤워크 등의 경쟁사를 분석해 페르소나 3명을 정의했어요.'],
              ['설계', 'UX 문제를 정의하고, 정보구조(IA)와 유저 플로우를 설계했어요.'],
              ['디자인', '대표색 #E72019를 이용하여, 키치하고 깔끔한 반응형 UI를 만들었어요.'],
              ['구현', '컬러 테스트, 스와치 필터 등 핵심 기능을 직접 코드로 구현하고 배포했어요.']],
      result: ['PC·태블릿·모바일 반응형 구조', '‘나만의 컬러 찾기’ 테스트로 추천 동선 구축', '룩북·리뷰에서 구매로 이어지는 연결'],
      metrics: [['페르소나', '3명'], ['UX 개선 과제', '4개'], ['핵심 기능', '8개']],
      learned: '사용자 입장에서 페이지의 장단점을 파악하고, 브랜드 아이덴티티를 디자인에 녹여내는 일이 어려운 만큼 보람 있다는 것을 배웠어요.', link: 'https://inmoonmi.github.io/aibb-renewal-concept/' },

    { id: 'u1', cat: 'ui', title: '캐릭터 IP 팝업스토어 「키토의 선물가게」 서비스 설계', year: '2026', role: '기획 · UX/UI · 서비스 구조 · 캐릭터 · 브랜딩',
      period: '2026.11 (7일)', team: '1인 진행',
      summary: '“원하는 굿즈를 내 손에, 쾌적하게” — QR 주문부터 교환매칭까지, 덕후의 마음으로 설계한 팝업스토어 서비스', img: '',
      tools: ['Figma', 'Photoshop', 'Illustrator', 'ChatGPT', 'Claude AI'],
      problem: '캐릭터 팝업스토어는 구경·고르기·결제가 한 동선에 몰려 결제줄이 길고, 좁은 매장은 늘 혼잡했어요. 랜덤 굿즈에서 원하는 캐릭터가 나오지 않으면 매장 주변에서 교환 상대를 찾거나, 결국 중고거래로 웃돈을 주고 사야 했어요.',
      goal: '구경은 손으로, 구매는 폰과 키오스크로, 교환은 매장 안에서 — 좋아하는 마음이 미워지지 않는 팝업 경험 만들기',
      steps: [['리서치', '굿즈샵·팝업 이용 경험을 바탕으로 포켓몬 고풍상점, 영화 특전 재고 현황, 패스트푸드 키오스크, SNS 교환 문화를 분석하고 페르소나 3명을 정의했어요.'],
              ['아이디어', '기존 매장들이 해결하지 못한 ‘랜덤 굿즈 교환’ 문제에 집중해, 매장 안에서 정가로 교환하는 교환매칭을 기획했어요.'],
              ['설계', '방문 바코드 하나로 입장·구매·교환·퇴장을 잇는 서비스 구조와 일방향 매장 동선, 유저 플로우를 설계했어요.'],
              ['디자인', '모바일·키오스크·매장 디스플레이·직원용 화면을 만들고, 재고와 대기 현황은 상태 문구 대신 숫자로 안내했어요.'],
              ['브랜딩', '창작 캐릭터 키토를 직접 그리고, 크리스마스 시즌 이벤트와 SNS 홍보물까지 확장했어요.']],
      result: ['QR 주문 → 카카오톡 알림 → 픽업으로 결제줄 분산', '키오스크 전용 교환매칭과 구역별 교환 디스플레이', '바코드 스캔 한 번으로 끝나는 퇴장 · QR 스탬프 투어'],
      metrics: [['페르소나', '3명'], ['서비스 채널', '4개'], ['시즌 이벤트', '5종']],
      learned: '화면을 그리기 전에 매장 동선과 운영 방식부터 설계해야 서비스가 자연스럽게 이어진다는 것을 배웠어요. 블루투스 → QR 체크인 → 키오스크 전용으로 교환 방식을 여러 번 바꾸며, 기술 제약과 악용 가능성까지 고려하는 설계의 중요성을 느꼈어요.', links: [
      ['포트폴리오 PDF 보기', 'https://inmoonmi.github.io/portfolio/kitto.pdf', 'primary'],
      ['Figma 프로토타입', 'https://www.figma.com/design/EaEModOtv7Yzc7nkHqY9VT/%EC%B0%BD%EC%9E%91_%ED%8C%9D%EC%97%85%EC%8A%A4%ED%86%A0%EC%96%B4?node-id=0-1&t=jef47sdQ8LpKANPd-1', 'secondary'],
      ],},

    { id: 'p1', cat: 'promotion', title: '학과 학생회 · 행사 기획과 SNS 콘텐츠', year: '2021–2023', role: '보도국 일원 → 보도국장',
      period: '2021 – 2023 (2년)', team: '학생회 보도국 · 팀원 관리(보도국장 시기)',
      summary: '온라인 행사 기획부터 카드뉴스 개편, 학과 신문 발행까지',
      img: '', tools: ['PPT', '미리캔버스', 'Google Slides'],
      problem: '코로나로 온라인과 오프라인이 섞인 행사를 열어야 했고, 학과 콘텐츠가 학생들에게 잘 전달되지 않았어요.',
      goal: '학생들이 직접 참여하게 만드는 행사 구조와, 눈에 들어오는 홍보 콘텐츠 만들기',
      steps: [['아이디어 제안', '온라인 행사에 게이미피케이션 부스 운영을 제안했고, 채택되어 2021 서랑제와 2022 학교 행사에 적용했어요.'],
          ['행사 진행 PPT', '일문인의 밤, 새내기 배움터, 개강총회 등 행사 진행 자료를 6종 제작했어요.'],
          ['카드뉴스 개편', '보도국장으로서 학과 공식 SNS 카드뉴스를 개편하고 참여형 이벤트를 기획했어요.'],
          ['학과 신문 발행', '2021년과 2022년 학과 신문을 발행하고, 연말 신문 제작을 맡았어요.']],
      result: ['게이미피케이션 아이디어 채택 · 2회 적용', '카드뉴스 좋아요 평균 증가', '행사 · 신문 · SNS 콘텐츠 일관 운영'],
      metrics: [['카드뉴스 좋아요(평균)', '11 → 30'], ['행사 진행 PPT', '6종'], ['게이미피케이션 적용', '2회']],
      /* 결과물 목록 : ['제목', '연도', '기여도', '링크(비우면 "준비 중")', '한 줄 설명(선택)']
      ※ 구글 슬라이드는 '보기 전용' 공유로 바꾼 뒤 /preview 주소를 쓰세요. 로그인이 필요한 링크(미리캔버스 등)는 PDF·이미지로 내려받아 assets/ 에 넣고 'assets/파일명.pdf' 로 연결하세요. */
      items: [
    ['2021 온라인 학교 행사 (서랑제) · 게이미피케이션 부스 운영', '2021', '80%', 'https://docs.google.com/presentation/d/1HozH6DD5tslRDcfUiEbxyKey0w95QoBymc08BLN6z7o/preview', '아이디어 제공 · PPT 제작'],
    ['2021 온라인 학과 행사 (일문인의 밤)', '2021', '80%', 'https://docs.google.com/presentation/d/1CRXQOD8Ja_haSmqB5vjaQ_PusTfjQUbdpFKgSr3POIE/preview', '행사 진행 PPT 제작'],
    ['2022 온라인 새내기 배움터', '2022', '90%', 'https://docs.google.com/presentation/d/1uINf04vEAbTBZpWlJ48Wzop3mUa_76S_MoewKbbDriw/preview', '행사 진행 PPT 제작'],
    ['2022 온라인 개강총회', '2022', '90%', 'https://docs.google.com/presentation/d/1eGLE2mtCHZUa9euf-fCbjHhxA0kiQ9S6YcDHWuSNovI/preview', '행사 진행 PPT 제작'],
    ['2022 온라인 학교 행사 · 게이미피케이션 부스 운영', '2022', '70%', 'https://docs.google.com/presentation/d/1kkkCC7qlal-by8k6SzGtmES8dONiK95KbaYOHBQtuIE/preview', 'PPT 제작'],
    ['2022 오프라인 학과 행사 (일문인의 밤)', '2022', '90%', '', '행사 진행 PPT 제작 · assets/ 에 PDF를 넣고 경로를 적어주세요'],
    ['2022 학과 공식 SNS 카드뉴스', '2022', '', '', '카드뉴스 4종 · 이미지/PDF로 내려받아 assets/ 에 넣고 경로를 적어주세요'],
    ['2021 · 2022 학과 신문', '2021–2022', '', '', '발행 2회 · PDF로 변환해 assets/ 에 넣고 경로를 적어주세요 (개인정보 가리기)']
    ],
      learned: '', link: '' }
  ],

  contact: {
    title: '다양한 경험을 차곡차곡 얹어, 함께 일하고 싶은 토스트가 될래요',
    copy: '갓 구운 이야기를 나누러 와 주세요.',
    email: 'inmoonmi@naver.com',
    phone: '010-4581-9814',
    blog: 'blog.yourname.com'
  }
};