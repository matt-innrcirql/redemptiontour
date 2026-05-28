/* ============================================================
   bits.jsx — visual primitives for The Redemption Tour
   ============================================================ */
const { useState, useEffect, useRef } = React;

/* film grain overlay (SVG turbulence) */
function Grain(){
  return (
    <React.Fragment>
      <svg className="grain" xmlns="http://www.w3.org/2000/svg">
        <filter id="grainf"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/></filter>
        <rect width="100%" height="100%" filter="url(#grainf)"/>
      </svg>
      <div className="vignette"></div>
    </React.Fragment>
  );
}

/* scrolling marquee at top */
function Ticker(){
  const items = [
    <span key="a">★ <b>ONE NIGHT ONLY</b> ★ THE REDEMPTION TOUR</span>,
    <span key="b">NO FREEZING <b>GUARANTEED</b> ❄︎ THIS TIME</span>,
    <span key="c">HEADLINING: <b>MATT YEE</b></span>,
    <span key="d">LIVE IN <b>CHICAGO, IL</b> ★ JUNE 3·4·5·6</span>,
    <span key="e">THE UBER EXCUSE IS <b>NO LONGER VALID</b></span>,
    <span key="f">A CERTIFIED <b>HISTORIC MOMENT™</b></span>,
  ];
  const loop = [...items, ...items.map((it,i)=>React.cloneElement(it,{key:'x'+i}))];
  return (
    <div className="ticker">
      <div className="ticker__track">{loop}</div>
    </div>
  );
}

/* random barcode */
function Barcode({ seed = 7 }){
  const bars = [];
  let s = seed * 9301 + 49297;
  const rnd = ()=>{ s = (s*9301 + 49297) % 233280; return s/233280; };
  for(let i=0;i<34;i++){
    bars.push(<i key={i} style={{ width: (rnd()>0.5?3:2)+'px', opacity: rnd()>0.15?1:0.25 }}/>);
  }
  return <div className="barcode">{bars}</div>;
}

/* confetti burst */
function Confetti({ fire }){
  const [pieces,setPieces] = useState([]);
  useEffect(()=>{
    if(!fire) return;
    const cols = ['#cf3a22','#c2901f','#1f6f68','#efe3cc','#1b1611'];
    const arr = Array.from({length:120}).map((_,i)=>({
      id:i+'-'+Date.now(),
      left: Math.random()*100,
      bg: cols[Math.floor(Math.random()*cols.length)],
      delay: Math.random()*0.5,
      dur: 2.4 + Math.random()*2.2,
      rot: Math.random()*360,
      w: 6+Math.random()*8,
    }));
    setPieces(arr);
    const t = setTimeout(()=>setPieces([]), 6000);
    return ()=>clearTimeout(t);
  },[fire]);
  if(!pieces.length) return null;
  return (
    <div className="confetti">
      {pieces.map(p=>(
        <i key={p.id} style={{
          left:p.left+'%', background:p.bg, width:p.w+'px', height:(p.w*1.6)+'px',
          transform:`rotate(${p.rot}deg)`,
          animationDuration:p.dur+'s', animationDelay:p.delay+'s'
        }}/>
      ))}
    </div>
  );
}

Object.assign(window, { Grain, Ticker, Barcode, Confetti });
