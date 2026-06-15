/* ══════════════════════════════
   PYTHON SLIDESHOW DEMO
══════════════════════════════ */
let pySlideIdx=0, pyRunning=false, pyTimer=null, pyProgress=0, pyProgressTimer=null;
const pySlides=document.querySelectorAll('.slide');

function updateThumbs(){
  document.querySelectorAll('.slide-thumb').forEach((t,i)=>{
    if(i===pySlideIdx){
      t.style.border='2px solid var(--accent)';
      t.style.opacity='1';
      t.style.transform='scale(1.12)';
    } else {
      t.style.border='2px solid transparent';
      t.style.opacity='0.45';
      t.style.transform='scale(1)';
    }
  });
}

function showPySlide(i){
  pySlides.forEach((s,idx)=>s.style.opacity=idx===i?'1':'0');
  const counter=document.getElementById('slideCounter');
  if(counter) counter.textContent=(i+1)+' / '+pySlides.length;
  updateThumbs();
}

function pyGoTo(i){
  pySlideIdx=i;
  showPySlide(pySlideIdx);
  stepProgress(2000);
}

function stepProgress(duration){
  clearInterval(pyProgressTimer);
  pyProgress=0;
  const bar=document.getElementById('slideProgress');
  const step=100/(duration/50);
  pyProgressTimer=setInterval(()=>{
    pyProgress+=step;
    if(bar) bar.style.width=Math.min(pyProgress,100)+'%';
    if(pyProgress>=100) clearInterval(pyProgressTimer);
  },50);
}

function pyNext(){
  pySlideIdx=(pySlideIdx+1)%pySlides.length;
  showPySlide(pySlideIdx);
  stepProgress(2000);
}

function togglePySlideshow(){
  const btn=document.getElementById('pyPlayBtn');
  if(pyRunning){
    clearInterval(pyTimer);
    clearInterval(pyProgressTimer);
    pyRunning=false;
    if(btn){btn.textContent='▶  Play Slideshow';btn.style.background='linear-gradient(135deg,var(--purple),var(--purple-light))';}
    const bar=document.getElementById('slideProgress');
    if(bar) bar.style.width='0%';
  } else {
    pyRunning=true;
    if(btn){btn.textContent='⏹  Stop';btn.style.background='linear-gradient(135deg,#6b21a8,#9333ea)';}
    pyNext();
    pyTimer=setInterval(pyNext,2000);
  }
}

/* ══════════════════════════════
   BG CANVAS — animated grid + orbs
══════════════════════════════ */
(function(){
  const c=document.getElementById('bgCanvas');
  const ctx=c.getContext('2d');
  let W,H,t=0;
  function resize(){W=c.width=window.innerWidth;H=c.height=window.innerHeight;}
  resize();
  window.addEventListener('resize',resize);

  // Grid lines
  function drawGrid(){
    const step=60,speed=0.4;
    const offset=(t*speed)%step;
    ctx.strokeStyle='rgba(124,58,237,0.07)';
    ctx.lineWidth=0.5;
    ctx.beginPath();
    for(let x=offset;x<W;x+=step){ctx.moveTo(x,0);ctx.lineTo(x,H);}
    for(let y=offset;y<H;y+=step){ctx.moveTo(0,y);ctx.lineTo(W,y);}
    ctx.stroke();
  }

  // Orbs
  const orbs=[
    {x:0.15,y:0.2,r:280,c:'rgba(124,58,237,',speed:0.0004},
    {x:0.85,y:0.15,r:220,c:'rgba(168,85,247,',speed:0.0006},
    {x:0.5, y:0.9, r:200,c:'rgba(124,58,237,',speed:0.0005},
    {x:0.7, y:0.55,r:160,c:'rgba(192,132,252,',speed:0.0007},
  ];
  function drawOrbs(){
    orbs.forEach(o=>{
      const px=W*(o.x+Math.sin(t*o.speed*1.3)*0.08);
      const py=H*(o.y+Math.cos(t*o.speed)*0.06);
      const grad=ctx.createRadialGradient(px,py,0,px,py,o.r);
      grad.addColorStop(0,o.c+'0.14)');
      grad.addColorStop(1,o.c+'0)');
      ctx.fillStyle=grad;
      ctx.beginPath();ctx.arc(px,py,o.r,0,Math.PI*2);ctx.fill();
    });
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    drawGrid();
    drawOrbs();
    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════
   AI TEXT CANVAS — scrolling "AI" flood
══════════════════════════════ */
(function(){
  const c=document.getElementById('aiTextCanvas');
  const ctx=c.getContext('2d');
  let W,H;
  function resize(){W=c.width=window.innerWidth;H=c.height=window.innerHeight;}
  resize();
  window.addEventListener('resize',resize);

  const words=['AI','AI','AI','ML','GPT','LLM','AGI','AI','NLP','AI'];
  const cols=[];
  const fontSize=18;
  const colW=72;

  function initCols(){
    cols.length=0;
    const count=Math.ceil(W/colW)+2;
    for(let i=0;i<count;i++){
      cols.push({
        x:i*colW + Math.random()*colW*0.4,
        y:Math.random()*-H,
        speed:0.18+Math.random()*0.22,
        alpha:0.3+Math.random()*0.7,
        wordIdx:Math.floor(Math.random()*words.length),
        gap:Math.floor(2+Math.random()*4),
        step:0,
      });
    }
  }
  initCols();
  window.addEventListener('resize',initCols);

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.font=`700 ${fontSize}px 'Orbitron',monospace`;
    ctx.textBaseline='top';

    cols.forEach(col=>{
      // fade based on position
      const alpha=col.alpha*(0.5+0.5*Math.sin(col.y/80));
      ctx.fillStyle=`rgba(168,85,247,${Math.min(alpha,1)})`;
      ctx.fillText(words[col.wordIdx],col.x,col.y);
      col.y+=col.speed;
      col.step++;
      if(col.step%col.gap===0) col.wordIdx=(col.wordIdx+1)%words.length;
      if(col.y>H+fontSize){col.y=Math.random()*-100;col.alpha=0.3+Math.random()*0.7;}
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════
   CURSOR
══════════════════════════════ */
const cursorDot=document.getElementById('cursorDot');
const cursorRing=document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  cursorDot.style.left=mx+'px';cursorDot.style.top=my+'px';
});
(function animRing(){
  rx+=(mx-rx)*0.1;ry+=(my-ry)*0.1;
  cursorRing.style.left=rx+'px';cursorRing.style.top=ry+'px';
  requestAnimationFrame(animRing);
})();
document.querySelectorAll('a,button,.btn,.chip,.video-card,.project-card,.skill-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{
    cursorRing.style.transform='translate(-50%,-50%) scale(2)';
    cursorRing.style.borderColor='rgba(192,132,252,0.7)';
    cursorRing.style.background='rgba(124,58,237,0.06)';
  });
  el.addEventListener('mouseleave',()=>{
    cursorRing.style.transform='translate(-50%,-50%) scale(1)';
    cursorRing.style.borderColor='rgba(168,85,247,0.55)';
    cursorRing.style.background='transparent';
  });
});

/* ══════════════════════════════
   NAV SCROLL
══════════════════════════════ */
const nav=document.getElementById('mainNav');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>60));

