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
  const [screen, setScreen]   = _aS(saved.screen || 'poster'); // poster | dates | rider | ticket
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

  const go = (s)=> setScreen(s);
  const restart = ()=>{ setNight(null); setAccepted({}); setScreen('poster'); };

  return (
    <React.Fragment>
      <Ticker />
      <Grain />
      <Confetti fire={fire} />
      <div className="stage">
        {screen==='poster' && <Poster onStart={()=>go('dates')} />}
        {screen==='dates'  && <Dates selected={night} setSelected={setNight}
                                     onNext={()=>go('rider')} onBack={()=>go('poster')} />}
        {screen==='rider'  && <Rider name={name} setName={setName}
                                     accepted={accepted} setAccepted={setAccepted}
                                     onNext={()=>go('ticket')} onBack={()=>go('dates')} />}
        {screen==='ticket' && <TicketScreen name={name} nightId={night}
                                     onRestart={restart} />}
      </div>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
