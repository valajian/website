/**
 * 付费广告轮播 — 支持全局默认间隔 + 单个广告自定义时长
 *
 * PREMIUM_ADS 格式：
 *   [{ title, desc, image, link, duration? }, ...]
 *
 * PREMIUM_INTERVAL：全局默认切换间隔（秒，默认 5）
 *   如果某个广告的 duration > 0，则优先使用该值，否则使用全局默认
 *
 * 依赖：每个轮播至少需要 #premiumTrack 和 #premiumDots 两个容器元素
 */
(function () {
  'use strict';

  if (typeof PREMIUM_ADS === 'undefined' || !PREMIUM_ADS.length) return;

  var ads = PREMIUM_ADS;
  var globalInterval = (typeof PREMIUM_INTERVAL !== 'undefined' ? PREMIUM_INTERVAL : 5) * 1000;
  var track = document.getElementById('premiumTrack');
  var dotsContainer = document.getElementById('premiumDots');
  if (!track || !dotsContainer) return;

  var currentIndex = 0;
  var timer = null;
  var isPaused = false;

  /* ---- 获取当前广告的显示时长（单条优先，否则全局默认） ---- */
  function getCurrentDuration() {
    var ad = ads[currentIndex];
    var sec = (ad.duration && ad.duration > 0) ? ad.duration : (PREMIUM_INTERVAL || 5);
    return sec * 1000;
  }

  /* ---- 构建 DOM ---- */
  ads.forEach(function (ad, i) {
    // slide
    var slide = document.createElement('div');
    slide.className = 'premium-slide';

    var imgDiv = document.createElement('div');
    imgDiv.className = 'slide-img';
    if (ad.image) {
      var img = document.createElement('img');
      img.src = ad.image;
      img.alt = ad.title || '';
      img.onerror = function () { this.parentElement.textContent = '📷 图片加载失败'; };
      imgDiv.appendChild(img);
    } else {
      imgDiv.textContent = '📷 广告图片';
    }
    slide.appendChild(imgDiv);

    var body = document.createElement('div');
    body.className = 'slide-body';
    var h3 = document.createElement('h3');
    h3.textContent = ad.title || ('广告 ' + (i + 1));
    body.appendChild(h3);
    var p = document.createElement('p');
    p.textContent = ad.desc || '';
    body.appendChild(p);
    if (ad.link) {
      var a = document.createElement('a');
      a.href = ad.link;
      a.className = 'btn';
      a.textContent = '了解详情';
      a.target = '_blank';
      body.appendChild(a);
    }
    slide.appendChild(body);

    track.appendChild(slide);

    // dot
    var dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.dataset.index = i;
    dot.addEventListener('click', function () {
      goTo(parseInt(this.dataset.index, 10));
    });
    dotsContainer.appendChild(dot);
  });

  /* ---- 轮播控制（setTimeout 动态计时） ---- */
  function goTo(index) {
    if (index === currentIndex) return;
    currentIndex = index;
    var offset = -currentIndex * 100;
    track.style.transform = 'translateX(' + offset + '%)';
    // dots
    var dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === currentIndex);
    });
    resetTimer();
  }

  function next() {
    goTo((currentIndex + 1) % ads.length);
  }

  function resetTimer() {
    if (timer) clearTimeout(timer);
    if (!isPaused && ads.length > 1) {
      timer = setTimeout(next, getCurrentDuration());
    }
  }

  function pause() {
    isPaused = true;
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function resume() {
    isPaused = false;
    resetTimer();
  }

  /* ---- 悬停暂停 ---- */
  var carousel = document.getElementById('premiumCarousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', pause);
    carousel.addEventListener('mouseleave', resume);
  }

  /* ---- 启动 ---- */
  if (ads.length > 1) {
    timer = setTimeout(next, getCurrentDuration());
  }
})();