/* ══════════════════════════════
   INTERSECTION OBSERVER
══════════════════════════════ */
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      e.target.querySelectorAll('.skill-bar span').forEach(b=>b.classList.add('animate'));
    }
  });
},{threshold:0.1});
document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale,.reveal-flip').forEach(el=>obs.observe(el));
document.querySelectorAll('.skill-card').forEach(card=>{
  const so=new IntersectionObserver(en=>{
    en.forEach(e=>{if(e.isIntersecting)e.target.querySelectorAll('.skill-bar span').forEach(b=>b.classList.add('animate'));});
  },{threshold:0.25});
  so.observe(card);
});

/* ══════════════════════════════
   MAGNETIC BUTTONS
══════════════════════════════ */
document.querySelectorAll('.btn-primary,.btn-ghost').forEach(btn=>{
  btn.addEventListener('mousemove',e=>{
    const r=btn.getBoundingClientRect();
    const x=e.clientX-r.left-r.width/2;
    const y=e.clientY-r.top-r.height/2;
    btn.style.transform=`translate(${x*0.18}px,${y*0.22}px) translateY(-4px)`;
  });
  btn.addEventListener('mouseleave',()=>btn.style.transform='');
});

/* ══════════════════════════════
   PARALLAX on scroll
══════════════════════════════ */
window.addEventListener('scroll',()=>{
  const sy=scrollY;
  const bgC=document.getElementById('bgCanvas');
  bgC.style.transform=`translateY(${sy*0.15}px)`;
  const aiC=document.getElementById('aiTextCanvas');
  aiC.style.transform=`translateY(${sy*0.08}px)`;
});

/* ══════════════════════════════
   GLITCH on logo hover
══════════════════════════════ */
const logo=document.querySelector('.logo');
logo.addEventListener('mouseenter',()=>{
  logo.style.animation='glitch .4s steps(2) forwards';
});
logo.addEventListener('animationend',()=>{logo.style.animation='';});

/* ══════════════════════════════
   AI BOT
══════════════════════════════ */
const facts={
  agentic:"Agentic AI refers to AI systems that can autonomously plan, reason, and take multi-step actions to achieve a goal — instead of just responding to a single prompt.",
  ml:"Machine Learning is a branch of AI where systems learn patterns from data instead of being explicitly programmed. It powers everything from recommendation engines to voice assistants.",
  future:"The future of AI points toward smarter agents, personalized assistants, and AI woven into everyday tools.",
  python:"Python is one of the most popular languages for AI because of its simple syntax and powerful libraries like TensorFlow, PyTorch, and pandas.",
  lucky:"Lucky is an aspiring AI technologist, certified in Agentic AI and Python, with a passion for marketing and futuristic digital experiences."
};
const botEl=document.getElementById('ai-bot');
const panel=document.getElementById('chat-panel');
const log=document.getElementById('chat-log');
botEl.addEventListener('click',()=>panel.classList.toggle('open'));
document.querySelectorAll('.chip').forEach(chip=>{
  chip.addEventListener('click',()=>{
    const key=chip.dataset.q;
    const u=document.createElement('div');u.className='msg user';u.textContent=chip.textContent;log.appendChild(u);
    const b=document.createElement('div');b.className='msg bot';b.textContent=facts[key];log.appendChild(b);
    log.scrollTop=log.scrollHeight;
  });
});