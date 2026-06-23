/* db.js: tiny shared persistence layer for the Redemption Tour.
   Static site (GitHub Pages) + Supabase Postgres behind a PUBLIC anon key.
   Safety comes from Row-Level Security (see supabase-setup.sql): anyone may
   read + append; nobody but you (via the dashboard) can edit or delete.

   Load order in each page's <head>, AFTER PostHog:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="/db.js"></script>        <!-- root-relative: every stamp shares one copy -->

   Then anywhere (all async):
     await DB.save('afterdark','rsvp',{day:'SAT',mode:'yes'});   // she answers
     var r     = await DB.load('afterdark','rsvp');              // latest value she set
     var notes = await DB.fromMatt('afterdark','note');          // things you left for her
     DB.onNew('afterdark', function(row){ ... });                // live updates

   Degrades gracefully: if Supabase is unset/unreachable, reads & writes fall
   back to localStorage so her experience never breaks. */
window.DB = (function () {
  // ---- config: paste from Supabase → Project Settings → API ----
  var SUPABASE_URL  = 'https://lrkdlvsrhhumlucjjakz.supabase.co';
  var SUPABASE_ANON = 'sb_publishable_KcMzM6fKCuzPnE6Bt9kbcA_hq0Uu7KF';  // publishable key, safe to ship (RLS-enforced)

  var configured = SUPABASE_URL.indexOf('http') === 0 && SUPABASE_ANON.length > 20;
  var sb = (configured && window.supabase)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON)
    : null;

  var who = 'josie';   // the public page is hers; set DB.who = 'matt' on an admin view

  function ck(stamp, kind, k){ return 'rt:' + stamp + ':' + kind + (k ? (':' + k) : ''); }
  function cache(stamp, kind, k, value){
    try{ localStorage.setItem(ck(stamp,kind,k), JSON.stringify({ value:value, at:Date.now() })); }catch(e){}
  }
  function cached(stamp, kind, k){
    try{ var r = JSON.parse(localStorage.getItem(ck(stamp,kind,k))); return r ? r.value : null; }catch(e){ return null; }
  }

  async function save(stamp, kind, value, opts){
    opts = opts || {};
    cache(stamp, kind, opts.k, value);                 // instant + offline mirror
    if(!sb) return { ok:false, offline:true };
    try{
      var res = await sb.from('entries').insert({
        who: opts.who || who, stamp: stamp, kind: kind, k: opts.k || null, value: value
      });
      return { ok: !res.error, error: res.error };
    }catch(e){ return { ok:false, error:e }; }
  }

  async function list(stamp, kind, opts){
    opts = opts || {};
    if(!sb){ var c = cached(stamp, kind, opts.k); return c == null ? [] : [{ value:c }]; }
    try{
      var q = sb.from('entries').select('*').eq('stamp', stamp).order('created_at', { ascending:false });
      if(kind)       q = q.eq('kind', kind);
      if(opts.who)   q = q.eq('who', opts.who);
      if(opts.k)     q = q.eq('k', opts.k);
      if(opts.limit) q = q.limit(opts.limit);
      var res = await q;
      return res.error ? [] : (res.data || []);
    }catch(e){ return []; }
  }

  async function load(stamp, kind, opts){              // latest single value
    var rows = await list(stamp, kind, Object.assign({ limit:1 }, opts || {}));
    return rows.length ? rows[0].value : cached(stamp, kind, (opts || {}).k);
  }

  function fromMatt(stamp, kind){ return list(stamp, kind || 'note', { who:'matt' }); }

  function onNew(stamp, cb){
    if(!sb) return function(){};
    var ch = sb.channel('rt:' + stamp)
      .on('postgres_changes',
          { event:'INSERT', schema:'public', table:'entries', filter:'stamp=eq.' + stamp },
          function(p){ try{ cb(p.new); }catch(e){} })
      .subscribe();
    return function(){ try{ sb.removeChannel(ch); }catch(e){} };  // unsubscribe
  }

  return {
    get who(){ return who; }, set who(v){ who = v; },
    save: save, load: load, list: list, fromMatt: fromMatt, onNew: onNew,
    ready: !!sb, client: sb
  };
})();
