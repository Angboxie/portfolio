function ww(txt, base, step) {
  base = base||0; step = step||70;
  return txt.split(' ').map(function(w,i){
    return '<span class="word"><span class="wi" data-d="'+(base+i*step)+'">'+w+'</span></span>';
  }).join(' ');
}

window.SCENES = [

  /* 00 — TITLE */
  { light: false, build: function(){ return `
    <div class="scene jend" data-id="title">
      <div class="bg-num">AX</div>
      <span class="eyebrow fu" data-d="50">UI/UX Designer, Melbourne AU &mdash; 2026</span>
      <span class="mega sh-white" style="font-size:clamp(86px,15.5vw,225px)">${ww('ANGBO',0,55)}</span>
      <span class="mega" style="font-size:clamp(86px,15.5vw,225px)">
        <span class="word"><span class="wi ol-white sh-white" data-d="130">XIE</span></span><span class="word"><span class="wi t-acid sh-acid" data-d="200" style="font-size:clamp(96px,17.5vw,248px)">.</span></span>
      </span>
      <span class="subtext fu" data-d="380">A story about making things feel alive.<br>Click &mdash; Space &mdash; Arrow to begin.</span>
    </div>`; }
  },

  /* 01 — ORIGIN */
  { light: false, build: function(){ return `
    <div class="scene jmid" data-id="origin" style="align-items:center;text-align:center">
      <div class="bg-num" style="right:auto;left:50%;transform:translateX(-50%)">I</div>
      <span class="eyebrow fu" data-d="30" style="text-align:center">Chapter I &mdash; Origin</span>
      <span class="mega sh-white" style="font-size:clamp(68px,12vw,180px)">${ww('IN THE BEGINNING WAS THE',60,50)}</span>
      <span class="mega t-acid sh-acid" style="font-size:clamp(96px,17vw,256px)">
        <span class="word"><span class="wi" data-d="480">PIXEL.</span></span>
      </span>
    </div>`; }
  },

  /* 02 — WEIRD / PRECISE */
  { light: true, build: function(){ return `
    <div class="scene split bg-acid" data-id="weirdo">
      <div class="split-l">
        <div class="bg-num">II</div>
        <span class="eyebrow fu" data-d="40">Chapter I &mdash; continued</span>
        <span class="mega sh-black" style="font-size:clamp(62px,10vw,145px)">
          <span class="word"><span class="wi t-black" data-d="80">I AM</span></span><br>
          <span class="word"><span class="wi ol-black sh-black" data-d="210">WEIRD.</span></span><br>
          <span class="word"><span class="wi t-black" data-d="340">I AM</span></span><br>
          <span class="word"><span class="wi t-black" data-d="460">PRECISE.</span></span>
        </span>
      </div>
      <div class="split-r">
        <div class="raw-box sc" data-d="220">
          [ INFLUENCES ]<br>
          &mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;<br>
          God of War UI<br>
          Elden Ring menus<br>
          Book of Revelation<br>
          Dieter Rams<br>
          Awwwards 3am binges<br>
          &mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;<br>
          OUTPUT:<br>things that feel alive.
        </div>
      </div>
    </div>`; }
  },

  /* 03 — PHILOSOPHY */
  { light: false, build: function(){ return `
    <div class="scene jmid bg-red" data-id="philosophy">
      <div class="bg-num">III</div>
      <span class="eyebrow fu" data-d="30">Chapter II &mdash; Belief</span>
      <span class="mega-sm">${ww('IF YOUR INTERFACE',60,46)}</span>
      <span class="mega-sm">${ww("DOESN'T MAKE SOMEONE",210,46)}</span>
      <span class="mega ol-white sh-white" style="font-size:clamp(96px,16.5vw,240px)">
        <span class="word"><span class="wi" data-d="420">FEEL</span></span>
      </span>
      <span class="mega-sm">${ww('SOMETHING\u2014',560,46)}</span>
      <span class="mega-sm t-white sh-white">
        <span class="word"><span class="wi" data-d="660">WE'RE NOT DONE YET.</span></span>
      </span>
    </div>`; }
  },

  /* 04 — CRAFT */
  { light: true, build: function(){ return `
    <div class="scene jstart bg-white" data-id="craft">
      <div class="bg-num">IV</div>
      <span class="eyebrow fu" data-d="30">Chapter III &mdash; Craft</span>
      <span class="mega fu sh-black t-black" style="font-size:clamp(48px,6.5vw,90px)" data-d="90">What I do.</span>
      <div class="s-grid">
        <div class="s-cell"><span class="s-num">01</span><span class="s-name">Interface Design</span><span class="s-desc">Pixel-level precision. 1px always matters.</span></div>
        <div class="s-cell"><span class="s-num">02</span><span class="s-name">Motion &amp; Animation</span><span class="s-desc">Fancy but never gratuitous. Game-engine energy.</span></div>
        <div class="s-cell"><span class="s-num">03</span><span class="s-name">UX Strategy</span><span class="s-desc">Empathy first. Obsessive iteration. Ship.</span></div>
        <div class="s-cell"><span class="s-num">04</span><span class="s-name">Design Systems</span><span class="s-desc">Consistency is a love language. Fluent.</span></div>
        <div class="s-cell"><span class="s-num">05</span><span class="s-name">Prototyping</span><span class="s-desc">Show, don't tell. Interactive, always.</span></div>
        <div class="s-cell"><span class="s-num">06</span><span class="s-name">User Research</span><span class="s-desc">Real humans, real pain. I listen first.</span></div>
      </div>
    </div>`; }
  },

  /* 05 — WORK INTRO */
  { light: false, build: function(){ return `
    <div class="scene jend" data-id="work-intro">
      <div class="bg-num">V</div>
      <span class="eyebrow fu" data-d="30">Chapter IV &mdash; Works</span>
      <span class="mega sh-white" style="font-size:clamp(80px,14vw,208px)">
        <span class="word"><span class="wi" data-d="60">SELECTED</span></span>
      </span>
      <span class="mega" style="font-size:clamp(80px,14vw,208px)">
        <span class="word"><span class="wi ol-white" data-d="180">PROJ</span></span><span class="word"><span class="wi t-acid sh-acid" data-d="245">ECTS.</span></span>
      </span>
      <div class="mq-wrap fu" data-d="430">
        <div class="mq-track">
          <span>UX Audit</span><span class="dot">/</span>
          <span>E-Commerce</span><span class="dot">/</span>
          <span>Game UI</span><span class="dot">/</span>
          <span>Full Redesign</span><span class="dot">/</span>
          <span>UX Audit</span><span class="dot">/</span>
          <span>E-Commerce</span><span class="dot">/</span>
          <span>Game UI</span><span class="dot">/</span>
          <span>Full Redesign</span><span class="dot">/</span>
        </div>
      </div>
    </div>`; }
  },

  /* 06 — PROJECTS — magazine spread */
  { light: false, build: function(){ return `
    <div class="scene jstart" data-id="projects" style="padding:5.4rem 6vw 8.5rem;overflow:hidden;background:#0a0a0a;">
      <style>
        .mg-top {
          display:flex;align-items:baseline;justify-content:space-between;
          margin-bottom:1.2rem;
        }
        .mg-count {
          font-family:var(--mono);font-size:9px;letter-spacing:.3em;
          opacity:.2;
        }

        .mg-list { display:flex;flex-direction:column;gap:0;width:100%; }

        .mg-item {
          display:block;text-decoration:none;color:var(--c2);
          padding:1.4rem 0;
          border-bottom:1px solid rgba(240,237,230,.07);
          position:relative;overflow:hidden;cursor:none;
          opacity:0;transform:translateY(28px);
          transition:opacity .55s ease,transform .55s cubic-bezier(.16,1,.3,1);
        }
        .mg-item:first-child { border-top:1px solid rgba(240,237,230,.07); }
        .mg-item.in { opacity:1;transform:translateY(0); }

        /* underline sweep */
        .mg-item::after {
          content:'';position:absolute;bottom:0;left:0;right:0;height:1px;
          background:var(--c3);transform:scaleX(0);transform-origin:left;
          transition:transform .45s cubic-bezier(.77,0,.175,1);
        }
        .mg-item:hover::after { transform:scaleX(1); }

        .mg-inner {
          display:flex;align-items:baseline;gap:1.8rem;
        }

        .mg-num {
          font-family:var(--display);
          font-size:clamp(48px,7vw,100px);
          line-height:1;
          color:var(--c3);opacity:.12;
          flex-shrink:0;width:clamp(56px,8vw,110px);
          transition:opacity .22s;
        }
        .mg-item:hover .mg-num { opacity:.5; }

        .mg-body { flex:1;display:flex;flex-direction:column;gap:.3rem; }

        .mg-name {
          font-family:var(--display);
          font-size:clamp(36px,6.5vw,100px);
          line-height:.9;letter-spacing:.01em;
          transition:letter-spacing .45s cubic-bezier(.16,1,.3,1),color .2s;
          display:block;
        }
        .mg-item:hover .mg-name { letter-spacing:.05em;color:var(--c3); }

        .mg-sub {
          display:flex;align-items:center;gap:1.2rem;
          font-family:var(--mono);font-size:8px;letter-spacing:.2em;
          text-transform:uppercase;opacity:.22;
          transition:opacity .2s;margin-top:.2rem;
        }
        .mg-item:hover .mg-sub { opacity:.55; }
        .mg-sub-dot { width:3px;height:3px;background:var(--c3);border-radius:50%;opacity:.6; }

        .mg-arrow {
          position:absolute;right:0;top:50%;transform:translateY(-50%) translate(-8px,8px);
          font-family:var(--display);font-size:28px;color:var(--c3);
          opacity:0;transition:opacity .2s,transform .2s;
        }
        .mg-item:hover .mg-arrow { opacity:1;transform:translateY(-50%) translate(0,0); }

        /* offset alternates for staggered rhythm */
        .mg-item:nth-child(2) .mg-inner { padding-left:clamp(20px,4vw,60px); }
        .mg-item:nth-child(3) .mg-inner { padding-left:clamp(10px,2vw,30px); }

        .mg-soon { opacity:.1!important;transform:none!important;pointer-events:none; }
      </style>

      <div class="mg-top">
        <span class="eyebrow fu" data-d="20">Chapter IV &mdash; Works</span>
        <span class="mg-count fu" data-d="60">03 SELECTED</span>
      </div>

      <div class="mg-list">
        <a class="mg-item p-card" href="projects/essentially-australia.html" target="_blank">
          <div class="mg-inner">
            <span class="mg-num">01</span>
            <div class="mg-body">
              <span class="mg-name">ESSENTIALLY AUSTRALIA</span>
              <div class="mg-sub"><span>UX Audit + Redesign</span><span class="mg-sub-dot"></span><span>2025</span></div>
            </div>
          </div>
          <span class="mg-arrow">&#8599;</span>
        </a>
        <a class="mg-item p-card" href="projects/casepop.html" target="_blank">
          <div class="mg-inner">
            <span class="mg-num">02</span>
            <div class="mg-body">
              <span class="mg-name">CASEPOP AU</span>
              <div class="mg-sub"><span>E-Commerce</span><span class="mg-sub-dot"></span><span>2024</span></div>
            </div>
          </div>
          <span class="mg-arrow">&#8599;</span>
        </a>
        <a class="mg-item p-card" href="projects/tactibrawl.html" target="_blank">
          <div class="mg-inner">
            <span class="mg-num">03</span>
            <div class="mg-body">
              <span class="mg-name">TACTIBRAWL</span>
              <div class="mg-sub"><span>Game UI + Design</span><span class="mg-sub-dot"></span><span>2024</span></div>
            </div>
          </div>
          <span class="mg-arrow">&#8599;</span>
        </a>
        <div class="mg-item mg-soon">
          <div class="mg-inner">
            <span class="mg-num">04</span>
            <div class="mg-body">
              <span class="mg-name">COMING SOON</span>
              <div class="mg-sub"><span>Something's brewing</span><span class="mg-sub-dot"></span><span>2026</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>`; }
  },

  /* 07 — ABOUT */
  { light: false, build: function(){ return `
    <div class="scene" data-id="about" style="padding:0;overflow:hidden;background:#0d0b08;">
      <style>
        .ab-wrap { position:absolute;inset:0;display:flex; }

        /* LEFT — photo column */
        .ab-left {
          flex:0 0 45%;position:relative;overflow:hidden;
        }
        .ab-photo {
          position:absolute;inset:0;width:100%;height:100%;
          object-fit:cover;object-position:center 30%;
          filter:sepia(20%) contrast(1.08) brightness(.9);
          opacity:0;transform:scale(1.04);
          transition:opacity .9s ease,transform 1.2s ease;
        }
        .ab-photo.in { opacity:1;transform:scale(1); }
        /* vignette + right edge fade */
        .ab-left::after {
          content:'';position:absolute;inset:0;
          background:
            linear-gradient(to right, transparent 55%, #0d0b08 100%),
            linear-gradient(to top, rgba(13,11,8,.6) 0%, transparent 30%),
            linear-gradient(to bottom, rgba(13,11,8,.4) 0%, transparent 20%);
        }
        .ab-photo-num {
          position:absolute;bottom:2rem;left:2rem;z-index:2;
          font-family:var(--display);font-size:clamp(80px,12vw,160px);
          line-height:1;color:rgba(240,230,200,.06);letter-spacing:-.02em;
          pointer-events:none;
        }

        /* RIGHT — text column */
        .ab-right {
          flex:1;display:flex;flex-direction:column;justify-content:flex-end;
          padding:5.8rem 6vw 8.5rem 5vw;overflow:hidden;position:relative;
        }

        .ab-kicker {
          font-family:var(--mono);font-size:8px;letter-spacing:.32em;
          text-transform:uppercase;color:#c8a870;opacity:.6;
          margin-bottom:1rem;display:block;
        }

        .ab-headline {
          font-family:var(--display);
          font-size:clamp(52px,8.5vw,128px);
          line-height:.88;letter-spacing:.015em;
          margin-bottom:1.2rem;display:block;color:#f0e8d8;
        }
        .ab-headline .t-stone { color:#a89878; }
        .ab-headline .ol-stone { -webkit-text-stroke:2px #a89878;color:transparent; }

        .ab-divider {
          width:0;height:1px;background:#a89878;opacity:.25;
          margin-bottom:1.4rem;
          transition:width .6s .1s ease;
        }
        .ab-divider.in { width:100%; }

        .ab-bio {
          font-family:var(--mono);font-weight:300;
          font-size:clamp(10px,.88vw,12px);line-height:2;
          color:#d8cdb8;opacity:.45;max-width:400px;margin-bottom:.6rem;
        }

        .ab-stats {
          display:flex;gap:2.5rem;margin-top:1.4rem;flex-wrap:wrap;
          border-top:1px solid rgba(200,168,112,.12);padding-top:1.2rem;
        }
        .ab-stat { display:flex;flex-direction:column;gap:.3rem; }
        .ab-stat-l {
          font-family:var(--mono);font-size:7px;letter-spacing:.28em;
          text-transform:uppercase;color:#c8a870;opacity:.5;
        }
        .ab-stat-v {
          font-family:var(--mono);font-size:11px;color:#d8cdb8;opacity:.65;letter-spacing:.06em;
        }

        .ab-tags { display:flex;flex-wrap:wrap;gap:.4rem;margin-top:1.2rem; }
        .ab-tag {
          font-family:var(--mono);font-size:8px;letter-spacing:.1em;
          text-transform:uppercase;border:1px solid rgba(200,168,112,.2);
          color:#c8a870;padding:.25rem .65rem;opacity:.35;
          transition:opacity .18s,border-color .18s;
        }
        .ab-tag:hover{opacity:.9;border-color:#c8a870;}

        /* available badge */
        .ab-badge {
          position:absolute;top:5.8rem;right:6vw;
          display:flex;align-items:center;gap:.5rem;
          font-family:var(--mono);font-size:8px;letter-spacing:.2em;
          color:#c8a870;opacity:.5;
        }
        .ab-badge-dot {
          width:5px;height:5px;background:#c8a870;border-radius:50%;
          animation:ab-pulse 2.5s ease-in-out infinite;
        }
        @keyframes ab-pulse{0%,100%{opacity:1}50%{opacity:.15}}
      </style>

      <div class="ab-wrap">
        <div class="ab-left">
          <img class="ab-photo fu" src="Assets/angbo.png" alt="Angbo Xie" data-d="0"/>
          <span class="ab-photo-num">VII</span>
        </div>

        <div class="ab-right">
          <div class="ab-badge fu" data-d="200">
            <span class="ab-badge-dot"></span>AVAILABLE
          </div>
          <span class="ab-kicker fu" data-d="80">Chapter V &mdash; The Weird One</span>
          <span class="ab-headline">
            <span class="word"><span class="wi" data-d="140">PRECISE.</span></span><br>
            <span class="word"><span class="wi t-stone" data-d="230">WEIRD.</span></span><br>
            <span class="word"><span class="wi ol-stone" data-d="320">ALIVE.</span></span>
          </span>
          <div class="ab-divider fu" data-d="350"></div>
          <p class="ab-bio sl" data-d="260">UI/UX designer obsessing over game cutscenes, ancient texts, and the 1px decisions that separate good from unforgettable.</p>
          <p class="ab-bio sl" data-d="320">Design language somewhere between a boss-fight HUD and a scripture verse. I make things feel like they breathe.</p>
          <div class="ab-stats fu" data-d="380">
            <div class="ab-stat"><span class="ab-stat-l">Base</span><span class="ab-stat-v">Melbourne, AU</span></div>
            <div class="ab-stat"><span class="ab-stat-l">Role</span><span class="ab-stat-v">UI/UX Designer</span></div>
            <div class="ab-stat"><span class="ab-stat-l">Status</span><span class="ab-stat-v">Open to Work</span></div>
          </div>
          <div class="ab-tags fu" data-d="440">
            <span class="ab-tag">Figma</span><span class="ab-tag">Protopie</span><span class="ab-tag">After Effects</span><span class="ab-tag">Framer</span><span class="ab-tag">Webflow</span><span class="ab-tag">HTML/CSS</span><span class="ab-tag">Game UI</span><span class="ab-tag">Typography</span>
          </div>
        </div>
      </div>
    </div>`; }
  },

  /* 08 — CONTACT */
  { light: true, build: function(){ return `
    <div class="scene jend bg-acid" data-id="contact">
      <div class="bg-num" style="color:rgba(10,10,10,.04)">VIII</div>
      <span class="eyebrow fu" data-d="40">Chapter VI &mdash; Let's Begin</span>
      <span class="mega sh-black t-black" style="font-size:clamp(60px,10vw,146px)">${ww('GOT A PROJECT',60,44)}</span>
      <span class="mega sh-black t-black" style="font-size:clamp(60px,10vw,146px)">${ww('THAT NEEDS TO',290,44)}</span>
      <span class="mega" style="font-size:clamp(68px,12vw,170px)">
        <span class="word"><span class="wi ol-black sh-black" data-d="530">FEEL</span></span>
        <span class="word"><span class="wi t-black sh-black" data-d="600">ALIVE?</span></span>
      </span>
      <div class="clinks fu" data-d="740">
        <a href="mailto:xie109714@gmail.com" target="_blank">Email &#8599;</a>
        <a href="https://au.linkedin.com/in/angboxie" target="_blank">LinkedIn &#8599;</a>
        <a href="https://instagram.com/xieangbo" target="_blank">Instagram &#8599;</a>
        <a href="Assets/resume.pdf" target="_blank">Resume &#8595;</a>
      </div>
      <span class="footnote fu" data-d="880">&copy; 2026 Angbo Xie &mdash; All rights reserved</span>
    </div>`; }
  }

];