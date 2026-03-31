// ==================== CONFIG ====================
// Netlify Functions endpointlari
const API = {
  projects:   '/api/projects',
  sendOtp:    '/api/send-otp',
  verifyOtp:  '/api/verify-otp',
  vote:       '/api/vote'
};

// ==================== LOYIHALAR (local fallback) ====================
const localProjects = [
  { id:1, icon:'🏗️', category:'Infrastruktura', filter:'infrastructure', name:"Kósheni rawajlandırıw", desc:"Shımbay rayonındaǵı tiykarǵı kóshelerdı zámanagóy órtewler menen tólewlew hám jarıtıw sistemasın keńeytiw.", votes:312, maxVotes:500, color:'#6C3FF5' },
  { id:2, icon:'🌳', category:'Ekologiya', filter:'ecology', name:"Jasıl park qurıw", desc:"Nókis qalasında 2 gektarlıq aymaqta zámanagóy dem alıs bagın barpo etiw.", votes:278, maxVotes:500, color:'#22C55E' },
  { id:3, icon:'📚', category:"Bilimlendiriw", filter:'education', name:"Mektep kitebanasın modernizatsiyalaw", desc:"34-mektep kitebanasına zámanagóy kompyuterler, elektron resurslar hám jańa kitaplar qosıw.", votes:445, maxVotes:500, color:'#F59E0B' },
  { id:4, icon:'🏥', category:"Sálametliklendiriw", filter:'health', name:"Poliklinika abzallandırıw", desc:"5-qala poliklinikasına zámanagóy medicinlıq qurallar satıp alıw hám shipakerler shifasın asırıw.", votes:389, maxVotes:500, color:'#EF4444' },
  { id:5, icon:'💧', category:'Infrastruktura', filter:'infrastructure', name:"Ishimilik suw sisteması", desc:"Beruniy rayonındaǵı 3 mahallede jańa suw taminatı qubırların salıw.", votes:201, maxVotes:500, color:'#00D2FF' },
  { id:6, icon:'🎭', category:"Bilimlendiriw", filter:'education', name:"Jaslar oraylın ashıw", desc:"Qońırat rayonında sport, óner hám texnologiya úyirmelerin ózinde jámlegen jaslar orayın tashkil etiw.", votes:356, maxVotes:500, color:'#8B63FF' }
];

// ==================== STATE ====================
let projects = [...localProjects];
let isLoggedIn = false;
let currentUser = null;      // { phone, name }
let otpToken = null;         // Netlify Function dan kelgan token
let timerInterval = null;
let currentFilter = 'all';
let userVotes = new Set();
let selectedProject = null;

// ==================== SESSION (localStorage) ====================
function restoreSession() {
  try {
    const s = JSON.parse(localStorage.getItem('ab_session') || 'null');
    if (s?.phone && s?.loggedIn) {
      isLoggedIn = true;
      currentUser = s;
      userVotes = new Set(s.votes || []);
      updateLoginButton();
    }
  } catch {}
}
function saveSession() {
  if (currentUser) {
    localStorage.setItem('ab_session', JSON.stringify({ ...currentUser, loggedIn: true, votes: [...userVotes] }));
  }
}

// ==================== API CALLS ====================
async function apiPost(url, data) {
  const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
  return r.json();
}
async function apiGet(url) {
  const r = await fetch(url);
  return r.json();
}

async function loadProjects() {
  try {
    const res = await apiGet(API.projects);
    if (res.success && res.data) projects = res.data;
  } catch { /* local fallback */ }
}

// ==================== DOM ====================
const navbar   = document.getElementById('navbar');
const modalOv  = document.getElementById('modalOverlay');
const voteOv   = document.getElementById('voteModalOverlay');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

// ==================== NAVBAR ====================
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  updateActiveLink();
});
function updateActiveLink() {
  ['hero','about','results'].forEach(id => {
    const el = document.getElementById(id);
    const lk = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!el || !lk) return;
    const y = window.scrollY + 120;
    if (y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      lk.classList.add('active');
    }
  });
}
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
document.addEventListener('click', e => { if (!navbar.contains(e.target)) navLinks.classList.remove('open'); });

// ==================== COUNTER ANIMATION ====================
const cObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.target, step = Math.ceil(target/60);
    let cur = 0;
    const iv = setInterval(() => { cur = Math.min(cur+step, target); el.textContent = cur.toLocaleString(); if (cur >= target) clearInterval(iv); }, 25);
    cObserver.unobserve(el);
  });
}, { threshold: 0.3 });
document.querySelectorAll('.stat-number[data-target]').forEach(el => cObserver.observe(el));

