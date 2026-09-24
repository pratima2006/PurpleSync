function PurpleBubbles() {
  const ref = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const wrap = ref.current;
    if (!wrap) return;
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;

    // world box se 3x bada hai - isliye window cross hogi
    const WORLD_W = W * 2.8;
    const WORLD_H = H * 2.8;
    const OFFSET_X = -W * 0.9;
    const OFFSET_Y = -H * 0.9;

    const shapes = [
      '42% 58% 62% 38% / 45% 38% 62% 55%',
      '60% 40% 30% 70% / 60% 30% 70% 40%',
      '55% 45% 45% 55% / 50% 60% 40% 50%',
      '38% 62% 55% 45% / 40% 50% 50% 60%',
      '50% 50% 50% 50% / 50% 50% 50% 50%',
      '65% 35% 55% 45% / 35% 65% 35% 65%',
      '30% 70% 70% 30% / 30% 30% 70% 70%',
      '45% 55% 65% 35% / 65% 35% 45% 55%',
    ];

    const gradients = [
      'radial-gradient(70% 70% at 30% 20%, #7c4dff 0%, #3d1f8f 45%, #1a1033 100%)',
      'radial-gradient(70% 70% at 35% 25%, #9b6bff 0%, #4a2ab8 50%, #1e1340 100%)',
      'radial-gradient(70% 70% at 30% 30%, #6d3bff 0%, #2f1a6b 60%, #130d26 100%)',
      'radial-gradient(70% 70% at 40% 20%, #b18cff 0%, #5e35d6 45%, #22164a 100%)',
      'radial-gradient(70% 70% at 30% 20%, #5e2fff 0%, #2a1670 55%, #100a2e 100%)',
    ];

    type B = { x:number; y:number; vx:number; vy:number; r:number; shape:string; gradIdx:number; squash:number; light:number; el:HTMLElement };
    const bubbles: B[] = [];
    const els = Array.from(wrap.children) as HTMLElement[];

    els.forEach((el, i) => {
      const r = 45 + Math.random()*95;
      el.style.width = r*2 + 'px';
      el.style.height = r*2 + 'px';
      el.style.borderRadius = shapes[i % shapes.length];
      bubbles.push({
        x: Math.random()*WORLD_W + OFFSET_X,
        y: Math.random()*WORLD_H + OFFSET_Y,
        vx: (Math.random()-0.5)*0.28,
        vy: (Math.random()-0.5)*0.28,
        r,
        shape: shapes[i % shapes.length],
        gradIdx: i % gradients.length,
        squash: 0,
        light: Math.random(),
        el,
      });
      el.style.background = gradients[ i % gradients.length ];
    });

    const loop = () => {
      for(let i=0;i<bubbles.length;i++){
        const b = bubbles[i];
        b.x += b.vx;
        b.y += b.vy;

        // world wrap - box ke bahar se andar
        if(b.x < OFFSET_X - b.r) b.x = OFFSET_X + WORLD_W + b.r;
        if(b.x > OFFSET_X + WORLD_W + b.r) b.x = OFFSET_X - b.r;
        if(b.y < OFFSET_Y - b.r) b.y = OFFSET_Y + WORLD_H + b.r;
        if(b.y > OFFSET_Y + WORLD_H + b.r) b.y = OFFSET_Y - b.r;

        // collision - squash + colour change
        for(let j=i+1;j<bubbles.length;j++){
          const b2 = bubbles[j];
          const dx = b.x - b2.x;
          const dy = b.y - b2.y;
          const d = Math.hypot(dx,dy);
          if(d < b.r + b2.r && d>1){
            const overlap = (b.r + b2.r - d) * 0.5;
            const tx = dx/d, ty = dy/d;
            b.x += tx*overlap*0.5; b.y += ty*overlap*0.5;
            b2.x -= tx*overlap*0.5; b2.y -= ty*overlap*0.5;
            const dot = (b.vx-b2.vx)*tx + (b.vy-b2.vy)*ty;
            b.vx -= dot*tx*0.6; b.vy -= dot*ty*0.6;
            b2.vx += dot*tx*0.6; b2.vy += dot*ty*0.6;
            b.squash = 1; b2.squash = 1;
            b.gradIdx = (b.gradIdx+1)%gradients.length;
            b2.gradIdx = (b2.gradIdx+1)%gradients.length;
            b.el.style.background = gradients[b.gradIdx];
            b2.el.style.background = gradients[b2.gradIdx];
          }
        }

        b.vx = Math.max(-0.32,Math.min(0.32,b.vx));
        b.vy = Math.max(-0.32,Math.min(0.32,b.vy));
        if(b.squash>0) b.squash -= 0.04;
        const sq = b.squash>0? 1 - b.squash*0.35 : 1;
        const sqY = b.squash>0? 1 + b.squash*0.4 : 1;

        b.el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0) scaleX(${sq}) scaleY(${sqY})`;
        b.el.style.opacity = `${0.75 + Math.sin(Date.now()*0.0006 + b.light*10)*0.15}`;
      }
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div ref={ref} className="absolute inset-[-35%]">
      {/* alag alag shape ke balls - dark purple gradient */}
      <div className="absolute blur-[0.3px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_0_40px_rgba(124,77,255,0.25)]" />
      <div className="absolute blur-[0.3px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.35),0_0_35px_rgba(100,60,255,0.2)]" />
      <div className="absolute blur-[0.3px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_0_50px_rgba(90,40,200,0.3)]" />
      <div className="absolute shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_0_30px_rgba(140,100,255,0.2)]" />
      <div className="absolute blur-[0.3px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.35),0_0_40px_rgba(110,70,255,0.25)]" />
      <div className="absolute shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_0_25px_rgba(180,160,255,0.15)]" />
      <div className="absolute blur-[0.4px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.35),0_0_45px_rgba(70,30,170,0.3)]" />
      <div className="absolute shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_0_20px_rgba(200,180,255,0.2)]" />
      {/* roaming lights - slowly ghumne wali light */}
      <div className="absolute w-[18px] h-[18px] rounded-full bg-[#c9b6ff] blur-[6px] opacity-60 animate-[floatLight_12s_ease-in-out_infinite]" style={{left:'15%', top:'20%'}} />
      <div className="absolute w-[12px] h-[12px] rounded-full bg-[#8b6cff] blur-[8px] opacity-50 animate-[floatLight_16s_ease-in-out_infinite_reverse]" style={{right:'20%', bottom:'25%'}} />
    </div>
  );
}
