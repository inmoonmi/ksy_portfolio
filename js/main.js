/* ============================================================
   Sweet Toast — main.js  (의존성 없는 바닐라 JS)
   ① 콘텐츠 렌더  ② 스크롤 연동 토스트(토스트 = 움직이는 주체)  ③ 잼·토핑 1회 재생
   ④ 탭 필터 / 메뉴판 → 레시피 모달  ⑤ 모바일(아래에서 올라오는) 분기
   ============================================================ */
(function () {
  'use strict';

  var D = window.SITE_DATA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { return t * t * (3 - 2 * t); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqMobile = window.matchMedia('(max-width: 1099px)');

  /* ============================================================
     MOTION SPEC (README의 모션 스펙 노트와 동일한 수치)
     ============================================================ */
  var MOTION = {
    descend: 0.5,          // 토스트가 토스터 슬롯에서 내려오는 속도 (스크롤 1px 당 0.5px, 토스터 기준 상대 이동)
    endScale: 0.6,        // contact(식탁)에 도착했을 때 토스트 배율
    endBottom: 0.86,       // contact에서 토스트 하단이 놓일 뷰포트 높이 비율
    mobile: { top: 66, hold: 0.1, endScale: 0.7, endBottom: 0.7 },   // 모바일: 상단 띠에 고정
    stageAt: [0.6, 0.6, 0.55], // 섹션 top이 뷰포트의 해당 비율 지점을 지나면 단계 진입(잼/토핑 1회 재생)
    jamMs: 1250, dropMs: 1150, dropStagger: 85
  };

  /* ============================================================
     1) 썸네일 일러스트 (이미지가 없을 때 쓰는 손그림 목업)
     ============================================================ */
  function thumb(w) {
    var pal = { web: ['#F8D9D6', '#D94646'], ui: ['#D8DAF2', '#5E5FB0'], promotion: ['#FFD08A', '#E58E1E'], other: ['#CFE5D6', '#55785A'] }[w.cat];
    var alt = /2$/.test(w.id);
    var a = alt ? '#FBE9B7' : pal[0], b = alt ? '#1F4A3A' : pal[1];
    var head = '<svg viewBox="0 0 480 300" preserveAspectRatio="xMidYMid meet" style="background:' + a + '" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="' + a + '"/>';
    var body = '';
    if (w.cat === 'web') {
      var cols = ['#F27B8B', '#F6C75E', '#8DB07A'], cards = '';
      for (var i = 0; i < 3; i++) cards += '<rect x="' + (80 + i * 110) + '" y="174" width="100" height="70" rx="10" fill="#F6EBD3"/><circle cx="' + (100 + i * 110) + '" cy="196" r="9" fill="' + cols[i] + '"/><rect x="' + (116 + i * 110) + '" y="190" width="54" height="7" rx="3.5" fill="#D9C6A0"/><rect x="' + (116 + i * 110) + '" y="204" width="38" height="7" rx="3.5" fill="#E5D6B8"/>';
      body = '<rect x="64" y="38" width="352" height="224" rx="14" fill="#FFFBF0" stroke="#4A2B1E" stroke-width="3"/><circle cx="86" cy="58" r="5" fill="#F27B8B"/><circle cx="104" cy="58" r="5" fill="#F6C75E"/><circle cx="122" cy="58" r="5" fill="#8DB07A"/>' +
        '<rect x="80" y="76" width="320" height="84" rx="10" fill="' + b + '"/><rect x="96" y="92" width="130" height="12" rx="6" fill="#FFF6E6"/><rect x="96" y="112" width="90" height="8" rx="4" fill="#FFF6E6" opacity=".7"/><rect x="96" y="132" width="64" height="18" rx="9" fill="#FFD98A"/>' + cards +
        '<use href="#i-cherry" x="388" y="18" width="46" height="52"/>';
    } else if (w.cat === 'ui') {
      var ph = function (x, y, col) {
        return '<rect x="' + x + '" y="' + y + '" width="124" height="236" rx="22" fill="#FFFBF0" stroke="#4A2B1E" stroke-width="3"/><rect x="' + (x + 44) + '" y="' + (y + 10) + '" width="36" height="7" rx="3.5" fill="#E5D6B8"/><rect x="' + (x + 12) + '" y="' + (y + 32) + '" width="100" height="62" rx="12" fill="' + col + '"/>' +
          [0, 1, 2].map(function (j) { return '<rect x="' + (x + 12) + '" y="' + (y + 108 + j * 40) + '" width="100" height="30" rx="10" fill="#F6EBD3"/><circle cx="' + (x + 28) + '" cy="' + (y + 123 + j * 40) + '" r="7" fill="#FFD98A"/>'; }).join('');
      };
      body = ph(112, 32, b) + ph(246, 52, alt ? '#F6C75E' : '#F27B8B') + '<use href="#i-daisy" x="62" y="40" width="34" height="34" style="color:#fff"/><use href="#i-sparkle" x="404" y="226" width="24" height="24" style="color:#FFF6D8"/>';
    } else if (w.cat === 'promotion') {
      body = '<rect x="168" y="26" width="144" height="248" rx="8" fill="#FFFBF0" stroke="#4A2B1E" stroke-width="3"/><circle cx="240" cy="96" r="42" fill="' + b + '"/><text x="240" y="104" text-anchor="middle" font-size="22" font-weight="800" fill="#FFF6E6" font-family="Fredoka,sans-serif">EVENT</text>' +
        '<rect x="188" y="156" width="104" height="10" rx="5" fill="#4A2B1E"/><rect x="200" y="174" width="80" height="8" rx="4" fill="#C9B193"/><rect x="194" y="214" width="92" height="30" rx="15" fill="#F2A03D"/><text x="240" y="236" text-anchor="middle" font-size="16" font-weight="700" fill="#fff" font-family="Fredoka,sans-serif">JOIN</text>' +
        '<circle cx="98" cy="86" r="42" fill="#fff"/><text x="98" y="86" text-anchor="middle" font-size="26" font-weight="800" fill="#D94646" font-family="Fredoka,sans-serif">20%</text><text x="98" y="108" text-anchor="middle" font-size="15" font-weight="700" fill="#D94646" font-family="Fredoka,sans-serif">SALE</text>' +
        '<use href="#i-cherry" x="352" y="168" width="70" height="78"/><use href="#i-sparkle" x="60" y="200" width="26" height="26" style="color:#FFF6D8"/><use href="#i-sparkle" x="404" y="60" width="22" height="22" style="color:#FFF6D8"/>';
    } else {
      body = '<circle cx="150" cy="120" r="66" fill="#FFFBF0" stroke="#4A2B1E" stroke-width="3"/><text x="150" y="134" text-anchor="middle" font-size="40" font-weight="800" fill="#D94646" font-family="Fredoka,sans-serif">logo</text>' +
        [['#B0322B'], ['#1F4A3A'], ['#F2A03D'], ['#4A3226']].map(function (c, i) { return '<rect x="' + (66 + i * 52) + '" y="214" width="42" height="42" rx="11" fill="' + c[0] + '"/>'; }).join('') +
        '<use href="#i-cup" x="266" y="104" width="170" height="134"/><use href="#i-daisy" x="270" y="40" width="40" height="40" style="color:#fff"/>';
    }
    return head + body + '</svg>';
  }
  function thumbOf(w) { return w.img ? '<img src="' + esc(w.img) + '" alt="' + esc(w.title) + ' 썸네일" loading="lazy">' : thumb(w); }
  /* ============================================================
     2) 콘텐츠 렌더 — 모든 섹션은 "패널(.pn)" = 한 화면 단위로 쪼개짐
        title(1) · no.01 about(2: 프로필/경력/자격증 · 스킬) · no.02 portfolio(1~2) · no.03 contact(1)
     ============================================================ */
  /* 모바일용 잼 : 벡터(SVG) 블롭 — 아무리 길게 늘려도 깨지지 않음 */
  var JAMCOL = { pink: '#F58B9A', berry: '#D9B3DD', apricot: '#F7B35A', matcha: '#BFD4A8' };
  function blob(seed) {
    var n = 14, pts = [], r = function (i) { var x = Math.sin(seed * 97.13 + i * 12.9898) * 43758.5453; return x - Math.floor(x); };
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, k = 0.9 + r(i) * 0.1 - 0.03 * (i % 2);
      pts.push([50 + Math.cos(a) * 50 * k * 1.0, 50 + Math.sin(a) * 50 * k]);
    }
    var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
    for (var m = 0; m < n; m++) {
      var p0 = pts[(m - 1 + n) % n], p1 = pts[m], p2 = pts[(m + 1) % n], p3 = pts[(m + 2) % n];
      d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ',' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
        (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ',' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    return d + 'Z';
  }
  var blobN = 0;
  function pn(id, cls, jam, inner, deco) {
    var key = jam ? jam[0].split('-')[1] : '';
    return '<div class="pn ' + cls + '" data-pn="' + id + '">' +
      (jam ? '<div class="pn-jam ' + jam[1] + '" aria-hidden="true"><img src="assets/' + jam[0] + '" alt="">' +
        '<svg class="jam-m" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="' + blob(++blobN) + '" fill="' + (JAMCOL[key] || '#F58B9A') + '"/></svg></div>' : '') +
      (deco || '') + '<div class="wrap">' + inner + '</div></div>';
  }
  function dc(sym, vb, cls) { return '<svg class="pdeco art ' + cls + '" viewBox="' + vb + '" aria-hidden="true"><use href="#' + sym + '"/></svg>'; }
  var VB = { soda: '-10 -16 140 222', napo: '0 0 260 170', pud: '0 0 140 130', cup: '0 0 140 110', lamp: '0 0 120 150', bq: '0 0 120 160', pr: '0 0 90 170', ch: '0 0 90 100', sp: '0 0 60 100' };

  function renderHero() {
    var h = D.hero;
    $('#hero-title').innerHTML = '<span>' + esc(h.title[0]) + '</span> <span>' + esc(h.title[1]) + '</span>';
    $('#hero-sub').textContent = h.sub;
    $('#hero-role').textContent = h.role;
    $('#hero-cue').textContent = h.cue;
    $('#foot-name').textContent = D.name + ' · ' + D.role;
  }

  function renderAbout() {
    var p = D.profile, i = 0;
    var photo = p.photo ? '<img src="' + esc(p.photo) + '" alt="' + esc(D.name) + ' 프로필 사진">' : '<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="프로필 사진 자리"><use href="#i-avatar"/></svg>';
    var career = D.career.map(function (c) {
      return '<li><span class="dot"></span><div><b class="per">' + esc(c.period) + '</b><strong>' + esc(c.title) + '</strong><p>' + esc(c.desc) + '</p></div></li>';
    }).join('');
    var certs = D.certs.map(function (c) {
      return '<div class="ticket"><span class="ck"><svg class="ic" viewBox="0 0 24 24"><use href="#i-check"/></svg></span><div><strong>' + esc(c.name) + '</strong><span>' + esc(c.org) + '</span></div><time>' + esc(c.date) + '</time></div>';
    }).join('');
    var k = 0;
    var skills = D.skills.map(function (g, gi) {
      var rows = g.items.map(function (it) {
        var ic = it[2] ? '<img src="' + esc(it[2]) + '" alt="">' : '<span>' + esc(it[0].charAt(0)) + '</span>';
        return '<div class="sk"><i class="sk-ic">' + ic + '</i><div class="sk-body"><div class="sk-top"><span>' + esc(it[0]) + '</span><em>' + it[1] + '%</em></div><div class="bar" style="--v:' + (it[1] / 100) + ';--k:' + (k++) + '"><i></i><b></b></div></div></div>';
      }).join('');
      return '<article class="card skill-col rv" style="--i:' + (gi + 1) + ';--r:' + (gi ? .5 : -.5) + 'deg"><i class="tape ' + (gi ? 'y' : 't-l') + '"></i><h3><i><svg class="ic" viewBox="0 0 24 24"><use href="#' + g.icon + '"/></svg></i><span>' + esc(g.title) + '<small>' + esc(g.sub) + '</small></span></h3>' + rows + '</article>';
    }).join('');

    var kws = p.keywords.map(function (x) { return '<li><b>' + esc(x.k) + '</b><span>' + esc(x.d) + '</span></li>'; }).join('');
    var p1 =
      '<header class="sec-head rv" style="--i:' + (i++) + '"><span class="kicker">No.01 — ABOUT ME</span><h2>안녕하세요, 함께하는 즐거움을 구워내는 <em>' + esc(D.name) + '</em>입니다</h2></header>' +
      '<div class="about-grid">' +
      '<article class="card profile rv" style="--i:' + (i++) + '">' +
        '<div class="pf-photo">' + photo + '</div>' +
        '<div class="pf-intro"><h3>' + esc(D.name) + '<small>' + esc(D.role) + '</small></h3>' +
        p.bio.map(function (b) { return '<p class="bio">' + esc(b) + '</p>'; }).join('') +
        (D.resume ? '<a class="btn sm" href="' + esc(D.resume) + '" download>이력서 PDF <svg class="ic" viewBox="0 0 24 24"><use href="#i-down"/></svg></a>' : '') + '</div>' +
        '<div class="kw"><h4>KEYWORDS <small>성격 키워드</small></h4><ul>' + kws + '</ul></div>' +
      '</article>' +
      '<div class="about-side">' +
        '<article class="card career rv" style="--i:' + (i++) + '"><h3 class="t">CAREER <small>경력</small></h3><ul class="timeline">' + career + '</ul></article>' +
        '<article class="card certs rv" style="--i:' + (i++) + '"><h3 class="t">CERTIFICATE <small>자격증</small></h3>' + certs + '</article>' +
      '</div></div>';
    var hobbies = D.hobbies.map(function (h, hi) {
      var ph = h.photo ? '<img src="' + esc(h.photo) + '" alt="' + esc(h.name) + ' 사진" loading="lazy">' : '<svg viewBox="0 0 64 64" aria-hidden="true"><use href="#' + h.icon + '"/></svg>';
      return '<li class="h-item">' + (hi === 0 ? '<span class="sign hobby-sign">HOBBY</span>' : '') + '<span class="h-ph">' + ph + '</span><span class="m-line"><b>' + esc(h.name) + '</b><i class="leader"></i><em>' + esc(h.stat) + '</em></span><p>' + esc(h.desc) + '</p></li>';
    }).join('');
    var p2 =
      '<header class="sec-head rv" style="--i:0"><span class="kicker">No.01 — SKILLS &amp; HOBBY</span><h2>다루는 <em>재료들</em></h2></header>' +
      '<div class="skill-grid">' + skills + '</div>' +
      '<div class="menu-board hobby rv" style="--i:3"><ul class="hobby-grid">' + hobbies + '</ul></div>';

    $('#about').innerHTML =
      pn('about-1', 'pn-about', ['jam-pink-2.png', 'from-r'], p1, dc('i-soda', VB.soda, 'd-a1')) +
      pn('about-2', 'pn-about', ['jam-berry-1.png', 'from-l'], p2, dc('i-bouquet', VB.bq, 'd-a3'));
  }

  var TABS = [['all', 'ALL 전체'], ['web', 'WEB'], ['ui', 'UI'], ['promotion', 'PROMOTION'], ['other', 'OTHER']];
  var LIMIT = 4;
  var tilt = [-1.4, 1, .8, -1, 1.2, -.7, .9, -1.2];

  function cardHTML(w) {
    var n = D.works.indexOf(w);
    return '<li class="m-item pop" data-cat="' + w.cat + '"><button class="m-card" type="button" data-id="' + w.id + '" style="--r:' + tilt[n % tilt.length] + 'deg" aria-haspopup="dialog">' +
      '<i class="tape ' + ['', 'g', 'y'][n % 3] + '"></i><span class="m-thumb">' + thumbOf(w) + '<span class="m-no">No.' + ('0' + (n + 1)).slice(-2) + '</span></span>' +
      '<span class="m-line"><b>' + esc(w.title) + '</b><i class="leader"></i><em>' + esc(w.year) + '</em></span>' +
      '<span class="m-meta"><span class="chip c-' + w.cat + '">' + w.cat.toUpperCase() + '</span><span class="m-desc">' + esc(w.summary) + '</span></span>' +
      '<span class="m-more">레시피 보기 <svg class="ic" viewBox="0 0 24 24"><use href="#i-arrow"/></svg></span></button></li>';
  }

  function renderWork() {
    var tabs = TABS.map(function (t, i) {
      var cnt = t[0] === 'all' ? D.works.length : D.works.filter(function (w) { return w.cat === t[0]; }).length;
      return '<button class="tab" role="tab" type="button" data-cat="' + t[0] + '" aria-selected="' + (i === 0) + '">' + t[1] + ' <span class="n">' + cnt + '</span></button>';
    }).join('');
    var p1 =
      '<header class="sec-head rv" style="--i:0"><span class="kicker">No.02 — PORTFOLIO</span><h2>구워낸 <em>작업물</em></h2></header>' +
      '<div class="menu-board rv" style="--i:1;--r:-.3deg">' +
        '<div class="board-top"><span class="sign">KISSATEN</span><strong>MENU</strong>' +
        '<div class="tabs" role="tablist" aria-label="포트폴리오 카테고리">' + tabs + '</div></div>' +
        '<ul class="menu-grid" id="grid1"></ul>' +
        '<div class="menu-foot"><button class="btn brown" type="button" id="btn-all" aria-expanded="false">전체 보기</button></div>' +
      '</div>';
    var p2 =
      '<div class="menu-board rv" style="--i:0;--r:.3deg">' +
        '<div class="board-top"><span class="sign">KISSATEN</span><strong>MENU 2</strong><em>더 많은 작업들 ♡</em></div>' +
        '<ul class="menu-grid" id="grid2"></ul>' +
        '<div class="menu-foot"><button class="btn brown" type="button" id="btn-less">접기 <svg class="ic" viewBox="0 0 24 24" style="transform:rotate(180deg)"><use href="#i-down"/></svg></button></div>' +
      '</div>';
    $('#work').innerHTML =
      pn('work-1', 'pn-work', ['jam-apricot-1.png', 'from-l'], p1, dc('i-napolitan', VB.napo, 'd-w1')) +
      '<div hidden id="work-2-wrap">' + pn('work-2', 'pn-work', ['jam-apricot-2.png', 'from-r'], p2, dc('i-pudding', VB.pud, 'd-w3') + dc('i-cup', VB.cup, 'd-w4')) + '</div>';
  }

  function renderContact() {
    var c = D.contact;
    var info = [['EMAIL', c.email, 'i-mail', 'copy'], ['PHONE', c.phone, 'i-phone', 'tel:' + c.phone.replace(/[^0-9+]/g, '')],
      ['BLOG', c.blog, 'i-blog', 'https://' + c.blog]].map(function (r) {
      var inner = '<i><svg class="ic" viewBox="0 0 24 24"><use href="#' + r[2] + '"/></svg></i><div><small>' + r[0] + '</small><strong>' + esc(r[1]) + '</strong></div>';
      return r[3] === 'copy' ? '<button type="button" class="c-card" data-copy="' + esc(r[1]) + '" aria-label="이메일 주소 복사">' + inner + '<span class="cp">COPY</span></button>'
        : '<a class="c-card" href="' + esc(r[3]) + '" target="_blank" rel="noopener">' + inner + '</a>';
    }).join('');
    var inner =
      '<header class="sec-head rv" style="--i:0"><span class="kicker">No.03 — CONTACT US</span><h2>' + esc(c.title).replace('프로젝트', '<em>프로젝트</em>') + '</h2><p class="hand">' + esc(c.copy) + '</p></header>' +
      '<div class="contact-cards rv" style="--i:1">' + info + '</div>';
    var table =
      '<div class="table" aria-hidden="true"><div class="cloth"></div>' +
        dc('i-pudding', VB.pud, 'tp t-pud') + dc('i-soda', VB.soda, 'tp t-soda') + '</div>';
    $('#contact').innerHTML = pn('contact', 'pn-contact', null, inner, table + dc('i-lamp', VB.lamp, 'd-lamp l1') + dc('i-lamp', VB.lamp, 'd-lamp r1'));
    var f = $('.footer'); if (f) $('#contact .pn').appendChild(f);   // 푸터를 식탁 하단에 포함 → contact가 문서의 끝(최대 스크롤)
  }

  /* ============================================================
     3) 인터랙션 : 탭 필터 · 전체 보기 · 레시피 모달 · 폼
     ============================================================ */
  var curCat = 'all', expanded = false;

  function applyFilter() {
    var list = D.works.filter(function (w) { return curCat === 'all' || w.cat === curCat; });
    var first = list.slice(0, LIMIT), rest = list.slice(LIMIT);
    var g1 = $('#grid1'), g2 = $('#grid2');
    g1.innerHTML = first.map(cardHTML).join('');
    g2.innerHTML = expanded ? rest.map(cardHTML).join('') : '';
    [g1, g2].forEach(function (g) { $$('.m-item', g).forEach(function (li, n) { li.style.setProperty('--n', n); }); });
    $('#work-2-wrap').hidden = !(expanded && rest.length);
    var btn = $('#btn-all');
    btn.hidden = !(rest.length && !expanded);
    btn.setAttribute('aria-expanded', String(expanded));
    btn.innerHTML = '전체 보기 (' + list.length + ') <svg class="ic" viewBox="0 0 24 24"><use href="#i-down"/></svg>';
    measureSoon();
  }

  var curRecipe = null;
  function updateRecipeHint() {
    var dlg = $('#recipe'), rcIn = dlg.querySelector('.rc-in'), rcBox = dlg.querySelector('.rc');
    if (!rcIn || !rcBox) return;
    rcBox.classList.toggle('more', rcIn.scrollHeight - rcIn.scrollTop - rcIn.clientHeight > 28);
  }

  function openRecipe(id, noHash) {
    var w = D.works.filter(function (x) { return x.id === id; })[0];
    if (!w) return;
    curRecipe = id;
    var idx = D.works.indexOf(w), n = idx + 1, N = D.works.length;
    var dlg = $('#recipe');
    var sec = function (no, ko, en, body) { return '<section class="cs"><h4><b>' + no + '</b>' + ko + '<small>' + en + '</small></h4>' + body + '</section>'; };
    var facts = [['기간', w.period], ['역할', w.role], ['팀', w.team], ['툴', w.tools.join(' · ')]].filter(function (f) { return f[1]; })
      .map(function (f) { return '<div><small>' + f[0] + '</small><b>' + esc(f[1]) + '</b></div>'; }).join('');
    var steps = w.steps.map(function (s) { return '<li><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></li>'; }).join('');
    var kpis = (w.metrics && w.metrics.length) ? '<ul class="kpis">' + w.metrics.map(function (m) { return '<li><b>' + esc(m[1]) + '</b><span>' + esc(m[0]) + '</span></li>'; }).join('') + '</ul>' : '';
    /* 결과물 목록 : w.items = [['제목','연도','기여도(예: 80%)','링크','한 줄 설명(선택)'], …] */
    var safe = function (u) { return /^(https?:\/\/|assets\/|\.\/|#)/i.test(u || '') ? u : ''; };
    var deliv = (w.items && w.items.length) ? '<ul class="deliv">' + w.items.map(function (it) {
      var href = safe(it[3]);
      return '<li><span class="dv-y">' + esc(it[1] || '') + '</span><span class="dv-t"><b>' + esc(it[0]) + '</b>' + (it[4] ? '<small>' + esc(it[4]) + '</small>' : '') + '</span>' +
        (it[2] ? '<span class="dv-s"><small>기여도</small>' + esc(it[2]) + '</span>' : '<span></span>') +
        (href ? '<a class="dv-l" href="' + esc(href) + '" target="_blank" rel="noopener">보기 <svg class="ic" viewBox="0 0 24 24"><use href="#i-arrow"/></svg></a>' : '<span class="dv-l off">준비 중</span>') + '</li>';
    }).join('') + '</ul>' : '';
    var no = 1, nn = function () { return ('0' + (no++)).slice(-2); };
    dlg.innerHTML =
      '<div class="rc"><button class="rc-close" type="button" aria-label="닫기"><svg class="ic" viewBox="0 0 24 24"><use href="#i-x"/></svg></button><div class="rc-in">' +
      '<p class="no">CASE STUDY No.' + ('0' + n).slice(-2) + ' · ' + w.cat.toUpperCase() + ' · ' + esc(w.year) + '</p><h3>' + esc(w.title) + '</h3><p class="sub">' + esc(w.summary) + '</p>' +
      '<div class="thumb">' + thumbOf(w) + '</div>' +
      '<div class="facts">' + facts + '</div>' +
      sec(nn(), '문제', 'PROBLEM', '<p class="lead">' + esc(w.problem || '') + '</p>' + (w.goal ? '<p class="goal"><b>목표</b>' + esc(w.goal) + '</p>' : '')) +
      sec(nn(), '과정', 'PROCESS', '<ol class="steps">' + steps + '</ol>') +
      (deliv ? sec(nn(), '결과물', 'DELIVERABLES', deliv) : '') +
      sec(nn(), '결과', 'RESULT', kpis + '<ul class="res">' + w.result.map(function (r) { return '<li><svg class="ic" viewBox="0 0 24 24"><use href="#i-check"/></svg>' + esc(r) + '</li>'; }).join('') + '</ul>') +
      (w.learned ? '<p class="note"><b>배운 점</b>' + esc(w.learned) + '</p>' : '') +
      '<div class="actions"><a class="btn" href="' + esc(w.link || '#') + '" target="_blank" rel="noopener">프로젝트 보러가기 <svg class="ic" viewBox="0 0 24 24"><use href="#i-arrow"/></svg></a>' +
      '<button class="btn ghost" type="button" data-step="-1" aria-label="이전 프로젝트">← 이전</button><button class="btn ghost" type="button" data-step="1" aria-label="다음 프로젝트">다음 →</button></div></div>' +
      '<button class="rc-hint" type="button" aria-label="아래로 스크롤"><span>아래로 스크롤</span><svg class="ic" viewBox="0 0 24 24"><use href="#i-arrow"/></svg></button></div>';
    var rcIn = dlg.querySelector('.rc-in');
    rcIn.scrollTop = 0;
    rcIn.addEventListener('scroll', updateRecipeHint, { passive: true });
    rcIn.addEventListener('load', updateRecipeHint, true);
    if (!dlg.open) { if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', ''); }
    rcIn.setAttribute('tabindex', '-1'); rcIn.focus({ preventScroll: true });
    updateRecipeHint();
    requestAnimationFrame(updateRecipeHint);
    if (!noHash && history.replaceState) history.replaceState(null, '', '#recipe-' + id);
  }

  var noteT = 0;
  function notice(t) {
    var el = $('#notice'); if (!el) { el = document.createElement('div'); el.id = 'notice'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = t; el.classList.add('on'); clearTimeout(noteT); noteT = setTimeout(function () { el.classList.remove('on'); }, 1900);
  }

  function goTo(id) {
    var t = $(id); if (!t) return;
    var y = id === '#hero' ? 0 : t.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
  }

  function bindUI() {
    $('.tabs').addEventListener('click', function (e) {
      var b = e.target.closest('.tab'); if (!b) return;
      curCat = b.dataset.cat;
      $$('.tab').forEach(function (t) { t.setAttribute('aria-selected', t === b); });
      applyFilter();
    });
    $('#btn-all').addEventListener('click', function () {
      expanded = true; applyFilter();
      setTimeout(function () { goTo('#work-2-wrap'); }, 80);
    });
    $('#btn-less').addEventListener('click', function () { expanded = false; applyFilter(); goTo('#work'); });
    $('#work').addEventListener('click', function (e) {
      var c = e.target.closest('.m-card'); if (c) openRecipe(c.dataset.id);
    });
    var dlg = $('#recipe');
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('.rc-close')) { dlg.close(); return; }
      if (e.target.closest('.rc-hint')) {
        var rcIn = dlg.querySelector('.rc-in');
        rcIn.scrollBy({ top: rcIn.clientHeight * 0.8, behavior: reduce ? 'auto' : 'smooth' });
        return;
      }
      var st = e.target.closest('[data-step]');
      if (st) { var N = D.works.length, i = (D.works.findIndex(function (x) { return x.id === curRecipe; }) + (+st.dataset.step) + N) % N; openRecipe(D.works[i].id); }
    });
    window.addEventListener('resize', updateRecipeHint);
    dlg.addEventListener('close', function () { curRecipe = null; if (history.replaceState) history.replaceState(null, '', location.pathname + location.search); });
    document.addEventListener('click', function (e) {
      var cp = e.target.closest('[data-copy]');
      if (cp) {
        var v = cp.dataset.copy;
        (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(function () { notice('이메일 주소를 복사했어요 ✓'); }, function () { window.location.href = 'mailto:' + v; });
        return;
      }
      var a = e.target.closest('a[href^="#"]'); if (!a) return;
      var id = a.getAttribute('href'); if (id.length < 2 || !$(id)) return;
      e.preventDefault(); goTo(id);
    });
  }

  /* ============================================================
     4) 스크롤 엔진 : 토스트 = 움직이는 주체
        ① 토스터 슬롯에서 수직으로 내려옴 + 노릇하게 구워짐
        ② 완전히 나온 뒤 → contact(식탁)까지 일정한 속도로 계속 아래로 이동 (좌우 이동 없음)
     ============================================================ */
  var toast = $('#toast'), tbody = $('.toast-body'), hot = $('.toast-hot');
  var jams = { a: $('.jam-a'), b: $('.jam-b') };
  var knife = $('.knife');
  var M = { vw: 0, vh: 0, mobile: false, tw: 0, th: 0, slotY: 0, sFull: 0, C: 1, stageAt: [1e9, 1e9, 1e9], Tc1: 0, Tend: 0, secY: [0, 0, 0, 0] };
  var secs = { about: $('#about'), work: $('#work'), contact: $('#contact') };
  var railLis = $$('.rail li'), heroEl = $('#hero');

  var mTimer = 0;
  function measureSoon() { clearTimeout(mTimer); mTimer = setTimeout(measure, 60); }

  function measure() {
    var sy = window.pageYOffset;
    M.vw = window.innerWidth; M.vh = window.innerHeight; M.mobile = mqMobile.matches;
    M.tw = toast.offsetWidth; M.th = toast.offsetHeight;
    var back = $('.toaster-back').getBoundingClientRect();
    M.slotY = sy + back.top + back.height * 0.5;
    var A = secs.about.getBoundingClientRect().top + sy,
        W = secs.work.getBoundingClientRect().top + sy,
        C = secs.contact.getBoundingClientRect().top + sy;
    M.secY = [0, A, W, C]; M.C = C;
    var vh = M.vh;
    M.Tc1 = M.mobile ? MOTION.mobile.top : (vh - M.th) / 2 + 22;
    M.sFull = M.slotY - M.Tc1;                           // 토스트가 토스터에서 완전히 나온 스크롤 위치
    M.Tend = MOTION.endBottom * vh - M.th * MOTION.endScale;
    if (M.mobile) {
      M.Tcm = vh * MOTION.mobile.hold;
      M.Tend = MOTION.mobile.endBottom * vh - M.th * MOTION.mobile.endScale;
      M.sHold = Math.max(0, M.slotY - M.vh * 0.8) + M.vh * 0.75 + 0.01 * vh;   // 식빵이 다 나온 직후부터 contact까지 이동
      M.sHold = Math.min(M.sHold, M.C - vh);
    }
    M.stageAt = [Math.max(A - MOTION.stageAt[0] * vh, M.sFull + 0.15 * vh), W - MOTION.stageAt[1] * vh, C - MOTION.stageAt[2] * vh];
    if (M.mobile) {   // 모바일 : no.01 첫 화면에서는 아직 잼 없음 → no.01 → no.01-1 사이에 딸기잼
      var a2 = secs.about.querySelectorAll('.pn')[1];
      if (a2) M.stageAt[0] = a2.getBoundingClientRect().top + sy - MOTION.stageAt[0] * vh;
    }
    document.documentElement.style.setProperty('--band-h', (MOTION.mobile.top + M.th + 34) + 'px');
    document.documentElement.style.setProperty('--tw-end', (M.tw * MOTION.endScale).toFixed(0) + 'px');
    document.documentElement.style.setProperty('--th', M.th + 'px');
    last.key = '';
    frame(true);
  }

  var last = { lv: -1, key: '', clip: '', tf: '', rot: 0, hot: -1, sec: -1 };
  var mobHeat = 0, lastS = window.pageYOffset, vel = 0, rotCur = 0;

  function frame(force) {
    var s = window.pageYOffset;
    var dv = s - lastS; lastS = s; vel += (dv - vel) * 0.2;

    var q, S, top, clipPx, vis;
    if (M.mobile) {
      // 모바일: 슬롯에서 식빵이 나온 뒤 → 내용 뒤(배경)에서 화면 중간에 머물다 → contact 그릇 위로 내려옴
      var s0 = Math.max(0, M.slotY - M.vh * 0.8), p = clamp((s - s0) / Math.max(1, M.vh * 0.75), 0, 1), e = smooth(p);
      var topDoc = M.slotY - M.th + (M.th + 24) * e;
      q = clamp((s - M.sHold) / Math.max(1, M.C - M.sHold), 0, 1);
      S = lerp(1, MOTION.mobile.endScale, q);
      top = Math.max(M.Tcm, topDoc - s) + (M.Tend - M.Tcm) * q;
      clipPx = (M.slotY - s - top) / S;
      vis = clipPx < M.th - 2 && top + M.th > -40;
      mobHeat = e * 0.96;
    } else {
      // ② 완전히 나온 뒤의 진행도 q : 0(중앙) → 1(contact 식탁, contact 위치에 닿으면 고정)
      q = clamp((s - M.sFull) / Math.max(1, M.C - M.sFull), 0, 1);
      S = lerp(1, MOTION.endScale, q);
      // ① 토스터 기준으로 천천히 내려오는 위치 (슬롯 라인으로 clip-path 마스킹)
      var top1 = M.slotY - M.th - (1 - MOTION.descend) * s;
      top = Math.max(M.Tc1, top1) + (M.Tend - M.Tc1) * q;
      clipPx = (M.slotY - s - top) / S;
      vis = clipPx < M.th - 2;
    }

    var tf = 'translate3d(0,' + top.toFixed(1) + 'px,0) translateX(-50%) scale(' + S.toFixed(4) + ')';
    if (tf !== last.tf) { toast.style.transform = tf; last.tf = tf; }
    var clip = clipPx > 0.5 ? 'inset(' + clipPx.toFixed(1) + 'px -60% -60% -60%)' : 'none';
    if (clip !== last.clip) { toast.style.clipPath = clip; last.clip = clip; }
    toast.style.visibility = vis ? 'visible' : 'hidden';

    // 노릇하게 구워짐 : 슬롯이 뷰포트 아래에서 토스트 상단까지 올라오는 동안 0 → 1
    var tProg = clamp((s - (M.slotY - M.vh)) / Math.max(1, M.vh - M.Tc1), 0, 1);
    var heat = M.mobile ? mobHeat : smooth(tProg) * 0.96;
    if (Math.abs(heat - last.hot) > 0.004) { hot.style.opacity = heat.toFixed(3); last.hot = heat; }

    // 속도 기반의 말랑한 기울기 + 잔잔한 흔들림
    var rt = reduce ? 0 : clamp(vel * 0.07, -4.5, 4.5) + Math.sin(s * 0.0042) * 1.1;
    rotCur += (rt - rotCur) * 0.14;
    if (Math.abs(rotCur - last.rot) > 0.01) { tbody.style.transform = 'rotate(' + rotCur.toFixed(2) + 'deg)'; last.rot = rotCur; }

    // 좌측 레일 : 현재 섹션
    var cur = 0, ref = s + M.vh * 0.5;
    for (var i = 1; i < 4; i++) if (ref >= M.secY[i]) cur = i;
    if (s + M.vh >= document.documentElement.scrollHeight - 4) cur = 3;
    if (cur !== last.sec) {
      last.sec = cur;
      railLis.forEach(function (li, k) { li.classList.toggle('on', k === cur); k === cur ? li.firstElementChild.setAttribute('aria-current', 'true') : li.firstElementChild.removeAttribute('aria-current'); });
    }
    document.body.classList.toggle('scrolled', s > 120);
    var lv = clamp(s / Math.max(1, M.sFull * 0.6), 0, 1);
    if (Math.abs(lv - last.lv) > 0.004) { heroEl.style.setProperty('--lv', lv.toFixed(3)); last.lv = lv; }

    var st = s >= M.stageAt[2] ? 3 : s >= M.stageAt[1] ? 2 : s >= M.stageAt[0] ? 1 : 0;
    setStage(st, !!force && !started);
  }

  /* ---------- 단계 전환 : 잼 / 토핑은 "1회 재생" ---------- */
  var stage = -1, played = {}, started = false;
  function setStage(n, instant) {
    if (n === stage) return;
    var prev = stage; stage = n;
    document.body.dataset.stage = n;
    if (n > prev) { for (var k = Math.max(prev + 1, 1); k <= n; k++) enter(k, !instant && k === n); }
    else { for (var j = prev; j > n; j--) leave(j); }
  }
  function enter(k, animate) {
    var first = !played[k]; played[k] = true;
    var anim = animate && first && !reduce;
    if (k === 1) paintJam('a', 'rtl', anim);
    if (k === 2) paintJam('b', 'ltr', anim);
    if (k === 3) dropToppings(anim);
  }
  function leave(k) {
    if (k === 1) jams.a.classList.remove('on');
    if (k === 2) jams.b.classList.remove('on');
    if (k === 3) resetToppings();
  }


  var running = {};
  function tween(ms, fn, ease) {
    return new Promise(function (res) {
      var t0 = performance.now(); ease = ease || easeOut;
      (function step(now) { var t = clamp((now - t0) / ms, 0, 1); fn(ease(t), t); if (t < 1) requestAnimationFrame(step); else res(); })(t0);
    });
  }

  /* 잼 바르기 : 칼이 지나가며 clip-path가 열리는 느낌 (데스크톱: 옆에서 / 모바일: 아래에서 위로) */
  function paintJam(key, dir, animate) {
    var el = jams[key];
    var token = (running[key] = (running[key] || 0) + 1);
    el.classList.add('on');
    knife.style.setProperty('--jam', key === 'a' ? 'var(--jam-pink)' : 'var(--jam-apricot)');
    if (!animate) { el.style.clipPath = 'none'; return; }
    var mode = M.mobile ? 'btt' : dir;
    knife.style.opacity = 1;
    tween(MOTION.jamMs, function (p) {
      if (token !== running[key]) return;
      var inv = ((1 - p) * 100).toFixed(1) + '%';
      var wob = Math.sin(p * Math.PI * 5) * 5;
      if (mode === 'rtl') {
        el.style.clipPath = 'inset(0 0 0 ' + inv + ')';
        knife.style.left = lerp(104, -2, p) + '%'; knife.style.top = (52 + wob) + '%';
        knife.style.transform = 'translate(-2%,-50%) rotate(-10deg) scaleX(-1)';
      } else if (mode === 'ltr') {
        el.style.clipPath = 'inset(0 ' + inv + ' 0 0)';
        knife.style.left = lerp(-4, 102, p) + '%'; knife.style.top = (52 + wob) + '%';
        knife.style.transform = 'translate(-98%,-50%) rotate(10deg)';
      } else {
        el.style.clipPath = 'inset(' + inv + ' 0 0 0)';
        knife.style.left = (50 + wob) + '%'; knife.style.top = lerp(108, 12, p) + '%';
        knife.style.transform = 'translate(-98%,-50%) rotate(-80deg)';
      }
    }, function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }).then(function () {
      if (token !== running[key]) return;
      el.style.clipPath = 'none';
      knife.style.transition = 'opacity .4s'; knife.style.opacity = 0;
      setTimeout(function () { knife.style.transition = ''; }, 450);
    });
  }

  /* 토핑 : 정해진 영역(토스트 위)으로 과일이 쏟아져 내림 */
  var TOP = [
    // [symbol, viewBox, x%, y%, width%, rotate]  — 종류별 2개씩 (체리만 1개)
    ['f-kiwi', '0 0 84 84', 69, 78, 15, 10], ['f-kiwi', '0 0 84 84', 24, 70, 13, -14],
    ['f-orange', '0 0 96 56', 49, 82, 18, 4], ['f-orange', '0 0 96 56', 79, 64, 15, -26],
    ['f-berry', '0 0 84 94', 23, 44, 14, -22], ['f-berry', '0 0 84 94', 77, 44, 14, 20],
    ['f-cream', '0 0 130 110', 42, 33.5, 26, -4], ['f-cream', '0 0 130 110', 58, 32.5, 26, 5],
    ['f-blue', '0 0 44 44', 30, 26, 5.5, 0], ['f-blue', '0 0 44 44', 70, 27, 5.5, 20],
    ['f-mint', '0 0 76 50', 44, 19.5, 11, -32], ['f-mint', '0 0 76 50', 57, 19.5, 11, 24],
    ['f-cherry', '0 0 64 84', 50.5, 17.5, 10, -4]
  ];
  var fxEls = [];
  function buildToppings() {
    var box = $('#toppings'), html = '';
    TOP.forEach(function (t) {
      html += '<svg class="fx" viewBox="' + t[1] + '" style="left:' + t[2] + '%;top:' + t[3] + '%;width:' + t[4] + '%;--r:' + t[5] + 'deg" data-r="' + t[5] + '"><use href="#' + t[0] + '"/></svg>';
    });
    box.innerHTML = html; fxEls = $$('.fx', box);
  }
  function dropToppings(animate) {
    fxEls.forEach(function (el, i) {
      var r = +el.dataset.r;
      el.style.opacity = 1;
      if (!animate) return;
      var base = 'translate(-50%,-50%) ';
      var f = function (y, rot) { return { transform: base + 'translateY(' + y + ') rotate(' + rot + 'deg)' }; };
      var frames = [
        Object.assign(f('-135vh', r - 80 + (i % 3) * 40), { offset: 0, easing: 'cubic-bezier(.5,0,.9,.55)' }),
        Object.assign(f('0px', r), { offset: 0.58, easing: 'cubic-bezier(.2,.6,.4,1)' }),
        Object.assign(f('-9%', r + (i % 2 ? 4 : -4)), { offset: 0.76, easing: 'cubic-bezier(.5,0,.9,.55)' }),
        Object.assign(f('0px', r), { offset: 0.9, easing: 'cubic-bezier(.2,.6,.4,1)' }),
        Object.assign(f('-2%', r), { offset: 0.955, easing: 'ease-in' }),
        Object.assign(f('0px', r), { offset: 1 })
      ];
      el.animate(frames, { duration: MOTION.dropMs, delay: i * MOTION.dropStagger, fill: 'backwards' });
    });
  }
  function resetToppings() { fxEls.forEach(function (el) { el.getAnimations().forEach(function (a) { a.cancel(); }); el.style.opacity = 0; }); }


  /* ============================================================
     화면 페이징 : 휠/키보드로 "한 화면씩" 부드럽게 넘어가기 (데스크톱)
     - 패널 사이 간격(≥300px) 동안 토스트가 내려오는 모습이 보여요
     - 패널이 화면보다 길면 그 안에서는 일반 스크롤, 끝에 닿으면 다음 화면으로
     - 모달/입력창/모바일/JS 실패 시에는 일반 스크롤 그대로
     ============================================================ */
  var Pg = { busy: false, last: 0, locked: false, raf: 0 };
  function pgActive() { return !mqMobile.matches; }
  function pgTargets() {
    var sy = window.pageYOffset, max = document.documentElement.scrollHeight - window.innerHeight;
    var t = [0];
    $$('.pn').forEach(function (p) { if (p.offsetHeight) t.push(Math.round(p.getBoundingClientRect().top + sy)); });
    t.push(max);
    return t.filter(function (v, i, a) { return v <= max && a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
  }
  function pgInner(dir) {            // 현재 패널이 화면보다 길어서 안쪽 스크롤이 남아 있으면 true
    var y = window.pageYOffset, vh = window.innerHeight, hit = false;
    $$('.pn').forEach(function (p) {
      if (!p.offsetHeight) return;
      var r = p.getBoundingClientRect(), top = r.top + y, bot = top + r.height;
      if (dir > 0 && top <= y + 2 && bot > y + vh + 6) hit = true;
      if (dir < 0 && bot >= y + vh - 2 && top < y - 6) hit = true;
    });
    return hit;
  }
  function pgGo(to) {
    var from = window.pageYOffset, dist = Math.abs(to - from);
    if (reduce || dist < 2) { window.scrollTo(0, to); return; }
    var dur = clamp(dist * 0.75, 700, 1700), t0 = performance.now();
    Pg.busy = true; cancelAnimationFrame(Pg.raf);
    (function step(now) {
      var t = clamp((now - t0) / dur, 0, 1), e = 0.5 - Math.cos(Math.PI * t) / 2;   // easeInOutSine : 일정하게 흐르는 속도
      window.scrollTo(0, from + (to - from) * e);
      if (t < 1) Pg.raf = requestAnimationFrame(step); else Pg.busy = false;
    })(t0);
  }
  function pgStep(dir) {
    var y = Math.round(window.pageYOffset), t = pgTargets(), to = null, i;
    if (dir > 0) { for (i = 0; i < t.length; i++) if (t[i] > y + 2) { to = t[i]; break; } }
    else { for (i = t.length - 1; i >= 0; i--) if (t[i] < y - 2) { to = t[i]; break; } }
    if (to !== null) pgGo(to);
  }
  function bindPaging() {
    window.addEventListener('wheel', function (e) {
      if (!pgActive() || e.ctrlKey || $('#recipe').open || (e.target.closest && e.target.closest('textarea'))) return;
      var dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0; if (!dir || Math.abs(e.deltaY) < 4) return;
      var now = performance.now(), quiet = now - Pg.last > 160; Pg.last = now;
      if (Pg.busy) { e.preventDefault(); return; }
      if (pgInner(dir)) { Pg.locked = false; return; }               // 긴 패널 안쪽은 일반 스크롤
      if (Pg.locked && !quiet) { e.preventDefault(); return; }       // 관성 스크롤의 꼬리는 무시
      e.preventDefault(); Pg.locked = true; pgStep(dir);
    }, { passive: false });
    window.addEventListener('keydown', function (e) {
      if (!pgActive() || $('#recipe').open || e.altKey || e.ctrlKey || e.metaKey) return;
      var tg = e.target && e.target.tagName; if (/INPUT|TEXTAREA|SELECT|BUTTON|A/.test(tg || '') && e.key !== 'PageDown' && e.key !== 'PageUp') return;
      var k = e.key, dir = (k === 'PageDown' || k === 'ArrowDown' || (k === ' ' && !e.shiftKey)) ? 1 : (k === 'PageUp' || k === 'ArrowUp' || (k === ' ' && e.shiftKey)) ? -1 : 0;
      if (k === 'Home') { e.preventDefault(); pgGo(0); return; }
      if (k === 'End') { e.preventDefault(); pgGo(document.documentElement.scrollHeight - window.innerHeight); return; }
      if (!dir || pgInner(dir)) return;
      e.preventDefault(); if (!Pg.busy) pgStep(dir);
    });
  }

  /* ============================================================
     5) 시작
     ============================================================ */
  function revealObserver() {
    var ps = $$('.pn');
    if (!('IntersectionObserver' in window)) { ps.forEach(function (p) { p.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.15 });
    ps.forEach(function (p) { io.observe(p); });
    var wrap = $('#work-2-wrap');   // 숨김 패널이 열릴 때도 감지되도록 재관찰
    new MutationObserver(function () { if (!wrap.hidden) { var p = wrap.firstElementChild; if (!p.classList.contains('in')) io.observe(p); } }).observe(wrap, { attributes: true, attributeFilter: ['hidden'] });
  }

  function loop() { frame(false); requestAnimationFrame(loop); }

  function init() {
    renderHero(); renderAbout(); renderWork(); renderContact();
    buildToppings(); bindUI(); bindPaging(); applyFilter(); revealObserver();
    var hm = /^#recipe-(\w+)/.exec(location.hash); if (hm) openRecipe(hm[1], true);
    document.documentElement.classList.add('no-anim');
    measure();
    started = false;
    frame(true);                       // 새로고침 위치에 맞춰 이전 단계들을 즉시 적용
    started = true;
    requestAnimationFrame(function () { requestAnimationFrame(function () { document.documentElement.classList.remove('no-anim'); }); });
    window.addEventListener('resize', measureSoon);
    window.addEventListener('load', measureSoon);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureSoon);
    if (window.ResizeObserver) new ResizeObserver(measureSoon).observe($('main'));
    mqMobile.addEventListener && mqMobile.addEventListener('change', measureSoon);
    requestAnimationFrame(loop);
  }
  init();
})();