// ==================== PROJECTS ====================
function renderProjects(filter = 'all') {
  const grid = document.getElementById('projectsGrid');
  const list = filter === 'all' ? projects : projects.filter(p => p.filter === filter);

  if (!list.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text3)"><div style="font-size:48px;margin-bottom:16px">😕</div><p>Bul kategoriyada joba tabılmadı</p></div>`;
    return;
  }

  grid.innerHTML = list.map((p, i) => {
    const pct = Math.round((p.votes / (p.maxVotes||500)) * 100);
    const voted = userVotes.has(p.id);
    return `
    <div class="project-card" data-id="${p.id}" style="animation:fadeInUp .45s ease both;animation-delay:${i*0.07}s">
      <div class="project-card-top">
        <div class="project-icon">${p.icon||'🏗️'}</div>
        <span class="project-category">${p.category}</span>
      </div>
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="project-vote-bar">
        <div class="vote-bar-labels"><span>${p.votes} dawıs</span><span>${pct}%</span></div>
        <div class="vote-bar-track"><div class="vote-bar-fill" style="width:0%;background:linear-gradient(90deg,${p.color||'#6C3FF5'},${p.color||'#6C3FF5'}99)" data-w="${pct}%"></div></div>
      </div>
      <div class="project-card-footer">
        <span class="vote-count-badge">${p.votes} dawıs</span>
        <button class="vote-now-btn${voted?' voted':''}" data-id="${p.id}">${voted?'✅ Dawıs berildi':'Dawıs beriw'}</button>
      </div>
    </div>`;
  }).join('');

  setTimeout(() => document.querySelectorAll('.vote-bar-fill').forEach(b => b.style.width = b.dataset.w), 120);

  document.querySelectorAll('.vote-now-btn').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); handleVote(+b.dataset.id); }));
  document.querySelectorAll('.project-card').forEach(c => c.addEventListener('click', () => handleVote(+c.dataset.id)));
}

// Filter
document.querySelectorAll('.filter-btn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    currentFilter = b.dataset.filter;
    renderProjects(currentFilter);
  });
});

// ==================== VOTE HANDLER ====================
function handleVote(id) {
  if (!isLoggedIn) { showModal(); showToast('⚠️ Dawıs beriw ushın aldın sistemage kiriń!'); return; }
  const p = projects.find(x => x.id === id);
  if (p) { selectedProject = p; openVoteModal(p); }
}

function openVoteModal(p) {
  document.getElementById('voteIcon').textContent = p.icon || '🏗️';
  document.getElementById('voteProjectName').textContent = p.name;
  document.getElementById('voteProjectDesc').textContent = p.desc;
  const pct = Math.round((p.votes / (p.maxVotes||500)) * 100);
  document.getElementById('voteCount').textContent = `${p.votes} dawıs`;
  document.getElementById('votePercent').textContent = `${pct}%`;
  document.getElementById('voteProgressFill').style.width = '0%';
  setTimeout(() => document.getElementById('voteProgressFill').style.width = `${pct}%`, 100);
  const btn = document.getElementById('castVoteBtn');
  const voted = userVotes.has(p.id);
  btn.textContent = voted ? '✅ Allaqashan dawıs berdińiz' : '🗳️ Dawıs beriw';
  btn.disabled = voted; btn.style.opacity = voted ? '0.6' : '1';
  voteOv.classList.add('open');
}

