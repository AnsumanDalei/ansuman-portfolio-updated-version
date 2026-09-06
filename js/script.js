(function(){
  "use strict";
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(pointer:fine)').matches;
  if(window.gsap && window.ScrollTrigger){ gsap.registerPlugin(ScrollTrigger); }

  /* ============================================================
     EMAILJS CONFIG — replace these 3 placeholders with your own
     EmailJS account values (emailjs.com — free tier is enough):
       1) EMAILJS_PUBLIC_KEY  -> Account > General > Public Key
       2) EMAILJS_SERVICE_ID  -> Email Services > your service
       3) EMAILJS_TEMPLATE_ID -> Email Templates > your template
     Until these are filled in, the form falls back to opening
     the visitor's email client with the message pre-filled, so
     it still works — it just won't land in your inbox directly.
     ============================================================ */
  var EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
  var EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
  var EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
  var EMAILJS_READY = window.emailjs && EMAILJS_PUBLIC_KEY.indexOf('YOUR_') !== 0 && EMAILJS_SERVICE_ID.indexOf('YOUR_') !== 0 && EMAILJS_TEMPLATE_ID.indexOf('YOUR_') !== 0;
  if(EMAILJS_READY){ window.emailjs.init(EMAILJS_PUBLIC_KEY); }

  /* ---------- SHARED PROFILE PHOTO (preloader / navbar / footer) ---------- */
  (function(){
    var mainPhoto = document.getElementById('mainProfilePhotoImg');
    var src = mainPhoto ? mainPhoto.getAttribute('src') : '';
    if(src){
      var avatars = document.querySelectorAll('.avatar-photo');
      for(var i = 0; i < avatars.length; i++){ avatars[i].src = src; }
    }
  })();

  /* ---------- PRELOADER ---------- */
  var preloader = document.getElementById('preloader');
  var preloadCount = document.getElementById('preloadCount');
  var preloadFill = document.getElementById('preloadFill');
  var preloadDuration = prefersReduced ? 150 : (document.readyState === 'complete' ? 500 : 900);
  var startTime = performance.now();
  function tickPreload(now){
    var pct = Math.min(100, Math.round(((now - startTime) / preloadDuration) * 100));
    preloadCount.textContent = 'LOADING — ' + String(pct).padStart(2,'0') + '%';
    preloadFill.style.width = pct + '%';
    if(pct < 100){ requestAnimationFrame(tickPreload); }
    else { setTimeout(function(){ preloader.classList.add('hidden'); revealHero(); }, 150); }
  }
  requestAnimationFrame(tickPreload);

  function revealHero(){
    if(window.gsap){
      gsap.fromTo('.eyebrow', {opacity:0, y:-10}, {opacity:1, y:0, duration:0.6, ease:'power2.out'});
      gsap.fromTo('.hero-title', {opacity:0, y:26}, {opacity:1, y:0, duration:0.9, ease:'power3.out', delay:0.1});
      gsap.fromTo('.hero-role-line, .hero-sub, .hero-meta, .hero-cta', {opacity:0, y:20}, {opacity:1, y:0, duration:0.8, ease:'power2.out', stagger:0.09, delay:0.28});
      gsap.fromTo('.hero-visual', {opacity:0, scale:0.9}, {opacity:1, scale:1, duration:1, ease:'power3.out', delay:0.2});
    }
  }

  /* ---------- ROLE TYPEWRITER ---------- */
  var roles = ['Software Engineer', 'Full-Stack Python Developer', 'Backend Developer', 'DevOps Enthusiast', 'AI/ML Engineer'];
  var roleEl = document.getElementById('roleType');
  if(roleEl && !prefersReduced){
    var ri = 0, ci = roles[0].length, deleting = false;
    function typeLoop(){
      var word = roles[ri];
      if(!deleting){
        ci++; roleEl.textContent = word.slice(0, ci);
        if(ci >= word.length){ deleting = true; setTimeout(typeLoop, 1600); return; }
      } else {
        ci--; roleEl.textContent = word.slice(0, ci);
        if(ci <= 0){ deleting = false; ri = (ri+1) % roles.length; setTimeout(typeLoop, 300); return; }
      }
      setTimeout(typeLoop, deleting ? 32 : 55);
    }
    setTimeout(typeLoop, 2200);
  }

  /* ---------- HERO PHOTO 3D TILT ---------- */
  var visualStage = document.getElementById('visualStage');
  var hero = document.querySelector('.hero');
  var heroMouseX = 0, heroMouseY = 0;
  if(hero && isFinePointer && !prefersReduced){
    hero.addEventListener('mousemove', function(e){
      var rect = hero.getBoundingClientRect();
      heroMouseX = (e.clientX - rect.left) / rect.width - 0.5;
      heroMouseY = (e.clientY - rect.top) / rect.height - 0.5;
      if(visualStage){
        visualStage.style.transform = 'rotateY(' + (heroMouseX*10) + 'deg) rotateX(' + (-heroMouseY*10) + 'deg)';
      }
    }, {passive:true});
    hero.addEventListener('mouseleave', function(){
      heroMouseX = 0; heroMouseY = 0;
      if(visualStage){ visualStage.style.transform = 'rotateY(0deg) rotateX(0deg)'; }
    });
  }

  /* ---------- NAV: robust in-page smooth scroll ---------- */
  var navLinksEl = document.getElementById('navLinks');
  var navToggle = document.getElementById('navToggle');
  navToggle.addEventListener('click', function(){ navLinksEl.classList.toggle('open'); });

  function smoothScrollTo(id){
    var target = document.getElementById(id);
    if(!target) return;
    var y = target.getBoundingClientRect().top + window.pageYOffset - 76;
    window.scrollTo({top:y, behavior: prefersReduced ? 'auto' : 'smooth'});
  }
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    var href = a.getAttribute('href');
    if(!href || href.length < 2) return;
    var id = href.slice(1);
    if(!document.getElementById(id)) return;
    a.addEventListener('click', function(e){
      e.preventDefault();
      navLinksEl.classList.remove('open');
      smoothScrollTo(id);
    });
  });

  /* ---------- SCROLL SPY ---------- */
  var navAnchors = navLinksEl.querySelectorAll('a');
  var sectionEls = document.querySelectorAll('main section[id], header[id]');
  var auroraEl = document.getElementById('auroraLight');
  var wordmarkEl = document.querySelector('.bottom-wordmark');
  var hueMap = {top:0, about:0, experience:-10, skills:10, projects:0, achievements:-8, github:8, contact:-4};
  var activeSection = 'top';
  if('IntersectionObserver' in window){
    var navIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          activeSection = entry.target.id;
          navAnchors.forEach(function(a){ a.classList.remove('active'); });
          var match = navLinksEl.querySelector('a[data-section="' + entry.target.id + '"]');
          if(match){ match.classList.add('active'); }
          auroraEl.style.filter = 'hue-rotate(' + (hueMap[entry.target.id]||0) + 'deg)';
        }
      });
    }, {threshold:0, rootMargin:'-45% 0px -45% 0px'});
    sectionEls.forEach(function(el){ navIO.observe(el); });
  }

  /* ---------- SCROLL PROGRESS ---------- */
  var scrollFill = document.getElementById('scrollbar-fill');
  function updateScrollbar(){
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    scrollFill.style.width = (isFinite(scrolled) ? scrolled : 0) + '%';
  }
  window.addEventListener('scroll', updateScrollbar, {passive:true});
  updateScrollbar();
  if(!prefersReduced){
    window.addEventListener('scroll', function(){
      auroraEl.style.transform = 'translateY(' + (window.scrollY * 0.06) + 'px)';
    }, {passive:true});
  }

  /* ---------- BACKGROUND SHARDS PARALLAX ---------- */
  (function(){
    var shardsEl = document.getElementById('bgShards');
    if(!shardsEl || !isFinePointer || prefersReduced) return;
    var mx = 0, my = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', function(e){
      tx = (e.clientX / window.innerWidth - 0.5) * 22;
      ty = (e.clientY / window.innerHeight - 0.5) * 22;
    }, {passive:true});
    function tick(){
      requestAnimationFrame(tick);
      if(document.hidden) return;
      mx += (tx - mx) * 0.045;
      my += (ty - my) * 0.045;
      shardsEl.style.transform = 'translate3d(' + mx.toFixed(2) + 'px,' + my.toFixed(2) + 'px,0)';
    }
    requestAnimationFrame(tick);
  })();

  /* ---------- MAGNETIC BUTTONS ---------- */
  if(isFinePointer && !prefersReduced){
    document.querySelectorAll('[data-magnetic]').forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var rect = el.getBoundingClientRect();
        var relX = e.clientX - rect.left - rect.width/2;
        var relY = e.clientY - rect.top - rect.height/2;
        el.style.transform = 'translate(' + (relX*0.2) + 'px,' + (relY*0.2) + 'px)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---------- TILT (project mockups) ---------- */
  if(!prefersReduced && isFinePointer){
    document.querySelectorAll('[data-tilt]').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg)';
      });
      card.addEventListener('mouseleave', function(){ card.style.transform = 'rotateY(0deg) rotateX(0deg)'; });
    });
  }

  /* ---------- SCROLL REVEALS ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if(window.gsap && window.ScrollTrigger){
    revealEls.forEach(function(el){
      gsap.fromTo(el, {opacity:0, y:32}, { opacity:1, y:0, duration:0.9, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 88%'} });
    });
  } else if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.style.transition = 'opacity .7s ease, transform .7s ease';
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.12});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.style.opacity = 1; el.style.transform = 'none'; });
  }

  /* ---------- ABOUT: scroll storytelling sync ---------- */
  var activeStoryFace = 0;
  var storyBlocks = document.querySelectorAll('.story-block');
  var storyFaces = document.querySelectorAll('.story-face');
  var storyDots = document.querySelectorAll('#storyDots span');
  if(storyBlocks.length && 'IntersectionObserver' in window){
    var storyIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var idx = entry.target.getAttribute('data-face');
          activeStoryFace = parseInt(idx, 10);
          storyBlocks.forEach(function(b){ b.classList.remove('active'); });
          entry.target.classList.add('active');
          storyFaces.forEach(function(f){ f.classList.toggle('active', f.getAttribute('data-face') === idx); });
          storyDots.forEach(function(d){ d.classList.toggle('active', d.getAttribute('data-dot') === idx); });
        }
      });
    }, {threshold:0, rootMargin:'-40% 0px -40% 0px'});
    storyBlocks.forEach(function(b){ storyIO.observe(b); });
  }

  /* ---------- EXPERIENCE: timeline fill + node activation ---------- */
  var expProgress = 0;
  var timelineFill = document.getElementById('timelineFill');
  var timelineEl = document.querySelector('.timeline');
  if(timelineFill && timelineEl && window.gsap && window.ScrollTrigger){
    gsap.to(timelineFill, {
      height: '100%', ease:'none',
      scrollTrigger:{ trigger:timelineEl, start:'top 65%', end:'bottom 75%', scrub:0.4, onUpdate:function(self){ expProgress = self.progress; } }
    });
  }
  var tlItems = document.querySelectorAll('.tl-item');
  if('IntersectionObserver' in window){
    var tlIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add('in-view'); }
      });
    }, {threshold:0.4});
    tlItems.forEach(function(item){ tlIO.observe(item); });
  }

  /* ---------- PROJECTS: unique reveal per row ---------- */
  document.querySelectorAll('.project-row').forEach(function(row){
    var type = row.getAttribute('data-reveal');
    row.style.position = 'relative';
    if(prefersReduced || !window.gsap || !window.ScrollTrigger){ row.style.opacity = 1; return; }

    if(type === 'blinds'){
      var n = 10, bars = [];
      for(var i=0;i<n;i++){
        var bar = document.createElement('div');
        bar.setAttribute('aria-hidden','true');
        bar.style.position = 'absolute'; bar.style.top='0'; bar.style.bottom='0';
        bar.style.left = (i*100/n) + '%'; bar.style.width = (100/n + 0.4) + '%';
        bar.style.background = 'var(--bg)'; bar.style.zIndex = '5';
        bar.style.transformOrigin = (i % 2 === 0) ? 'top' : 'bottom';
        row.appendChild(bar); bars.push(bar);
      }
      gsap.to(bars, { scaleY:0, duration:0.75, ease:'power3.inOut', stagger:0.045, scrollTrigger:{ trigger:row, start:'top 78%' } });
      return;
    }
    if(type === 'wipe'){
      gsap.fromTo(row, {clipPath:'inset(0% 100% 0% 0%)', opacity:0}, { clipPath:'inset(0% 0% 0% 0%)', opacity:1, duration:1.1, ease:'power4.inOut', scrollTrigger:{ trigger:row, start:'top 78%' } });
      return;
    }
    if(type === 'focus'){
      gsap.fromTo(row, {opacity:0, scale:1.08, filter:'blur(14px)'}, {opacity:1, scale:1, filter:'blur(0px)', duration:1.1, ease:'power3.out', scrollTrigger:{ trigger:row, start:'top 78%' } });
      return;
    }
    if(type === 'split'){
      gsap.fromTo(row, {clipPath:'inset(0% 42% 0% 42%)', opacity:0}, {clipPath:'inset(0% 0% 0% 0%)', opacity:1, duration:1, ease:'power4.inOut', scrollTrigger:{ trigger:row, start:'top 78%' } });
      return;
    }
    if(type === 'flip'){
      gsap.fromTo(row, {opacity:0, rotateY:-30, transformOrigin:'left center'}, {opacity:1, rotateY:0, duration:1.1, ease:'power3.out', scrollTrigger:{ trigger:row, start:'top 78%' } });
      return;
    }
  });

  /* ---------- LIVE GITHUB DASHBOARD ---------- */
  var ghBarData = [3,5,2,4]; /* placeholder heights for the 3D analytics ornament, replaced with real language counts once the API responds */
  var langColors = {
    Python:'#3572A5', JavaScript:'#F1E05A', HTML:'#E34C26', CSS:'#563D7C',
    Java:'#B07219', C:'#555555', 'C++':'#F34B7D', TypeScript:'#3178C6',
    'Jupyter Notebook':'#DA5B0B', Shell:'#89E051'
  };
  function langColor(name){ return langColors[name] || '#8C6CFF'; }
  function timeAgo(dateStr){
    var days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if(days < 1) return 'today';
    if(days < 30) return days + 'd ago';
    var months = Math.floor(days/30);
    if(months < 12) return months + 'mo ago';
    return Math.floor(months/12) + 'y ago';
  }
  function countUp(el, target){
    if(prefersReduced){ el.textContent = target; return; }
    var startTime2 = performance.now(), duration = 1100;
    function step(now){
      var p = Math.min(1, (now - startTime2)/duration);
      el.textContent = Math.round(target * (1 - Math.pow(1-p, 3)));
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function activityColor(count){
    if(count <= 0) return 'rgba(90,100,160,0.1)';
    if(count === 1) return '#CDE4FF';
    if(count <= 3) return '#8FC2FF';
    if(count <= 6) return '#4C7DFF';
    return '#1FBFD6';
  }

  (function loadGithub(){
    var ghContent = document.getElementById('ghContent');
    Promise.all([
      fetch('https://api.github.com/users/AnsumanDalei').then(function(r){ if(!r.ok) throw new Error('user'); return r.json(); }),
      fetch('https://api.github.com/users/AnsumanDalei/repos?per_page=100&sort=updated').then(function(r){ if(!r.ok) throw new Error('repos'); return r.json(); }),
      fetch('https://api.github.com/users/AnsumanDalei/events/public?per_page=100').then(function(r){ return r.ok ? r.json() : []; }).catch(function(){ return []; })
    ]).then(function(results){
      var user = results[0], repos = results[1], events = results[2];
      if(!Array.isArray(repos)) throw new Error('bad repos payload');

      var langCounts = {};
      repos.forEach(function(r){ if(r.language){ langCounts[r.language] = (langCounts[r.language]||0)+1; } });
      var langEntries = Object.keys(langCounts).map(function(k){ return {name:k, count:langCounts[k]}; }).sort(function(a,b){ return b.count-a.count; }).slice(0,6);
      ghBarData = langEntries.map(function(l){ return l.count; });
      var totalLangCount = langEntries.reduce(function(s,l){ return s+l.count; }, 0) || 1;

      var recent = repos.slice().sort(function(a,b){ return new Date(b.pushed_at) - new Date(a.pushed_at); }).slice(0,5);

      /* real daily activity heatmap from public events, last ~90 days */
      var dayCounts = {};
      if(Array.isArray(events)){
        events.forEach(function(ev){
          var d = ev.created_at ? ev.created_at.slice(0,10) : null;
          if(d){ dayCounts[d] = (dayCounts[d]||0) + 1; }
        });
      }
      var today = new Date();
      var start = new Date(today); start.setDate(start.getDate() - 89);
      while(start.getDay() !== 0){ start.setDate(start.getDate() - 1); }
      var cells = [];
      var cursor = new Date(start);
      while(cursor <= today){
        var key = cursor.toISOString().slice(0,10);
        cells.push({date:key, count: dayCounts[key] || 0});
        cursor.setDate(cursor.getDate() + 1);
      }

      var html = ''
        + '<div class="gh-bento">'
        + '<div class="gh-stat glass"><div class="gh-stat-num" id="ghRepos">0</div><div class="gh-stat-label">Public Repos</div></div>'
        + '<div class="gh-stat glass"><div class="gh-stat-num" id="ghFollowers">0</div><div class="gh-stat-label">Followers</div></div>'
        + '<div class="gh-stat glass"><div class="gh-stat-num" id="ghFollowing">0</div><div class="gh-stat-label">Following</div></div>'
        + '<div class="gh-stat glass"><div class="gh-stat-num" id="ghYears">0</div><div class="gh-stat-label">Years on GitHub</div></div>'
        + '</div>'
        + '<div class="gh-cols">'
        + '<div class="gh-panel-inner glass"><div class="gh-col-title">Language Breakdown</div><div class="lang-stack-bar" id="ghLangBar"></div><div class="lang-legend" id="ghLangLegend"></div></div>'
        + '<div class="gh-panel-inner glass"><div class="gh-col-title">Recently Updated</div><div id="ghRepoList"></div></div>'
        + '</div>'
        + '<div class="gh-activity glass"><div class="activity-head"><span class="gh-col-title" style="margin:0;">Public Activity — Last 90 Days</span><span style="font-family:var(--font-mono); font-size:0.72rem; color:var(--ink-faint);" id="ghActivityTotal"></span></div>'
        + '<div class="activity-grid" id="ghActivityGrid"></div>'
        + '<div class="activity-legend">Less <span class="activity-cell" style="background:rgba(90,100,160,0.1)"></span><span class="activity-cell" style="background:#CDE4FF"></span><span class="activity-cell" style="background:#8FC2FF"></span><span class="activity-cell" style="background:#4C7DFF"></span><span class="activity-cell" style="background:#1FBFD6"></span> More</div></div>';
      ghContent.innerHTML = html;

      countUp(document.getElementById('ghRepos'), user.public_repos || 0);
      countUp(document.getElementById('ghFollowers'), user.followers || 0);
      countUp(document.getElementById('ghFollowing'), user.following || 0);
      var years = user.created_at ? Math.max(1, Math.floor((Date.now() - new Date(user.created_at).getTime())/31536000000)) : 1;
      countUp(document.getElementById('ghYears'), years);

      var barEl = document.getElementById('ghLangBar');
      var legendEl = document.getElementById('ghLangLegend');
      if(langEntries.length === 0){
        barEl.style.background = 'rgba(90,100,160,0.1)';
      } else {
        langEntries.forEach(function(l){
          var pct = (l.count/totalLangCount)*100;
          var seg = document.createElement('div');
          seg.className = 'lang-stack-seg';
          seg.style.width = '0%';
          seg.style.background = langColor(l.name);
          barEl.appendChild(seg);
          requestAnimationFrame(function(){ setTimeout(function(){ seg.style.width = pct + '%'; }, 60); });
          var leg = document.createElement('span');
          leg.className = 'lang-legend-item';
          leg.innerHTML = '<span class="dot" style="background:' + langColor(l.name) + '"></span>' + l.name + ' · ' + Math.round(pct) + '%';
          legendEl.appendChild(leg);
        });
      }

      var repoListEl = document.getElementById('ghRepoList');
      if(recent.length === 0){
        repoListEl.innerHTML = '<p style="color:var(--ink-faint); font-size:0.88rem;">No public repositories yet.</p>';
      } else {
        recent.forEach(function(r, idx2){
          var item = document.createElement('a');
          item.href = r.html_url; item.target = '_blank'; item.rel = 'noopener';
          item.className = 'repo-card';
          item.innerHTML = '<div class="repo-card-top"><span class="repo-name"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--ink-faint); flex-shrink:0;" aria-hidden="true"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>' + r.name + '</span><span class="repo-updated">' + timeAgo(r.pushed_at) + '</span></div><div class="repo-lang"><span class="dot" style="background:' + langColor(r.language || '') + '"></span>' + (r.language || 'Misc') + ' · <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> ' + (r.stargazers_count||0) + '</div>';
          repoListEl.appendChild(item);
          (function(el, i){ setTimeout(function(){ el.classList.add('in'); }, 90 * i); })(item, idx2);
        });
      }

      var gridEl = document.getElementById('ghActivityGrid');
      var totalEvents = cells.reduce(function(s,c){ return s + c.count; }, 0);
      document.getElementById('ghActivityTotal').textContent = totalEvents + ' public events';
      cells.forEach(function(c, idx){
        var cell = document.createElement('div');
        cell.className = 'activity-cell';
        cell.title = c.date + ' · ' + c.count + ' event' + (c.count===1?'':'s');
        cell.style.background = 'rgba(90,100,160,0.1)';
        gridEl.appendChild(cell);
        requestAnimationFrame(function(){ setTimeout(function(){ cell.style.background = activityColor(c.count); }, 4 * idx); });
      });
    }).catch(function(){
      ghContent.innerHTML = '<div class="gh-fallback">Live stats couldn\'t be loaded right now (GitHub API may be rate-limited). <a href="https://github.com/AnsumanDalei" target="_blank" rel="noopener" style="color:var(--blue-deep); text-decoration:underline;">View the profile directly →</a></div>';
    });
  })();

  /* ============================================================
     SHARED 3D LAYER — one WebGL renderer + canvas, scissor-rendered
     into a different Three.js scene per section (.gl-slot elements).
     This keeps every section's 3D visual genuinely distinct while
     using a single GL context for performance.
     ============================================================ */
  var glCanvas = document.getElementById('glCanvas');
  var glSlots = document.querySelectorAll('.gl-slot');
  var renderer3D = null;
  var sceneRegistry = [];
  var reduceGL = prefersReduced || !window.THREE || glSlots.length === 0;

  if(!reduceGL){
    try{
      renderer3D = new THREE.WebGLRenderer({canvas: glCanvas, alpha:true, antialias:false, powerPreference:'high-performance'});
      var isSmallScreen = window.innerWidth < 760;
      renderer3D.setPixelRatio(Math.min(window.devicePixelRatio, isSmallScreen ? 1.25 : 1.5));
      renderer3D.setScissorTest(true);
      renderer3D.setClearColor(0x000000, 0);
    } catch(e){ renderer3D = null; }
  }

  function baseScene(fov){
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(fov || 40, 1, 0.1, 50);
    camera.position.set(0, 0, 7);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    return {scene:scene, camera:camera};
  }
  function accentLight(color, intensity, pos){
    var l = new THREE.PointLight(color, intensity, 30);
    l.position.set(pos[0], pos[1], pos[2]);
    return l;
  }

  /* ---------- 5. PROJECTS — product launch panel ---------- */
  function buildProjects(){
    var b = baseScene(42);
    var scene = b.scene, camera = b.camera;
    scene.add(accentLight(0x4C7DFF, 2, [2,2,4]));
    var panel = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0), new THREE.MeshStandardMaterial({color:0xffffff, metalness:0.1, roughness:0.2, emissive:0x2f53e0, emissiveIntensity:0.15, side:THREE.DoubleSide, transparent:true, opacity:0.9}));
    scene.add(panel);
    var glow = new THREE.Mesh(new THREE.PlaneGeometry(1.66, 1.16), new THREE.MeshBasicMaterial({color:0x8C5CFF, transparent:true, opacity:0.16, side:THREE.DoubleSide}));
    glow.position.z = -0.02; scene.add(glow);
    var trail = [];
    var trailGeo = new THREE.SphereGeometry(0.025, 8, 8);
    for(var i=0;i<10;i++){
      var t = new THREE.Mesh(trailGeo, new THREE.MeshBasicMaterial({color:0x12C7DE, transparent:true, opacity:0.5}));
      t.userData = {y: -1.2 - i*0.15, speed: 0.5 + Math.random()*0.3, x:(Math.random()-0.5)*0.9};
      scene.add(t); trail.push(t);
    }
    return {scene:scene, camera:camera, tick:function(dt, elapsed){
      panel.rotation.y = Math.sin(elapsed*0.4) * 0.35;
      panel.rotation.x = Math.cos(elapsed*0.3) * 0.12;
      panel.position.y = Math.sin(elapsed*0.6) * 0.08;
      glow.rotation.copy(panel.rotation); glow.position.y = panel.position.y;
      trail.forEach(function(t){
        t.userData.y += dt * t.userData.speed;
        if(t.userData.y > 1.2){ t.userData.y = -1.2; t.userData.x = (Math.random()-0.5)*0.9; }
        t.position.set(t.userData.x, t.userData.y, -0.3);
        t.material.opacity = 0.55 * (1 - Math.abs(t.userData.y)/1.2);
      });
      camera.lookAt(0,0,0);
    }};
  }

  /* ---------- 6. GITHUB — data-driven analytics spikes ---------- */
  function buildGithub(){
    var b = baseScene(38);
    var scene = b.scene, camera = b.camera;
    scene.add(accentLight(0x12C7DE, 2.2, [2,2,4]));
    var group = new THREE.Group(); scene.add(group);
    var barColors = [0x4C7DFF, 0x8C5CFF, 0x12C7DE, 0xFF9F5A, 0x4C7DFF, 0x8C5CFF];
    var bars = [];
    var n = 5;
    for(var i=0;i<n;i++){
      var geo = new THREE.BoxGeometry(0.22, 1, 0.22);
      var mat = new THREE.MeshStandardMaterial({color:barColors[i%barColors.length], emissive:barColors[i%barColors.length], emissiveIntensity:0.3, metalness:0.2, roughness:0.4});
      var bar = new THREE.Mesh(geo, mat);
      bar.position.x = (i - (n-1)/2) * 0.32;
      group.add(bar); bars.push(bar);
    }
    return {scene:scene, camera:camera, tick:function(dt, elapsed){
      var data = (typeof ghBarData !== 'undefined' && ghBarData.length) ? ghBarData : [3,5,2,4,3];
      var max = Math.max.apply(null, data.concat([1]));
      bars.forEach(function(bar, i){
        var v = data[i % data.length] || 1;
        var target = 0.3 + (v/max) * 1.1;
        bar.scale.y += (target - bar.scale.y) * 0.06;
        bar.position.y = (bar.scale.y * 1) / 2 - 0.5;
      });
      group.rotation.y = Math.sin(elapsed*0.25) * 0.5;
      camera.lookAt(0,0,0);
    }};
  }

  /* ---------- 7. CONTACT — signal orb with trailing particles ---------- */
  function buildContact(){
    var b = baseScene(38);
    var scene = b.scene, camera = b.camera;
    scene.add(accentLight(0x8C5CFF, 2.2, [2,2,4]));
    var orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 2), new THREE.MeshStandardMaterial({color:0x8C5CFF, emissive:0x4a2ea8, emissiveIntensity:0.5, metalness:0.3, roughness:0.2, transparent:true, opacity:0.9}));
    scene.add(orb);
    var particles = [];
    var pGeo = new THREE.SphereGeometry(0.028, 8, 8);
    for(var i=0;i<14;i++){
      var p = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({color:0x12C7DE, transparent:true, opacity:0.7}));
      p.userData = {angle: (i/14)*Math.PI*2, radius: 0.75 + (i%3)*0.12, speed: 0.5 + (i%4)*0.15};
      scene.add(p); particles.push(p);
    }
    return {scene:scene, camera:camera, tick:function(dt, elapsed){
      orb.rotation.y += dt * 0.4;
      orb.position.y = Math.sin(elapsed*0.8) * 0.1;
      particles.forEach(function(p){
        var a = elapsed * p.userData.speed + p.userData.angle;
        p.position.set(Math.cos(a)*p.userData.radius, Math.sin(a*1.3)*0.3, Math.sin(a)*p.userData.radius);
      });
      camera.lookAt(0,0,0);
    }};
  }

  /* ---------- register + render ---------- */
  function registerScene(key, builder){
    var el = document.querySelector('.gl-slot[data-scene="' + key + '"]');
    if(!el || !renderer3D) return;
    var built = builder();
    sceneRegistry.push({el:el, scene:built.scene, camera:built.camera, tick:built.tick});
  }

  if(renderer3D){
    registerScene('projects', buildProjects);
    registerScene('github', buildGithub);
    registerScene('contact', buildContact);

    function resizeGL(){
      renderer3D.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', resizeGL);
    resizeGL();

    var glClock = new THREE.Clock();
    var glFrameInterval = 1 / 40; // cap decorative 3D scenes at ~40fps instead of 60fps — imperceptible for slow ambient motion, meaningfully cheaper on modest laptops
    var glTimeSinceRender = 0;
    function renderGL(){
      requestAnimationFrame(renderGL);
      if(document.hidden) return;
      var dt = Math.min(glClock.getDelta(), 0.05);
      glTimeSinceRender += dt;
      if(glTimeSinceRender < glFrameInterval) return;
      glTimeSinceRender = 0;
      var elapsed = glClock.getElapsedTime();
      var winW = window.innerWidth, winH = window.innerHeight;
      var canvasH = glCanvas.clientHeight || winH;
      renderer3D.setScissorTest(false);
      renderer3D.clear();
      renderer3D.setScissorTest(true);
      sceneRegistry.forEach(function(item){
        var rect = item.el.getBoundingClientRect();
        if(rect.width <= 2 || rect.height <= 2) return;
        if(rect.bottom < -50 || rect.top > winH + 50 || rect.right < -50 || rect.left > winW + 50) return;
        item.tick(dt, elapsed);
        item.camera.aspect = rect.width / rect.height;
        item.camera.updateProjectionMatrix();
        var left = Math.max(0, rect.left);
        var bottom = canvasH - rect.bottom;
        renderer3D.setViewport(rect.left, bottom, rect.width, rect.height);
        renderer3D.setScissor(rect.left, bottom, rect.width, rect.height);
        renderer3D.render(item.scene, item.camera);
      });
    }
    renderGL();
  }

  /* ---------- CONTACT FORM ---------- */
  var contactForm = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');
  var sendBtn = document.getElementById('sendBtn');

  function showStatus(msg, ok){
    formStatus.textContent = msg;
    formStatus.className = 'form-status show ' + (ok ? 'ok' : 'err');
  }

  function mailtoFallback(data){
    var body = 'Company: ' + data.company + '\n' +
               'Phone: ' + data.phone + '\n' +
               'Reason: ' + data.reason + '\n\n' +
               data.message + '\n\n— ' + data.from_name + ' (' + data.reply_to + ')';
    var url = 'mailto:ansumandalei2005@gmail.com?subject=' + encodeURIComponent(data.subject || 'Portfolio contact') + '&body=' + encodeURIComponent(body);
    window.location.href = url;
  }

  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      formStatus.className = 'form-status';

      var data = {
        from_name: document.getElementById('cf-name').value.trim(),
        company: document.getElementById('cf-company').value.trim() || 'Not specified',
        reply_to: document.getElementById('cf-email').value.trim(),
        phone: document.getElementById('cf-phone').value.trim() || 'Not specified',
        subject: document.getElementById('cf-subject').value.trim(),
        reason: document.getElementById('cf-reason').value,
        message: document.getElementById('cf-message').value.trim()
      };

      if(!data.from_name || !data.reply_to || !data.subject || !data.reason || !data.message){
        showStatus('Please fill in all required fields.', false);
        return;
      }

      sendBtn.disabled = true;
      var originalHTML = sendBtn.innerHTML;
      sendBtn.innerHTML = '<svg class="btn-spinner-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 2a10 10 0 0 1 10 10"></path></svg>&nbsp; Sending…';

      if(EMAILJS_READY){
        window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data).then(function(){
          showStatus('Message sent — thanks for reaching out! I\'ll reply within 1–2 business days.', true);
          contactForm.reset();
        }).catch(function(){
          showStatus('Something went wrong sending that. Opening your email app instead…', false);
          setTimeout(function(){ mailtoFallback(data); }, 900);
        }).finally(function(){
          sendBtn.disabled = false;
          sendBtn.innerHTML = originalHTML;
        });
      } else {
        setTimeout(function(){
          showStatus('Email service isn\'t configured yet — opening your email app instead…', false);
          mailtoFallback(data);
          sendBtn.disabled = false;
          sendBtn.innerHTML = originalHTML;
        }, 500);
      }
    });
  }

  /* ---------- SCHEDULE INTERVIEW ---------- */
  var scheduleBtn = document.getElementById('scheduleBtn');
  if(scheduleBtn){
    scheduleBtn.addEventListener('click', function(){
      smoothScrollTo('contact');
      setTimeout(function(){
        var reasonEl = document.getElementById('cf-reason');
        var subjectEl = document.getElementById('cf-subject');
        if(reasonEl) reasonEl.value = 'Schedule an Interview';
        if(subjectEl && !subjectEl.value){ subjectEl.value = 'Interview Request'; }
        var nameEl = document.getElementById('cf-name');
        if(nameEl) nameEl.focus();
      }, 550);
    });
  }

})();
