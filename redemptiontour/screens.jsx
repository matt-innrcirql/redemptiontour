/* ============================================================
   screens.jsx — Poster · Dates · Rider · Ticket
   ============================================================ */
const { useState:_uS, useEffect:_uE, useRef:_uR } = React;

const NIGHTS = [
  { id:0, no:'NIGHT I',  day:'WED', date:3, dow:'WED', short:'WED · JUN 3',
    bill:'The Preview', tag:'Lowest stakes. A midweek warm-up before the weekend rush.',
    demand:'DEMAND: WARMING UP', fill:42 },
  { id:1, no:'NIGHT II', day:'THU', date:4, dow:'THU', short:'THU · JUN 4',
    bill:'The Soft Open', tag:'Lower lighting, gentler pacing. Conversation over volume.',
    demand:'DEMAND: BUILDING', fill:60 },
  { id:2, no:'NIGHT III',day:'FRI', date:5, dow:'FRI', short:'FRI · JUN 5',
    bill:'The Main Event', tag:'Prime billing. The night he proves the redemption tour was a good call.',
    demand:'DEMAND: NEARLY SOLD OUT', fill:88 },
  { id:3, no:'NIGHT IV', day:'SAT', date:6, dow:'SAT', short:'SAT · JUN 6',
    bill:'The Encore', tag:'Full weekend energy. If the week went well… an encore was always likely.',
    demand:'DEMAND: HIGH', fill:74, preferred:true },
];

const CLAUSES = [
  { id:'cut',     txt:(<span>The Performer shall, in fact, <b>make the cut</b> this time.</span>) },
  { id:'venue',   txt:(<span>The <b>Surprise Venue</b> (eyeballed for several Chicago trips) shall be <b>texted to the Attendee after confirmation</b>.</span>) },
  { id:'doodle',  txt:(<span>Goldendoodle co-pilots <b>Dash</b> and <b>Osito</b> retain <b>full and unappealable veto authority</b>.</span>) },
  { id:'letdown', txt:(<span>Performer agrees <b>not to be a total letdown</b>, as previously stipulated.</span>) },
  { id:'tenders', txt:(<span>No <b>kids-menu chicken tenders</b> shall be ordered. Bullets, dodged. 😉</span>) },
];

/* ---------------- ITINERARY data ---------------- */
const STOPS = [
  { id:0, no:'STOP I', kind:'venue', act:'Dinner', time:'6:00 PM',
    place:'Bazaar Meat', city:'by José Andrés · Chicago',
    note:"The opening act. Bold, a little theatrical, and exactly the kind of first impression worth showing up early for.",
    map:'https://www.google.com/maps/search/?api=1&query=Bazaar+Meat+by+Jose+Andres+Chicago' },
  { id:1, kind:'walk', act:'The Walk', time:'~10–15 min',
    place:'down the Magnificent Mile',
    note:"A short stroll up the Mag Mile between acts. Lights, windows, and a man trying to be charming the whole way." },
  { id:2, no:'STOP II', kind:'venue', act:'Drinks', time:'8:45 PM',
    place:'Terrace 16', city:'Trump Tower · Chicago',
    note:"Nightcap with a skyline. The encore of the evening, best enjoyed slowly.",
    map:'https://www.google.com/maps/search/?api=1&query=Terrace+16+Chicago' },
];

const EXCITE = {
  1:'…we’ll allow it. The bar was on the floor anyway.',
  2:'Cautiously optimistic. Respectable.',
  3:'A solid, mature level of excitement. Noted.',
  4:'Now we’re talking. He can feel it through the screen.',
  5:'Correct answer. ✅ He’s honored to be part of such a historic moment.',
};

/* ---------------- POSTER (hero) ---------------- */
function Poster({ onStart, onItinerary }){
  return (
    <div className="poster paper screen-enter">
      <div className="poster__frame">
        <div className="poster__tape"></div>

        <div className="presents rule-word type">The City of Chicago (unofficially) presents</div>
        <div className="poster__kicker">A Live Redemption Event · 1.5 weeks in the making*</div>

        <div className="poster__title">
          <span className="l1 display">One <em>Date</em></span>
          <span className="poster__amp">·one·shot·</span>
        </div>
        <div className="poster__script">the redemption tour</div>

        <div className="headliner">
          <div className="headliner__tab type">Headlining</div>
          <img src="assets/matt-star.jpg" alt="Matt Yee, live on stage" />
          <div className="headliner__name display">Matt Yee
          </div>
        </div>

        <div className="poster__venue">
          <div className="city display">Live in Chicago, Illinois</div>
        </div>
        <div className="poster__dates display">
          JUN 3 <span className="dot">·</span> 4 <span className="dot">·</span> 5 <span className="dot">·</span> 6 <span className="yr">’26</span>
        </div>

        <button className="cta-stamp" onClick={onStart}>Claim Your Ticket →</button>

        <div className="poster__itin-wrap">
          <div className="poster__itin-nudge type">👀 psst, Josie</div>
          <button className="poster__itinerary script" onClick={onItinerary}>
            tap here to see your itinerary 🎟
          </button>
        </div>

        <div className="poster__finefooter type">
          Doors 6:00 PM · No refunds · One redemption per customer<br/>
          *Approx. times subject to change. Venue texted after confirmation.
        </div>
      </div>
    </div>
  );
}

