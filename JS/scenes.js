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
      <span class="eyebrow fu" data-d="50">UI/UX Designer &mdash; Melbourne AU &mdash; 2025</span>
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

  /* 02 — WEIRD / PRECISE — ACID bg */
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

  /* 03 — PHILOSOPHY — RED bg */
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

  /* 04 — CRAFT — WHITE bg */
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
        <div class="s-cell"><span class="s-num">05</span><span class="s-name">Prototyping</span>  <span class="s-desc">Show, don't tell. Interactive, always.</span></div>
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

  /* 06 — PROJECTS — 2x2 card grid, full card clickable */
  { light: false, build: function(){ return `
    <div class="scene jstart bg-dim" data-id="projects">
      <div class="bg-num">VI</div>
      <span class="eyebrow fu" data-d="20">Chapter IV &mdash; Works</span>
      <div class="p-grid">
        <div class="p-card" onclick="window.open('projects/essentially-australia.html','_blank')">
          <span class="p-card-num">01</span>
          <span class="p-card-name">Essentially Australia</span>
          <span class="p-card-meta">UX Audit + Full Redesign &mdash; 2025</span>
          <span class="p-card-arrow">&#8599;</span>
        </div>
        <div class="p-card" onclick="window.open('https://casepopau.com','_blank')">
          <span class="p-card-num">02</span>
          <span class="p-card-name">Casepop AU</span>
          <span class="p-card-meta">E-Commerce &mdash; 2024</span>
          <span class="p-card-arrow">&#8599;</span>
        </div>
        <div class="p-card" onclick="window.open('https://www.figma.com/proto/KxE7gaFjQ4RUOPTcWcLCYb/Tactibrawl?node-id=1-2&starting-point-node-id=1%3A2','_blank')">
          <span class="p-card-num">03</span>
          <span class="p-card-name">Tactibrawl</span>
          <span class="p-card-meta">Game UI + Design &mdash; 2024</span>
          <span class="p-card-arrow">&#8599;</span>
        </div>
        <div class="p-card" style="opacity:.35;pointer-events:none">
          <span class="p-card-num">04</span>
          <span class="p-card-name">Coming Soon.</span>
          <span class="p-card-meta">Something's brewing &mdash; 2025</span>
        </div>
      </div>
    </div>`; }
  },

  /* 07 — ABOUT — black left / dim right */
  { light: false, build: function(){ return `
    <div class="scene split" data-id="about">
      <div class="split-l">
        <div class="bg-num">VII</div>
        <span class="eyebrow fu" data-d="40">Chapter V &mdash; The Weird One</span>
        <span class="mega sh-white" style="font-size:clamp(58px,9vw,130px);line-height:.92">
          <span class="word"><span class="wi" data-d="80">PRECISE.</span></span><br>
          <span class="word"><span class="wi t-acid sh-acid" data-d="210">WEIRD.</span></span><br>
          <span class="word"><span class="wi ol-white" data-d="340">ALIVE.</span></span>
        </span>
      </div>
      <div class="split-r split-r-dim">
        <p class="body-p sl" data-d="80">I'm Angbo &mdash; a UI/UX designer based in Melbourne who grew up obsessing over game cutscenes, ancient texts, and the 1px decisions that separate good from unforgettable.</p>
        <p class="body-p sl" data-d="170">My design language lives somewhere between a boss-fight HUD and a scripture verse &mdash; precise, weird, and impossible to ignore. I don't just make things look good. I make them feel like they breathe.</p>
        <p class="body-p sl" data-d="250">Available for freelance and full-time. Probably overthinking a micro-interaction right now.</p>
        <div class="tag-row fu" data-d="330">
          <span class="tag">Figma</span><span class="tag">Protopie</span><span class="tag">After Effects</span><span class="tag">Framer</span><span class="tag">Webflow</span><span class="tag">HTML/CSS</span><span class="tag">Game UI</span><span class="tag">Typography</span>
        </div>
      </div>
    </div>`; }
  },

  /* 08 — CONTACT — acid bg */
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
      <span class="footnote fu" data-d="880">&copy; 2025 Angbo Xie &mdash; All rights reserved</span>
    </div>`; }
  }

];