document.getElementById('castVoteBtn').addEventListener('click', async () => {
  if (!selectedProject || userVotes.has(selectedProject.id) || !currentUser) return;
  const btn = document.getElementById('castVoteBtn');
  btn.textContent = '⏳ Jiberilmoqda...'; btn.disabled = true;
  try {
    const res = await apiPost(API.vote, { phone: currentUser.phone, projectId: selectedProject.id });
    if (res.success) {
      userVotes.add(selectedProject.id);
      if (res.project) selectedProject.votes = res.project.votes;
      else selectedProject.votes += 1;
      saveSession();
      btn.textContent = '✅ Dawıs berildi!'; btn.style.opacity = '0.6';
      const pct = Math.round((selectedProject.votes / (selectedProject.maxVotes||500))*100);
      document.getElementById('voteCount').textContent = `${selectedProject.votes} dawıs`;
      document.getElementById('votePercent').textContent = `${pct}%`;
      document.getElementById('voteProgressFill').style.width = `${pct}%`;
      showToast('🎉 Dawısıńız qabıl etildi!');
      setTimeout(() => { voteOv.classList.remove('open'); renderProjects(currentFilter); renderChart(); }, 1500);
    } else {
      showToast('❌ ' + (res.message || 'Qate'));
      btn.textContent = '🗳️ Dawıs beriw'; btn.disabled = false; btn.style.opacity = '1';
    }
  } catch {
    // Offline demo
    userVotes.add(selectedProject.id); selectedProject.votes += 1; saveSession();
    btn.textContent = '✅ Dawıs berildi!'; btn.style.opacity = '0.6';
    showToast('🎉 Dawısıńız qabıl etildi!');
    setTimeout(() => { voteOv.classList.remove('open'); renderProjects(currentFilter); renderChart(); }, 1500);
  }
});

document.getElementById('voteModalClose').addEventListener('click', () => voteOv.classList.remove('open'));
voteOv.addEventListener('click', e => { if (e.target === voteOv) voteOv.classList.remove('open'); });

// ==================== CHART ====================
function renderChart() {
  const c = document.getElementById('chartBars');
  c.innerHTML = projects.slice(0,5).map((p,i) => {
    const pct = Math.round((p.votes/(p.maxVotes||500))*100);
    return `
    <div class="chart-bar-item" style="animation:fadeInUp .4s ease both;animation-delay:${i*.08}s">
      <div class="chart-bar-header">
        <span class="chart-bar-name">${p.name.substring(0,24)}${p.name.length>24?'...':''}</span>
        <span class="chart-bar-pct">${pct}%</span>
      </div>
      <div class="chart-bar-track"><div class="chart-bar-fill" style="width:0%;background:linear-gradient(90deg,${p.color||'#6C3FF5'},${p.color||'#6C3FF5'}99)" data-w="${pct}%"></div></div>
    </div>`;
  }).join('');
}

const chartObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.chart-bar-fill').forEach(b => b.style.width = b.dataset.w);
      chartObs.disconnect();
    }
  });
}, { threshold: 0.2 });

// ==================== LOGIN MODAL ====================
function showModal() { modalOv.classList.add('open'); showStep('step1'); }
function hideModal() { modalOv.classList.remove('open'); clearInterval(timerInterval); }

document.getElementById('openLoginBtn').addEventListener('click', () => {
  if (isLoggedIn) { showToast('✅ Siz allaqashan kirdińiz!'); return; }
  showModal();
});
document.getElementById('heroLoginBtn').addEventListener('click', showModal);
document.getElementById('modalClose').addEventListener('click', hideModal);
modalOv.addEventListener('click', e => { if (e.target === modalOv) hideModal(); });

function showStep(id) {
  document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ==================== PHONE ====================
const phoneInput = document.getElementById('phoneInput');
phoneInput.addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g,''));

document.getElementById('sendCodeBtn').addEventListener('click', async () => {
  const phone = phoneInput.value.replace(/\D/g,'');
  if (phone.length < 9) {
    showToast('⚠️ Tolıq telefon nomerin kiritiń!');
    phoneInput.parentElement.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.5)';
    setTimeout(() => phoneInput.parentElement.style.boxShadow = '', 2000);
    return;
  }
  const btn = document.getElementById('sendCodeBtn');
  btn.textContent = '⏳ Jiberilmoqda...'; btn.disabled = true;
  try {
    const res = await apiPost(API.sendOtp, { phone });
    if (res.success) {
      otpToken = res.token;
      showStep('step2'); startTimer(120); setupOTP();
      showToast('📱 Kod Telegram botıńızǵa jiberildi!');
    } else {
      showToast('❌ ' + (res.message || 'Qate yuz berdi'));
      if (res.botLink) setTimeout(() => window.open(res.botLink, '_blank'), 800);
      btn.textContent = 'Kod jiberiw'; btn.disabled = false;
    }
  } catch {
    showToast('ℹ️ Demo rejim: islegen 4 xaneli kod isleydi');
    otpToken = 'demo';
    showStep('step2'); startTimer(120); setupOTP();
    btn.textContent = 'Kod jiberiw'; btn.disabled = false;
  }
});