/* ---------------- DATES ---------------- */
function Dates({ selected, setSelected, onNext, onBack }){
  return (
    <div className="panel paper screen-enter">
      <div className="panel__head">
        <div className="panel__step">Step 1 of 3 · Choose your night</div>
        <h2 className="panel__title display">Select Your <em>Night</em></h2>
        <p className="panel__sub">Four nights. One Chicago. Pick when you'd like Matt to redeem himself. Choose wisely. Demand is, frankly, a little out of control.</p>
      </div>

      <div className="nights">
        {NIGHTS.map(n=>{
          const on = selected===n.id;
          return (
            <div key={n.id} className={"night"+(on?" night--on":"")+(n.preferred?" night--preferred":"")} onClick={()=>setSelected(n.id)}>
              {n.preferred && <div className="night__pref-badge type">★ Preferred</div>}
              <div className="night__pick"></div>
              <div className="night__top">
                <div className="night__no display">{n.no}</div>
                <div className="night__day display">{n.day}</div>
              </div>
              <div className="night__perf"></div>
              <div className="night__bignum display">{n.date}</div>
              <div className="night__mon">June · 2026</div>
              <div className="night__bill script">{n.bill}</div>
              <div className="night__tag type">{n.tag}</div>
              <div className="night__demand">{n.demand}</div>
              <div className="night__bar"><i style={{width:n.fill+'%'}}></i></div>
            </div>
          );
        })}
      </div>

      <div className="navrow">
        <button className="btn btn--ghost" onClick={onBack}>← back to poster</button>
        <button className="btn btn--red" disabled={selected===null} onClick={onNext}>
          {selected===null ? 'Pick a night' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}

/* ---------------- RIDER (contract + perks) ---------------- */
function Rider({ name, setName, accepted, setAccepted, onNext, onBack }){
  const [shake,setShake] = _uS(false);
  const allChecked = CLAUSES.every(c=>accepted[c.id]);
  const toggle = (id)=> setAccepted(prev=>({...prev, [id]: !prev[id]}));

  const tryNext = ()=>{
    if(!allChecked || !name.trim()){ setShake(true); setTimeout(()=>setShake(false),500); return; }
    onNext();
  };

  return (
    <div className="panel paper rider screen-enter">
      <div className="panel__head">
        <div className="panel__step">Step 2 of 3 · The Rider</div>
        <h2 className="panel__title display">The <em>Rider</em></h2>
        <p className="panel__sub">Every headliner has one. Initial to proceed.</p>
      </div>

      <div className="rider__doc">
        <div className="rider__field">
          <label>Ticket holder, sign here:</label>
          <input value={name} placeholder="Josie"
            onChange={e=>setName(e.target.value)} maxLength={28} />
        </div>

        <div className="rider__cue type">👆 Tap each term to initial it</div>

        {CLAUSES.map((c,i)=>(
          <div key={c.id} className={"clause"+(accepted[c.id]?" clause--on":"")} onClick={()=>toggle(c.id)}>
            <div className="clause__box"></div>
            <div className="clause__txt"><b>§{i+1}.</b> {c.txt}</div>
          </div>
        ))}
      </div>

      <div className="perks">
        <h4>Included With Admission <span>· VIP perks</span></h4>
        <ul>
          <li>Front-row access to the surprise venue he's been eyeballing the last few Chicago trips.</li>
          <li>One (1) full goodbye. No clock-watching.</li>
          <li>Complimentary nerves, served warm, on the house.</li>
          <li>Goldendoodle approval pending. Your co-pilot retains full veto power.</li>
        </ul>
      </div>

      <div className={"agree-note"+((!allChecked||!name.trim())?" warn":"")} style={shake?{animation:'screenIn .12s 3'}:{}}>
        {allChecked && name.trim()
          ? "All terms initialed. You may proceed to claim your ticket."
          : `Initial all ${CLAUSES.length} clauses${!name.trim()?' and sign as ticket holder':''} to continue.`}
      </div>

      <div className="navrow">
        <button className="btn btn--ghost" onClick={onBack}>← change my night</button>
        <button className="btn btn--red" onClick={tryNext} disabled={!allChecked || !name.trim()}>
          Issue My Ticket →
        </button>
      </div>
    </div>
  );
}

/* ---------------- TICKET ---------------- */
function TicketScreen({ name, nightId, onRestart }){
  const night = NIGHTS[nightId] ?? NIGHTS[1];
  const holder = (name||'Josie').trim();
  const [sold,setSold] = _uS(false);
  const [texted,setTexted] = _uS(false);
  const order = _uR('RT-'+Math.floor(100000+Math.random()*899999)).current;

  _uE(()=>{ const t=setTimeout(()=>setSold(true), 900); return ()=>clearTimeout(t); },[]);

  const phone = '+12028801652';
  const body =
`🎟 IT'S OFFICIAL. ${holder.toUpperCase()} has claimed her ticket to the MATT YEE REDEMPTION TOUR.
${night.no} · ${night.short} · Chicago, IL
Section: FRONT ROW
Terms initialed. Don't be a letdown. Goldendoodle's on standby. 😌`;
  const sms = `sms:${phone}?&body=${encodeURIComponent(body)}`;

  return (
    <div className="panel screen-enter" style={{maxWidth:'820px'}}>
      <div className="confirm-banner">
        <span className="script">You're in, {holder}.</span>
        <p className="type">TICKET ISSUED · screenshot this, then confirm with the headliner.</p>
      </div>

      <div className="ticket-wrap">
        <div className="ticket">
          <div className={"soldout"+(sold?" show":"")}>
            <span className="soldout__kicker">You got the last seat ·</span>
            Sold Out
          </div>

          <div className="ticket__main">
            <div className="ticket__top">
              <div className="ticket__brand display">
                One Date·One Shot
                <small className="script">the redemption tour</small>
              </div>
              <div className="ticket__admit">
                <div className="big display">ADMIT ONE</div>
                <div className="sm type">+ 1 GOLDENDOODLE</div>
              </div>
            </div>

            <div className="ticket__body">
              <img className="ticket__photo" src="assets/goldendoodle.jpg" alt="Goldendoodle co-pilot" />
              <div className="tgrid">
                <div className="tcell"><label>Ticket Holder</label><div className="v red">{holder}</div></div>
                <div className="tcell"><label>Headliner</label><div className="v">Matt Yee</div></div>
                <div className="tcell"><label>Showing</label><div className="v sm">{night.no} · {night.short}</div></div>
                <div className="tcell"><label>Venue</label><div className="v sm">Chicago, IL</div></div>
                <div className="tcell"><label>Section</label><div className="v">Front Row</div></div>
              </div>
            </div>

            <div className="ticket__perksline type">
              <b>Includes:</b> full goodbye (×1) · fully present · complimentary nerves ·
              surprise venue (texted) · goldendoodle veto rights reserved.
            </div>

            <div className="ticket__order type">
              <span>ORDER {order}</span>
              <span>{night.bill.toUpperCase()}</span>
              <span>DOORS 6:00 PM</span>
            </div>
          </div>

          <div className="ticket__stub">
            <div className="stub__no display">{night.no}</div>
            <div>
              <div className="stub__seat display">FRONT<br/>ROW</div>
            </div>
            <div>
              <Barcode seed={order.length + night.date*13} />
              <div className="stub__scan type">SCAN AT THE DOOR</div>
              <div className="stub__scan type" style={{marginTop:'2px'}}>{night.short}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="screenshot-hint type">📸 screenshot your ticket, it's your proof of entry</div>

      <div className="navrow" style={{justifyContent:'center', flexWrap:'wrap', gap:'18px'}}>
        <button className="btn btn--ghost" onClick={onRestart}>← start over</button>
        <a className="btn btn--red btn--big" href={sms} onClick={()=>setTexted(true)}
           style={{textDecoration:'none'}}>
          {texted ? '✓ Sent to Matt. See you front row' : 'Confirm → Text Matt 📲'}
        </a>
      </div>
      {texted && (
        <div className="center type" style={{color:'var(--gold)', marginTop:'14px', fontSize:'13px', letterSpacing:'.06em'}}>
          Your message is queued to 202-880-1652. The redemption tour is officially booked.
        </div>
      )}
    </div>
  );
}

/* ---------------- ITINERARY (the night) ---------------- */
function Itinerary({ name, nightId, onBack, onCelebrate }){
  const holder = (name||'Josie').trim();
  // Default to the preferred night (Sat Jun 6) if she hasn't locked one in yet.
  const night = NIGHTS[nightId] ?? NIGHTS.find(n=>n.preferred) ?? NIGHTS[3];

  const [excite, setExcite] = _uS(null);  // 1–5
  const [hover,  setHover]  = _uS(0);
  const [unlocked, setUnlocked] = _uS(false);

  const unlock = ()=>{
    if(excite===null) return;
    setUnlocked(true);
    if(typeof onCelebrate === 'function') onCelebrate(); // confetti burst 🎉
    if(typeof window.posthog !== 'undefined'){
      window.posthog.capture('itinerary_excitement', { excitement: excite, night: night.no });
    }
  };

  // Build a downloadable .ics for the evening on the chosen night.
  const addToCalendar = ()=>{
    const yyyy = 2026, mm = '06';
    const dd = String(night.date).padStart(2,'0');
    const dt = (h,mi)=> `${yyyy}${mm}${dd}T${String(h).padStart(2,'0')}${String(mi).padStart(2,'0')}00`;
    const ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Redemption Tour//Itinerary//EN',
      'BEGIN:VEVENT',
      'UID:redemption-tour-'+night.date+'@mattyeeredemptiontour.com',
      'DTSTART:'+dt(18,0),
      'DTEND:'+dt(22,30),
      'SUMMARY:The Redemption Tour 🎟 — '+holder+' + Matt',
      'LOCATION:Bazaar Meat then Terrace 16, Chicago, IL',
      'DESCRIPTION:6:00 PM Dinner at Bazaar Meat \\, ~10-15 min walk down the Magnificent Mile \\, 8:45 PM Drinks at Terrace 16. Bring your smile and your personality.',
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type:'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'redemption-tour.ics';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
    if(typeof window.posthog !== 'undefined'){ window.posthog.capture('itinerary_add_to_calendar', { night: night.no }); }
  };

  return (
    <div className="panel paper itin screen-enter">
      <div className="panel__head">
        <div className="panel__step">The Main Event · {night.short}</div>
        <h2 className="panel__title display">The <em>Itinerary</em></h2>
        <p className="panel__sub">The full running order for the evening, {holder}. Two acts, one walk, zero freezing.</p>
      </div>

      {!unlocked && (
        <div className="gate">
          <div className="gate__q script">Before the tour begins…<br/>how excited are we?</div>
          <div className="gate__scale type">Tap a number · 1 to 5</div>

          <div className="stars" role="group" aria-label="Excitement, 1 to 5">
            {[1,2,3,4,5].map(n=>{
              const lit = n <= (hover || excite || 0);
              return (
                <button key={n}
                  className={"star"+(lit?" star--on":"")}
                  aria-label={n+' out of 5'}
                  onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}
                  onClick={()=>setExcite(n)}>★</button>
              );
            })}
          </div>

          <div className={"gate__react type"+(excite?" show":"")}>
            {excite ? EXCITE[excite] : ' '}
          </div>

          <div className="gate__rider">
            <div className="gate__rider-h type">Mandatory items to bring</div>
            <div className="gate__rider-b">
              <span>😊 your smile</span>
              <span>✨ your personality</span>
            </div>
            <div className="gate__rider-f type">Non-negotiable. The rest is handled.</div>
            <div className="gate__dress type">
              <b>Dress code:</b> cocktail (or similar). Block heels recommended,
              or carry a flat for the Mag Mile walk. 👠
            </div>
            <div className="gate__dress type">
              <b>Transport:</b> handled. An Uber picks you up and drops you home. 🚗
            </div>
          </div>

          <button className="btn btn--red btn--big gate__btn" disabled={excite===null} onClick={unlock}>
            {excite===null ? 'Pick a number first' : 'Unlock the night →'}
          </button>
        </div>
      )}

      {unlocked && (
        <React.Fragment>
          <div className="timeline">
            {STOPS.map((s,i)=>(
              <div key={s.id}
                className={"stop stop--"+s.kind+" stop-reveal"}
                style={{ animationDelay:(0.12 + i*0.28)+'s' }}>
                <div className="stop__rail">
                  <div className="stop__dot">{s.kind==='walk' ? '🚶' : (s.id===0?'I':'II')}</div>
                </div>
                <div className="stop__card">
                  <div className="stop__time display">{s.time}</div>
                  <div className="stop__act type">{s.no || 'INTERMISSION'} · {s.act}</div>
                  <div className="stop__place script">{s.place}</div>
                  {s.city && <div className="stop__city type">{s.city}</div>}
                  <div className="stop__note">{s.note}</div>
                  {s.map && (
                    <a className="stop__map type" href={s.map} target="_blank" rel="noopener noreferrer">
                      📍 View on map
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="itin__cal">
            <button className="btn btn--red" onClick={addToCalendar}>🗓 Add the night to your calendar</button>
            <div className="itin__cal-note type">Saves a calendar file for {night.short}.</div>
          </div>
        </React.Fragment>
      )}

      <div className="navrow" style={{justifyContent:'center'}}>
        <button className="btn btn--ghost" onClick={onBack}>← back to the poster</button>
      </div>
    </div>
  );
}

Object.assign(window, { Poster, Dates, Rider, TicketScreen, Itinerary, NIGHTS });
