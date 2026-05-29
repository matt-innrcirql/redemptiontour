/* ============================================================
   screens.jsx — Poster · Dates · Rider · Ticket
   ============================================================ */
const { useState:_uS, useEffect:_uE, useRef:_uR } = React;

const NIGHTS = [
  { id:0, no:'NIGHT I',  day:'WED', date:3, dow:'WED', short:'WED · JUN 3',
    bill:'The Preview', tag:'Lowest stakes. A midweek warm up to shake off two weeks of nerves.',
    demand:'DEMAND: WARMING UP', fill:42 },
  { id:1, no:'NIGHT II', day:'THU', date:4, dow:'THU', short:'THU · JUN 4',
    bill:'The Soft Open', tag:'Lower lighting, gentler pacing. A measured re-introduction to not freezing.',
    demand:'DEMAND: BUILDING', fill:60 },
  { id:2, no:'NIGHT III',day:'FRI', date:5, dow:'FRI', short:'FRI · JUN 5',
    bill:'The Main Event', tag:'Prime billing. The night he proves the redemption tour was a good call.',
    demand:'DEMAND: NEARLY SOLD OUT', fill:88 },
  { id:3, no:'NIGHT IV', day:'SAT', date:6, dow:'SAT', short:'SAT · JUN 6',
    bill:'The Encore', tag:'Full weekend energy. If the week went well… an encore was always likely.',
    demand:'DEMAND: HIGH', fill:74 },
];

const CLAUSES = [
  { id:'freeze', txt:(<span>The Attendee acknowledges that the party of the first part (<b>Matt</b>) was, in fact, <b>just freezing</b>, and was not, under any reading, fleeing the scene.</span>) },
  { id:'uber',   txt:(<span>The <b>"he was just excited for his Uber"</b> theory is hereby permanently retired and may not be entered into evidence.</span>) },
  { id:'historic',txt:(<span>The Attendee agrees to treat the proceedings as a <b>Certified Historic Moment™</b>, as previously stipulated by both parties via text.</span>) },
  { id:'letdown',txt:(<span>The Performer agrees <b>not to be a total letdown</b>. The Attendee agrees to grant approximately one (1) redemption, results pending.</span>) },
];

/* ---------------- POSTER (hero) ---------------- */
function Poster({ onStart }){
  return (
    <div className="poster paper screen-enter">
      <div className="poster__frame">
        <div className="poster__tape"></div>

        <div className="presents rule-word type">The City of Chicago (unofficially) presents</div>
        <div className="poster__kicker">A Live Redemption Event · two weeks in the making*</div>

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

        <div className="poster__finefooter type">
          Doors 6:00 PM · No refunds · One redemption per customer<br/>
          *Approx. Times and freezing levels subject to change.
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
            <div key={n.id} className={"night"+(on?" night--on":"")} onClick={()=>setSelected(n.id)}>
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
        <div className="panel__step">Step 2 of 3 · The fine print</div>
        <h2 className="panel__title display">The <em>Rider</em></h2>
        <p className="panel__sub">Every headliner has a rider. Before tickets are issued, the Attendee must review and initial the following terms. Standard stuff, mostly.</p>
      </div>

      <div className="rider__doc">
        <div className="rider__field">
          <label>Ticket holder, sign here:</label>
          <input value={name} placeholder="Josie"
            onChange={e=>setName(e.target.value)} maxLength={28} />
        </div>

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
          <li>Front-row access to a man who has confirmed, in writing, that he will not freeze.</li>
          <li>One (1) guaranteed non-awkward goodbye. No Uber required.</li>
          <li>Complimentary nerves, served warm, on the house.</li>
          <li>Goldendoodle approval pending. Your co-pilot retains full veto power.</li>
          <li>The surprise location he's been "eyeballing the last few times in Chicago." Finally revealed.</li>
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

Terms accepted (yes, even the freezing clause). You may now proceed to not be a total letdown. Don't make me regret this. 😌`;
  const sms = `sms:${phone}?&body=${encodeURIComponent(body)}`;

  return (
    <div className="panel screen-enter" style={{maxWidth:'820px'}}>
      <div className="confirm-banner">
        <span className="script">You're in, {holder}.</span>
        <p className="type">TICKET ISSUED · screenshot this, then confirm with the headliner.</p>
      </div>

      <div className="ticket-wrap">
        <div className="ticket">
          <div className={"soldout"+(sold?" show":"")}>Sold Out</div>

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
              <img className="ticket__photo" src="assets/josie-v2.jpg" alt="Josie" />
              <div className="tgrid">
                <div className="tcell"><label>Ticket Holder</label><div className="v red">{holder}</div></div>
                <div className="tcell"><label>Headliner</label><div className="v">Matt Yee</div></div>
                <div className="tcell"><label>Showing</label><div className="v sm">{night.no} · {night.short}</div></div>
                <div className="tcell"><label>Venue</label><div className="v sm">Chicago, IL</div></div>
                <div className="tcell"><label>Section</label><div className="v">Front Row</div></div>
              </div>
            </div>

            <div className="ticket__perksline type">
              <b>Includes:</b> non-awkward goodbye (×1) · zero (0) freezing · complimentary nerves ·
              surprise location reveal · dog veto rights reserved.
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
          {texted ? '✓ Sent to Matt. Now don’t freeze' : 'Confirm → Text Matt 📲'}
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

Object.assign(window, { Poster, Dates, Rider, TicketScreen, NIGHTS });