// ==================== OTP ====================
function setupOTP() {
  const cells = [...document.querySelectorAll('.otp-cell')];
  cells.forEach((c, i) => {
    c.value = ''; c.classList.remove('filled');
    const nc = c.cloneNode(true); c.parentNode.replaceChild(nc, c);
  });
  const fc = [...document.querySelectorAll('.otp-cell')];
  fc.forEach((c, i) => {
    c.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/\D/g,'').slice(0,1);
      e.target.classList.toggle('filled', !!e.target.value);
      if (e.target.value && i < fc.length-1) fc[i+1].focus();
    });
    c.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !c.value && i > 0) { fc[i-1].focus(); fc[i-1].value = ''; fc[i-1].classList.remove('filled'); }
    });
    c.addEventListener('paste', e => {
      e.preventDefault();
      const p = e.clipboardData.getData('text').replace(/\D/g,'');
      p.split('').slice(0,4).forEach((ch,j) => { if(fc[j]){fc[j].value=ch;fc[j].classList.add('filled');} });
      fc[Math.min(p.length,3)].focus();
    });
  });
  fc[0].focus();
}

document.getElementById('verifyCodeBtn').addEventListener('click', async () => {
  const code = [...document.querySelectorAll('.otp-cell')].map(c => c.value).join('');
  if (code.length < 4) { showToast('⚠️ 4 xanalı kodtı kiritiń!'); return; }
  const btn = document.getElementById('verifyCodeBtn');
  btn.textContent = '⏳ Tekserilmoqda...'; btn.disabled = true;
  const phone = phoneInput.value.replace(/\D/g,'');
  try {
    let success = false, userName = '';
    if (otpToken === 'demo') {
      success = true; // Demo rejimda istalgan kod ishlaydi
    } else {
      const res = await apiPost(API.verifyOtp, { phone, code, token: otpToken });
      success = res.success; userName = res.user?.name || '';
      if (!success) { showToast('❌ ' + (res.message||'Notoǵrı kod')); btn.textContent='Tastıyıqlаw'; btn.disabled=false; return; }
    }
    clearInterval(timerInterval);
    isLoggedIn = true; currentUser = { phone, name: userName }; userVotes = new Set(); saveSession();
    showStep('step3'); updateLoginButton();
  } catch {
    // Demo
    clearInterval(timerInterval);
    isLoggedIn = true; currentUser = { phone, name:'Qatnasıwshı' }; userVotes = new Set(); saveSession();
    showStep('step3'); updateLoginButton();
  }
  btn.textContent = 'Tastıyıqlаw'; btn.disabled = false;
});

document.getElementById('backToPhone').addEventListener('click', () => {
  clearInterval(timerInterval);
  showStep('step1');
  const b = document.getElementById('sendCodeBtn'); b.textContent='Kod jiberiw'; b.disabled=false;
});

document.getElementById('startVotingBtn').addEventListener('click', () => {
  hideModal();
  document.getElementById('about').scrollIntoView({ behavior:'smooth' });
  showToast(`🎉 Xosh keldiñiz${currentUser?.name ? ', ' + currentUser.name : ''}! Dawıs bere alasız!`);
});

function updateLoginButton() {
  const b = document.getElementById('openLoginBtn');
  b.textContent = currentUser?.name ? `👤 ${currentUser.name.split(' ')[0]}` : '👤 Kirdi';
  b.style.background = 'linear-gradient(135deg,#22C55E,#16A34A)';
  b.style.boxShadow = '0 4px 16px rgba(34,197,94,.35)';
}

// ==================== TIMER ====================
function startTimer(sec) {
  clearInterval(timerInterval);
  let r = sec;
  const d = document.getElementById('timerDisplay');
  tick(d, r);
  timerInterval = setInterval(() => { r--; tick(d, r); if(r<=0){clearInterval(timerInterval);d.textContent='Múddet ótti';d.style.color='var(--accent2)';} }, 1000);
}
function tick(el, s) {
  el.textContent = `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  el.style.color = s<=30 ? 'var(--accent2)' : 'var(--primary-light)';
}

// ==================== TOAST ====================
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3500);
}

// ==================== SMOOTH NAV ====================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const el = document.querySelector(a.getAttribute('href'));
    if (el) { e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); navLinks.classList.remove('open'); }
  });
});

// ==================== INIT ====================
async function init() {
  restoreSession();
  await loadProjects();
  renderProjects();
  renderChart();
  const rs = document.getElementById('results');
  if (rs) chartObs.observe(rs);
}
init();
