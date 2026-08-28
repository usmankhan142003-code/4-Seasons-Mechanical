/* 4 Seasons Mechanical — shared behavior across all pages */
(function () {
  const html = document.documentElement;

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

  function botReply(userText) {
    const t = userText.toLowerCase();
    let reply = "Thanks for reaching out! For anything urgent, call us directly and a technician will help right away. Otherwise, tell me a bit more and I'll point you in the right direction.";
    if (t.includes('emergency') || t.includes('urgent') || t.includes('no heat') || t.includes('no ac')) {
      reply = "That sounds urgent — please call us right away for 24/7 emergency service. I can also grab your info if you'd rather we call you back.";
    } else if (t.includes('price') || t.includes('cost') || t.includes('quote')) {
      reply = "Pricing depends on the job, but we're happy to give you a free, no-obligation quote. Want to fill out our quick contact form?";
    } else if (t.includes('plumb')) {
      reply = "We handle everything from leak repairs to full repipes — check out our Plumbing page for details, or I can pass your request to the team.";
    } else if (t.includes('electric')) {
      reply = "Our electrical team covers panel upgrades, wiring, EV chargers and more — see the Electrical page, or let me know what you need help with.";
    } else if (t.includes('hvac') || t.includes('heat') || t.includes('furnace') || t.includes('cool') || t.includes('ac')) {
      reply = "Heating and cooling is our specialty. Is this a repair, a new install, or a maintenance visit you're after?";
    } else if (t.includes('hour') || t.includes('open')) {
      reply = "We're available 24/7 for emergencies, with standard hours Mon–Fri. Check the Contact page for full details.";
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
