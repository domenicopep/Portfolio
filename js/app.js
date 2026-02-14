/* ======================== SCROLL REVEAL ======================== */

function createRevealObserver() {
  return new IntersectionObserver(handleRevealEntries, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });
}

function handleRevealEntries(entries) {
  entries.forEach(function (entry) {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('revealed');
  });
}

function initScrollReveal() {
  var observer = createRevealObserver();
  var elements = document.querySelectorAll('.reveal');
  elements.forEach(function (el) {
    observer.observe(el);
  });
}

/* ======================== STAGGER GROUPS ======================== */

function initStaggerGroups() {
  var groups = document.querySelectorAll('[data-stagger]');
  groups.forEach(function (group) {
    staggerChildren(group);
  });
}

function staggerChildren(group) {
  var children = group.querySelectorAll('.reveal');
  var delay = parseFloat(group.dataset.stagger) || 0.1;
  children.forEach(function (child, i) {
    child.style.transitionDelay = (i * delay) + 's';
  });
}

/* ======================== NAV TRACKING ======================== */

function initNavTracking() {
  var sections = document.querySelectorAll('section[id]');
  var links = document.querySelectorAll('nav a[href^="#"]');
  var observer = new IntersectionObserver(function (entries) {
    updateActiveNav(entries, links);
  }, { threshold: 0.3 });
  sections.forEach(function (s) { observer.observe(s); });
}

function updateActiveNav(entries, links) {
  entries.forEach(function (entry) {
    if (!entry.isIntersecting) return;
    var id = entry.target.id;
    links.forEach(function (link) {
      link.classList.toggle('active', link.hash === '#' + id);
    });
  });
}

/* ======================== TEXTURE PARALLAX ======================== */

function initTextureParallax() {
  var bars = document.querySelectorAll('.texture-bar');
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateTexturePositions(bars, window.scrollY);
      ticking = false;
    });
  });
}

function updateTexturePositions(bars, scrollY) {
  bars.forEach(function (bar, i) {
    var direction = i % 2 === 0 ? -1 : 1;
    bar.style.transform = 'translateX(' + (scrollY * 0.04 * direction) + 'px)';
  });
}

/* ======================== SMOOTH SCROLL ======================== */

function initSmoothScroll() {
  var links = document.querySelectorAll('nav a[href^="#"]');
  links.forEach(function (link) {
    link.addEventListener('click', handleNavClick);
  });
}

function handleNavClick(e) {
  e.preventDefault();
  var target = document.querySelector(this.getAttribute('href'));
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ======================== INIT ======================== */

document.addEventListener('DOMContentLoaded', function () {
  initStaggerGroups();
  initScrollReveal();
  initNavTracking();
  initTextureParallax();
  initSmoothScroll();
  initClickSound();
  initDelayedNavClick();
});



/* ======================== CLICK SOUND ======================== */

var audioCtx = null;
var clickBuffer = null;

function getBasePath() {
  var inSub = window.location.pathname.indexOf('/projects/') !== -1;
  return inSub ? '../' : '';
}

function loadClickBuffer(ctx) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', getBasePath() + 'assets/click2.wav', true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function () {
    if (xhr.status === 200 || xhr.status === 0) {
      ctx.decodeAudioData(xhr.response, function (buf) {
        clickBuffer = buf;
      });
    }
  };
  xhr.send();
}

function warmUpAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  loadClickBuffer(audioCtx);
}

function playClick() {
  if (!audioCtx || !clickBuffer) return;
  var source = audioCtx.createBufferSource();
  source.buffer = clickBuffer;
  var gain = audioCtx.createGain();
  gain.gain.value = 0.15;
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
}

function initClickSound() {
  document.addEventListener('pointerdown', warmUpAudio, { once: true });
  document.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) playClick();
  });
}

/* ======================== DELAYED NAV CLICK ======================== */

function initDelayedNavClick() {
  var links = document.querySelectorAll('.back-nav a');
  links.forEach(function (link) {
    link.addEventListener('click', handleDelayedClick);
  });
}

function handleDelayedClick(e) {
  e.preventDefault();
  var href = this.getAttribute('href');
  playClick();
  setTimeout(function () {
    window.location.href = href;
  }, 80);
}
