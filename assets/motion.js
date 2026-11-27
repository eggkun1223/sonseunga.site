// 움직임: 운영 주기 그림이 화면에 들어올 때 채워지고, 첫 화면 숫자가 올라간다.
// 움직임 줄이기 설정이면 아무것도 하지 않는다 (CSS도 같은 조건에서만 숨긴다).
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { document.documentElement.classList.remove('js'); return; }

  // 1. 운영 주기 그림
  var cycles = document.querySelectorAll('.cycle');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: "0px 0px -15% 0px" });
    cycles.forEach(function (c) {
      // 처음부터 화면 안에 있으면 바로 시작 (관찰 콜백이 늦게 오는 환경 대비)
      if (c.getBoundingClientRect().top < window.innerHeight * 0.85) {
        setTimeout(function () { c.classList.add('in'); }, 300);
      } else { io.observe(c); }
    });
  } else {
    cycles.forEach(function (c) { c.classList.add('in'); });
  }

  // 2. 첫 화면 숫자
  var nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;
  var dur = 1100, start = null;
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  nums.forEach(function (n) { n.textContent = '0'; });
  function step(ts) {
    if (start === null) start = ts;
    var t = Math.min(1, (ts - start) / dur);
    nums.forEach(function (n) { n.textContent = Math.round(ease(t) * +n.dataset.count); });
    if (t < 1) requestAnimationFrame(step);
  }
  setTimeout(function () { requestAnimationFrame(step); }, 450);
})();
