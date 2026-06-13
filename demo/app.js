/* ═══════════════════════════════════════════════
   AKOM Demo Walkthrough — app.js
   Vanilla JS: scroll-reveal + smooth nav + live İhbar feed
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── SCROLL REVEAL ─── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  } else {
    // Show everything immediately
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('reveal--visible'));
  }

  /* ─── SMOOTH NAV HIGHLIGHT ─── */
  const navLinks = document.querySelectorAll('.nav__links a');
  const sections = [];
  navLinks.forEach((link) => {
    const id = link.getAttribute('href');
    if (id && id.startsWith('#')) {
      const section = document.querySelector(id);
      if (section) sections.push({ link, section });
    }
  });

  function updateActiveNav() {
    const scrollY = window.scrollY + 120;
    let active = null;
    sections.forEach(({ link, section }) => {
      if (section.offsetTop <= scrollY) active = link;
    });
    navLinks.forEach((l) => {
      l.style.color = l === active ? '#FAFAFA' : '';
      l.style.background = l === active ? 'rgba(255,255,255,0.04)' : '';
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  /* ─── CANLI İHBAR · OLAY AKIŞI ─── */

  const feedEl = document.getElementById('ihbar-feed');
  const activeCountEl = document.getElementById('active-count');
  const totalCountEl = document.getElementById('total-count');

  if (!feedEl) return; // Safety

  // ── Incident data pool ──
  const incidentTypes = [
    { id: 'collapse', label: 'Çöküntü', sym: 'sar', chipClass: 'chip--red', status: 'YENİ' },
    { id: 'fire',     label: 'Yangın',  sym: 'fire', chipClass: 'chip--orange', status: 'YENİ' },
    { id: 'flood',    label: 'Sel',     sym: 'sar', chipClass: 'chip--blue', status: 'YENİ' },
    { id: 'gas',      label: 'Gaz Kaçağı', sym: 'fire', chipClass: 'chip--yellow', status: 'YENİ' },
    { id: 'hazmat',   label: 'HAZMAT',  sym: 'pol', chipClass: 'chip--violet', status: 'YENİ' },
    { id: 'mascal',   label: 'MASCAL',  sym: 'amb', chipClass: 'chip--red', status: 'YENİ' },
    { id: 'collapse2',label: 'Çöküntü', sym: 'k9', chipClass: 'chip--red', status: 'YENİ' },
    { id: 'fire2',    label: 'Yangın',  sym: 'fire', chipClass: 'chip--orange', status: 'YENİ' },
    { id: 'flood2',   label: 'Sel',     sym: 'hems', chipClass: 'chip--blue', status: 'YENİ' },
  ];

  const districts = [
    'Avcılar', 'Bakırköy', 'Zeytinburnu', 'Kadıköy', 'Maltepe',
    'Kartal', 'Pendik', 'Beyoğlu', 'Fatih', 'Üsküdar', 'Beşiktaş',
    'Büyükçekmece', 'Küçükçekmece', 'Bağcılar', 'Bahçelievler',
  ];

  const sources = ['İHBAR-112', 'MOBESE', 'AFAD', 'KRDAE', 'CV'];

  const reports = {
    collapse: [
      '4 katlı bina çöktü, enkaz altında kalanlar var',
      'Bitişik nizam 2 bina ağır hasarlı, tahliye gerekli',
      'Köprü ayağında çökme, yol trafiğe kapandı',
    ],
    fire: [
      'Sanayi bölgesinde büyük çaplı yangın, kimyasal depo riski',
      'Konut yangını üst katlara sıçradı, itfaiye sevk edildi',
      'Akaryakıt istasyonu yakınında yangın ihbarı',
    ],
    flood: [
      'Dere taştı, zemin katları su bastı, 12 kişi mahsur',
      'Viyadük altı su doldu, araçlar mahsur kaldı',
      'Kanalizasyon taşkını, 3 mahallede su baskını',
    ],
    gas: [
      'Doğalgaz hattı patlağı, bölge tahliye ediliyor',
      'Kuvvetli gaz kokusu ihbarı, ekipler sevk edildi',
      'Ana dağıtım hattında basınç kaybı tespit edildi',
    ],
    hazmat: [
      'Kimyasal sızıntı ihbarı, AFAD ekipleri yolda',
      'Endüstriyel tesiste tehlikeli madde döküntüsü',
      'Laboratuvar kazası, biyolojik ajan şüphesi',
    ],
    mascal: [
      'Yüksek katlı binada çok sayıda yaralı, triyaj başlatıldı',
      'Toplu taşıma kazası, 20+ yaralı ihbarı',
      'Stadyum çevresinde izdiham, çoklu yaralı',
    ],
  };

  const statusOrder = ['YENİ', 'ATANDI', 'MÜDAHALE'];
  const statusClassMap = { 'YENİ': 'status--yeni', 'ATANDI': 'status--atandi', 'MÜDAHALE': 'status--mudahale' };

  let rows = [];
  let totalEvents = 0;
  let tickInterval = null;
  let spawnInterval = null;

  // ── Pre-populate with a few static rows ──
  const seedEvents = [
    { typeId: 'collapse', district: 'Avcılar', report: '4 katlı bina çöktü, enkaz altında kalanlar var', source: 'İHBAR-112', status: 'MÜDAHALE', ts: Date.now() - 420000 },
    { typeId: 'fire', district: 'Zeytinburnu', report: 'Sanayi bölgesinde büyük çaplı yangın, kimyasal depo riski', source: 'MOBESE', status: 'ATANDI', ts: Date.now() - 300000 },
    { typeId: 'flood', district: 'Kadıköy', report: 'Dere taştı, zemin katları su bastı, 12 kişi mahsur', source: 'AFAD', status: 'ATANDI', ts: Date.now() - 240000 },
    { typeId: 'gas', district: 'Beyoğlu', report: 'Doğalgaz hattı patlağı, bölge tahliye ediliyor', source: 'KRDAE', status: 'YENİ', ts: Date.now() - 180000 },
    { typeId: 'hazmat', district: 'Üsküdar', report: 'Kimyasal sızıntı ihbarı, AFAD ekipleri yolda', source: 'İHBAR-112', status: 'YENİ', ts: Date.now() - 120000 },
    { typeId: 'mascal', district: 'Fatih', report: 'Yüksek katlı binada çok sayıda yaralı, triyaj başlatıldı', source: 'CV', status: 'YENİ', ts: Date.now() - 60000 },
    { typeId: 'collapse2', district: 'Bakırköy', report: 'Bitişik nizam 2 bina ağır hasarlı, tahliye gerekli', source: 'MOBESE', status: 'ATANDI', ts: Date.now() - 360000 },
  ];

  function findType(typeId) {
    return incidentTypes.find((t) => t.id === typeId) || incidentTypes[0];
  }

  function formatTime(ts) {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec <= 3) return 'şimdi';
    if (diffSec < 60) return diffSec + ' sn önce';
    const min = Math.floor(diffSec / 60);
    if (min < 60) return min + ' dk önce';
    const hr = Math.floor(min / 60);
    return hr + ' sa önce';
  }

  function createRowHTML(event) {
    const type = findType(event.typeId);
    const timeLabel = formatTime(event.ts);
    const statusLower = event.status;
    const statusClass = statusClassMap[statusLower] || 'status--yeni';
    const district = event.district;
    const report = event.report;
    const source = event.source;

    return `
      <div class="ihbar-row">
        <div class="ihbar-row__sym" style="color:${getStatusColor(event.status)}">
          <svg class="sym" aria-hidden="true"><use href="assets/2525d.svg#${type.sym}"/></svg>
        </div>
        <div class="ihbar-row__info">
          <span class="ihbar-row__district">${district}</span>
          <span class="ihbar-row__report">${report}</span>
        </div>
        <span class="ihbar-row__time">${timeLabel}</span>
        <span class="ihbar-row__source">${source}</span>
      </div>`;
  }

  function render() {
    if (!feedEl) return;
    // Keep max 15 rows visible
    const visible = rows.slice(-15);
    feedEl.innerHTML = visible.map((ev, i) => {
      const isNewest = i === visible.length - 1 && ev.status === 'YENİ';
      let html = createRowHTML(ev);
      // Inject status + row class
      const type = findType(ev.typeId);
      const statusClass = statusClassMap[ev.status] || 'status--yeni';
      html = html.replace(
        '<span class="ihbar-row__time">',
        `<span class="ihbar-row__status ${statusClass}">${ev.status}</span><span class="ihbar-row__time">`
      );
      // Add new-row highlight
      if (isNewest) {
        html = html.replace('class="ihbar-row"', 'class="ihbar-row ihbar-row--new"');
      }
      return html;
    }).join('');

    // Re-render time labels live
    const timeEls = feedEl.querySelectorAll('.ihbar-row__time');
    const rowsArr = visible;
    timeEls.forEach((el, i) => {
      if (rowsArr[i]) el.textContent = formatTime(rowsArr[i].ts);
    });

    // Update counters
    const active = rows.filter((r) => r.status === 'YENİ' || r.status === 'ATANDI').length;
    if (activeCountEl) activeCountEl.textContent = active;
    if (totalCountEl) totalCountEl.textContent = totalEvents;
  }

  // ── Status progression ──
  function advanceStatuses() {
    let changed = false;
    rows.forEach((row) => {
      if (row.status === 'YENİ' && Math.random() < 0.3) {
        row.status = 'ATANDI';
        changed = true;
      } else if (row.status === 'ATANDI' && Math.random() < 0.2) {
        row.status = 'MÜDAHALE';
        changed = true;
      }
    });
    if (changed) render();
  }

  // ── Spawn new event ──
  function spawnEvent() {
    const typeId = incidentTypes[Math.floor(Math.random() * incidentTypes.length)].id;
    const type = findType(typeId);
    const district = districts[Math.floor(Math.random() * districts.length)];
    const reportPool = reports[typeId] || reports.collapse;
    const report = reportPool[Math.floor(Math.random() * reportPool.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];

    const event = {
      typeId,
      district,
      report,
      source,
      status: 'YENİ',
      ts: Date.now(),
    };

    rows.push(event);
    totalEvents++;
    render();
  }

  function getStatusColor(status) {
    if (status === 'MÜDAHALE') return '#10B981';
    if (status === 'ATANDI') return '#3B82F6';
    return '#F59E0B';
  }

  // ── Initialize ──
  seedEvents.forEach((ev) => {
    rows.push(ev);
    totalEvents++;
  });
  render();

  // ── Timers ──
  tickInterval = setInterval(() => {
    // Re-render time labels every second
    const timeEls = feedEl.querySelectorAll('.ihbar-row__time');
    const visible = rows.slice(-15);
    timeEls.forEach((el, i) => {
      if (visible[i]) el.textContent = formatTime(visible[i].ts);
    });
  }, 1000);

  spawnInterval = setInterval(() => {
    spawnEvent();
  }, 2500 + Math.random() * 2000); // 2.5–4.5 seconds

  // Status progression every 8 seconds
  setInterval(advanceStatuses, 8000);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(tickInterval);
    clearInterval(spawnInterval);
  });
})();
