/* ============================================================
   app.jsx — root state machine + persistence
   ============================================================ */
const { useState:_aS, useEffect:_aE } = React;
const LS = 'redemption-tour-v1';

function loadState(){
  try{ return JSON.parse(localStorage.getItem(LS)) || {}; }catch(e){ return {}; }
}

function App(){
  const saved = loadState();
  // Always start fresh at the poster on (re)load — don't restore the saved screen.
  const [screen, setScreen]   = _aS('poster'); // poster | dates | rider | ticket | itinerary
  const [night,  setNight]    = _aS(saved.night ?? null);
  const [name,   setName]     = _aS(saved.name || 'Josie');
  const [accepted,setAccepted]= _aS(saved.accepted || {});
  const [fire, setFire]       = _aS(0);

  _aE(()=>{
    localStorage.setItem(LS, JSON.stringify({ screen, night, name, accepted }));
  },[screen, night, name, accepted]);

  // scroll to top on screen change + fire confetti on ticket
  _aE(()=>{
    window.scrollTo({ top:0, behavior:'instant' in window ? 'instant' : 'auto' });
    if(screen==='ticket') setFire(f=>f+1);
  },[screen]);

  // Analytics: this is a single-page state machine — the URL never changes,
  // so PostHog's automatic pageview only fires once. Emit a pageview +
  // friendly event on every screen change so the poster→dates→rider→ticket
  // funnel and the per-screen session replay are visible in the dashboard.
  // Guarded so the site still works if PostHog fails to load; the snippet
  // queues these calls safely even before array.js finishes loading.
  _aE(()=>{
    if(typeof window.posthog === 'undefined') return;
    window.posthog.capture('$pageview',   { screen });
    window.posthog.capture('screen_viewed', { screen });
  },[screen]);

  const go = (s)=> setScreen(s);
  const restart = ()=>{ setNight(null); setAccepted({}); setScreen('poster'); };

  return (
    <React.Fragment>
      <Ticker />
      <Grain />
      <Confetti fire={fire} />
      <div className="stage">
        {screen==='poster' && <Poster onStart={()=>go('dates')} onItinerary={()=>go('itinerary')} />}
        {screen==='dates'  && <Dates selected={night} setSelected={setNight}
                                     onNext={()=>go('rider')} onBack={()=>go('poster')} />}
        {screen==='rider'  && <Rider name={name} setName={setName}
                                     accepted={accepted} setAccepted={setAccepted}
                                     onNext={()=>go('ticket')} onBack={()=>go('dates')} />}
        {screen==='ticket' && <TicketScreen name={name} nightId={night}
                                     onRestart={restart} />}
        {screen==='itinerary' && <Itinerary name={name} nightId={night}
                                     onBack={()=>go('poster')}
                                     onCelebrate={()=>setFire(f=>f+1)} />}
      </div>
    </React.Fragment>
  );
}

/* ------------------------------------------------------------
   Boot guard.
   The screens (Poster/Dates/Rider/TicketScreen) and bits
   (Ticker/Grain/Confetti) live in separate type="text/babel"
   files that Babel compiles + executes asynchronously, with no
   guaranteed ordering vs this file. If <App/> rendered before
   those globals existed, React would hit `undefined` components
   and the tree would fail to mount — surfacing as an intermittent
   reset on reload. Wait until every dependency is present (and the
   DOM root exists) before the first render. */
(function boot(tries){
  tries = tries || 0;
  const needed = ['Poster','Dates','Rider','TicketScreen','Itinerary','Ticker','Grain','Confetti'];
  const root = document.getElementById('root');
  const ready = root && needed.every(n => typeof window[n] === 'function');

  if(ready){
    ReactDOM.createRoot(root).render(<App/>);
    return;
  }
  if(tries > 600){ // ~10s of frames — a dependency truly failed to load
    if(root){ root.textContent = 'Failed to load. Please refresh.'; }
    return;
  }
  // Dependencies/DOM not ready yet — re-check on next frame.
  setTimeout(()=>boot(tries+1), 16);
})();
