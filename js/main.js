/* 4 Seasons Mechanical — shared behavior across all pages */
(function () {
  const html = document.documentElement;

  /* Preloader: walking handyman intro */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const plWalker = document.getElementById('plWalker');
    const plBrand = document.getElementById('plBrand');
    const plOverlay = document.getElementById('plOverlay');
    const plSkip = document.getElementById('plSkip');
    let plTimers = [];

    plTimers.push(setTimeout(() => plWalker.classList.add('pl-arrived'), 2200));
    plTimers.push(setTimeout(() => plBrand.classList.add('pl-show'), 2650));
    plTimers.push(setTimeout(() => plOverlay.classList.add('pl-reveal'), 3500));
    plTimers.push(setTimeout(() => preloader.classList.add('pl-hidden'), 4200));

    plSkip.addEventListener('click', () => {
      plTimers.forEach(clearTimeout);
      preloader.classList.add('pl-hidden');
    });
  }

  /* Theme toggle */
  const saved = localStorage.getItem('fsm-theme') || 'light';
  html.dataset.theme = saved;
  const themeBtn = document.getElementById('themeToggle');
  const drawerThemeBtn = document.getElementById('drawerThemeBtn');
  const drawerThemeIcon = document.getElementById('drawerThemeIcon');
  const drawerThemeLabel = document.getElementById('drawerThemeLabel');

  function syncThemeUI(t) {
    if (themeBtn) themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
    if (drawerThemeIcon) drawerThemeIcon.textContent = t === 'dark' ? '☀️' : '🌙';
    if (drawerThemeLabel) drawerThemeLabel.textContent = t === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
  syncThemeUI(saved);

  function toggleTheme() {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    localStorage.setItem('fsm-theme', next);
    syncThemeUI(next);
  }
  themeBtn && themeBtn.addEventListener('click', toggleTheme);
  drawerThemeBtn && drawerThemeBtn.addEventListener('click', toggleTheme);

  /* Header scroll state */
  const header = document.getElementById('header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* Drawer */
  const drawer = document.getElementById('drawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerBtn = document.getElementById('drawerBtn');
  const drawerClose = document.getElementById('drawerClose');

  function openDrawer() {
    drawer.classList.add('open');
    drawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  drawerBtn && drawerBtn.addEventListener('click', openDrawer);
  drawerClose && drawerClose.addEventListener('click', closeDrawer);
  drawerOverlay && drawerOverlay.addEventListener('click', closeDrawer);

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    q && q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((i) => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* Quote popup */
  const quotePopup = document.getElementById('quotePopup');
  const quotePill = document.getElementById('quotePill');
  const qpDismiss = document.getElementById('qpDismiss');

  if (quotePopup) {
    const dismissedThisSession = sessionStorage.getItem('fsm-quote-dismissed');
    if (!dismissedThisSession) {
      setTimeout(() => quotePopup.classList.add('popped'), 4500);
    }
    qpDismiss.addEventListener('click', () => {
      quotePopup.classList.remove('popped');
      quotePopup.classList.add('dismissed');
      quotePill.style.display = 'flex';
      sessionStorage.setItem('fsm-quote-dismissed', '1');
    });
    quotePill.addEventListener('click', () => {
      quotePill.style.display = 'none';
      quotePopup.classList.remove('dismissed');
      quotePopup.classList.add('popped');
    });
  }

  /* Chat widget (scripted assistant, ready to be swapped for a real integration) */
  const chatBtn = document.getElementById('chatBtn');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatMsgs = document.getElementById('chatMsgs');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const chatBubble = document.getElementById('chatBubble');
  const chatBubbleClose = document.getElementById('chatBubbleClose');

  if (chatBubble && !sessionStorage.getItem('fsm-chat-bubble-seen')) {
    setTimeout(() => chatBubble.classList.add('show'), 8000);
  }
  chatBubbleClose && chatBubbleClose.addEventListener('click', (e) => {
    e.stopPropagation();
    chatBubble.classList.remove('show');
    sessionStorage.setItem('fsm-chat-bubble-seen', '1');
  });

  function addMsg(text, who) {
    const div = document.createElement('div');
    div.className = 'msg ' + who;
    div.textContent = text;
    chatMsgs.appendChild(div);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }

  /* Scripted assistant — only answers using information already published on
     the site. Pricing is always redirected to Contact; anything unrelated to
     4 Seasons Mechanical gets a polite, professional decline. Each topic has
     a few phrasings so replies don't feel copy-pasted. */
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  const PRICING_RE = /\b(price|pricing|cost|costs|how much|estimate|rate|rates|fee|fees|cheap|expensive|afford)\b/;
  const YEARS_RE = /how long|years?( of)? experience|in business|been around|established|founded|how old is/;
  const GREETING_RE = /\b(hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you)\b/;
  const BUSINESS_RE = /\b(hvac|heat|heating|furnace|duct|air ?condition|a\/c|\bac\b|cool|cooling|plumb|drain|leak|water heater|pipe|repip|fixture|electric|wiring|wire|panel|light|ev charger|charger|emergency|urgent|no heat|hour|open|closed|service area|location|address|calgary|appointment|book|schedule|quote|warranty|guarantee|licens|insur|new construction|builder|basement suite|contact|phone|email|technician|repair|install|maintenance|tune-up|review|rating|company|business|4 seasons|about|team|service|services)\b/;

  const REPLIES = {
    pricing: [
      "Pricing depends on the specific job, so I can't quote a number here — contact us directly or submit our quote form and the team will follow up with accurate pricing.",
      "That varies job to job, so I'll leave the actual number to the team — reach out through our Contact page or call us and we'll get you a proper quote.",
      "I'm not able to give pricing here, but it's free to ask — fill out the quote form or give us a call and we'll quote your job directly."
    ],
    emergency: [
      "That sounds urgent — please call us right away at (403) 796-4600 for 24/7 emergency service.",
      "For anything urgent like that, don't wait on me — call (403) 796-4600 now, we're available 24/7."
    ],
    years: [
      "We've been proudly serving Calgary and the surrounding areas for over 20 years, with 500+ jobs completed and a 5.0★ customer rating.",
      "4 Seasons Mechanical has over 20 years of experience in the Calgary area — 500+ jobs completed and counting."
    ],
    basement: [
      "We offer complete mechanical packages for legal basement suites — HVAC, plumbing, and electrical all covered. Contact us to discuss your project.",
      "Legal basement suites are one of our specialties — full mechanical packages covering heating, plumbing, and electrical. Reach out to get started."
    ],
    newConstruction: [
      "We partner with home builders on new construction projects, handling HVAC, plumbing, and electrical rough-ins through final walkthrough. See the Home page or contact us for details.",
      "New construction is something we work on directly with builders — rough-ins through final walkthrough for HVAC, plumbing, and electrical. Contact us to talk about your build."
    ],
    plumbing: [
      "We handle leak repairs, water heater installation and repair, drain cleaning, repiping, and fixture installation — see our Plumbing page for the full list.",
      "On the plumbing side we cover leaks, water heaters, drain cleaning, repiping, and fixtures — check the Plumbing page for more."
    ],
    electrical: [
      "Our electrical services include panel upgrades, wiring and rewiring, lighting installation, and EV charger installation — see our Electrical page for details.",
      "For electrical work we do panel upgrades, wiring, lighting, and EV chargers — full details are on the Electrical page."
    ],
    hvac: [
      "We specialize in furnace and air conditioner installation, repair, and maintenance, plus furnace and duct cleaning — check out the Home page for our full HVAC lineup.",
      "Heating and cooling is our specialty — furnace and AC installs, repairs, maintenance, and duct cleaning. More on the Home page."
    ],
    hours: [
      "We're available 24/7 for emergencies, with standard hours Monday–Friday. Check the Contact page for full details.",
      "Standard hours are Monday–Friday, and we're on call 24/7 for emergencies — see the Contact page for specifics."
    ],
    location: [
      "We're located in Calgary, AB and serve Calgary and the surrounding areas.",
      "We're based in Calgary, AB, serving Calgary and the surrounding communities."
    ],
    licensing: [
      "We're fully licensed and insured, with certified technicians and a satisfaction guarantee on every job.",
      "Every technician is licensed, insured, and certified — and we back our work with a satisfaction guarantee."
    ],
    contact: [
      "You can reach us at (403) 796-4600 or info@4seasonsmechanical.ca, or use the form on our Contact page.",
      "Best ways to reach us: (403) 796-4600, info@4seasonsmechanical.ca, or the Contact page form."
    ],
    genericBusiness: [
      "Thanks for the question — for more detail, please visit our Contact page or call us directly and our team can help.",
      "Good question — I'd point you to our Contact page or a quick call so the team can give you a proper answer."
    ],
    greeting: [
      "Hello! I'm the 4 Seasons virtual assistant. Ask me about our heating, cooling, plumbing, or electrical services, our hours, service area, or how to get a free quote.",
      "Hi there! Happy to help — ask about our HVAC, plumbing, or electrical services, hours, service area, or getting a free quote."
    ],
    decline: [
      "I'm sorry, I'm only able to help with questions about 4 Seasons Mechanical's services. For anything else, please reach out to our team directly.",
      "I'm afraid that's outside what I can help with — I'm limited to questions about 4 Seasons Mechanical's services. Feel free to contact our team directly for anything else."
    ]
  };

  function botReply(userText) {
    const t = userText.toLowerCase();
    let reply;

    if (PRICING_RE.test(t)) {
      reply = pick(REPLIES.pricing);
    } else if (t.includes('emergency') || t.includes('urgent') || t.includes('no heat') || t.includes('no ac')) {
      reply = pick(REPLIES.emergency);
    } else if (YEARS_RE.test(t)) {
      reply = pick(REPLIES.years);
    } else if (/basement suite/.test(t)) {
      reply = pick(REPLIES.basement);
    } else if (/new construction|builder/.test(t)) {
      reply = pick(REPLIES.newConstruction);
    } else if (/plumb|drain|leak|water heater|\bpipe\b|repip|fixture/.test(t)) {
      reply = pick(REPLIES.plumbing);
    } else if (/electric|wiring|wire|panel|light|ev charger|charger/.test(t)) {
      reply = pick(REPLIES.electrical);
    } else if (/hvac|heat|furnace|duct|air ?condition|a\/c|\bac\b|cool/.test(t)) {
      reply = pick(REPLIES.hvac);
    } else if (/hour|open|closed/.test(t)) {
      reply = pick(REPLIES.hours);
    } else if (/location|address|service area|calgary/.test(t)) {
      reply = pick(REPLIES.location);
    } else if (/licens|insur|warranty|guarantee/.test(t)) {
      reply = pick(REPLIES.licensing);
    } else if (/contact|phone|email|book|schedule|appointment/.test(t)) {
      reply = pick(REPLIES.contact);
    } else if (BUSINESS_RE.test(t)) {
      reply = pick(REPLIES.genericBusiness);
    } else if (GREETING_RE.test(t)) {
      reply = pick(REPLIES.greeting);
    } else {
      reply = pick(REPLIES.decline);
    }
    setTimeout(() => addMsg(reply, 'bot'), 550);
  }

  function openChat() {
    chatPanel.classList.add('open');
    chatBubble && chatBubble.classList.remove('show');
    if (!chatMsgs.dataset.greeted) {
      addMsg("Hi! I'm the 4 Seasons virtual assistant. Ask me about heating, cooling, plumbing, or electrical — or how to get a free quote.", 'bot');
      chatMsgs.dataset.greeted = '1';
    }
  }
  chatBtn && chatBtn.addEventListener('click', () => {
    chatPanel.classList.contains('open') ? chatPanel.classList.remove('open') : openChat();
  });
  chatClose && chatClose.addEventListener('click', () => chatPanel.classList.remove('open'));

  function sendMsg() {
    const val = chatInput.value.trim();
    if (!val) return;
    addMsg(val, 'user');
    chatInput.value = '';
    botReply(val);
  }
  chatSend && chatSend.addEventListener('click', sendMsg);
  chatInput && chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMsg(); });

  /* Contact form — Netlify Forms AJAX submit */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = new FormData(contactForm);
      fetch('/', { method: 'POST', body: new URLSearchParams(data).toString(), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
        .then(() => {
          contactForm.style.display = 'none';
          document.getElementById('formSuccess').classList.add('show');
        })
        .catch(() => {
          alert("Something went wrong sending your message — please call us directly or try again.");
        });
    });
  }

  /* Mark active nav link */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.main-nav a, .drawer-nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });
})();
