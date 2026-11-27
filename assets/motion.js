// 움직임: 운영 주기 그림과 첫 화면이 화면에 들어올 때마다 처음부터 재생된다.
// 완전히 화면 밖으로 나가면 처음 상태로 되돌려 두고, 다시 들어오면 또 재생한다.
// 움직임 줄이기 설정이면 아무것도 하지 않는다 (CSS도 같은 조건에서만 숨긴다).
(function () {
  // 경력 기간: data-since 날짜부터 오늘까지를 'N년 N개월'로 (움직임 설정과 상관없이 항상)
  document.querySelectorAll('[data-since]').forEach(function (el) {
    var p = el.getAttribute('data-since').split('-').map(Number);
    var now = new Date();
    var months = (now.getFullYear() - p[0]) * 12 + (now.getMonth() + 1 - p[1]) - (now.getDate() < p[2] ? 1 : 0);
    if (months < 0) months = 0;
    var y = Math.floor(months / 12), m = months % 12;
    var ys = el.querySelector('[data-part="y"]'), ms = el.querySelector('[data-part="m"]');
    if (ys) { ys.dataset.count = y; ys.textContent = y; ys.parentNode.hidden = y === 0; }
    if (ms) { ms.dataset.count = m; ms.textContent = m; ms.parentNode.hidden = m === 0 && y > 0; }
  });

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { document.documentElement.classList.remove('js'); return; }

  // 첫 화면 숫자 올리기
  var nums = document.querySelectorAll('.hero [data-count]');
  var timer = null, wait = null;
  function countUp() {
    if (!nums.length) return;
    clearInterval(timer); clearTimeout(wait);
    var dur = 1100;
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    nums.forEach(function (n) { n.textContent = '0'; });
    wait = setTimeout(function () {
      var start = Date.now();
      timer = setInterval(function () {
        var t = Math.min(1, (Date.now() - start) / dur);
        nums.forEach(function (n) { n.textContent = Math.round(ease(t) * +n.dataset.count); });
        if (t >= 1) clearInterval(timer);
      }, 30);
    }, 450);
  }

  function play(el) {
    if (el.classList.contains('in')) return;
    el.classList.add('in');
    if (el.classList.contains('hero')) countUp();
  }
  function reset(el) { el.classList.remove('in'); }

  var targets = document.querySelectorAll('.cycle, .hero');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(play);
    return;
  }

  // 들어올 때: 화면 아래쪽 15%를 지나 올라오면 재생
  var enter = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) play(e.target); });
  }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });
  // 나갈 때: 한 픽셀도 안 보이게 되면 처음 상태로
  var leave = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (!e.isIntersecting) reset(e.target); });
  }, { threshold: 0 });

  targets.forEach(function (el) {
    // 처음부터 화면 안에 있으면 바로 시작 (관찰 콜백이 늦게 오는 환경 대비)
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.85 && r.bottom > 0) {
      setTimeout(function () { play(el); }, el.classList.contains('hero') ? 0 : 300);
    }
    enter.observe(el);
    // data-once 가 붙은 그림(구축·운영 상세 페이지)은 한 번만 재생하고 되돌리지 않는다
    if (!el.hasAttribute('data-once')) leave.observe(el);
  });
})();
