(function () {
  const BANK = window.QBANK.map((q, i) => ({ ...q, id: i }));
  const PARTS = window.PARTS;
  const MOCK_WEIGHTS = { P1: 4, P2: 5, P3: 5, P4: 15, P5: 14, P6: 8, P7: 7, AX: 2 };
  const PASS = 0.6;
  const LS_KEY = 'e18.history.v1', LS_RUN = 'e18.run.v1';
  const $ = (s, el = document) => el.querySelector(s);
  const app = $('#app');

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmt = (s) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };

  let run = null; // current attempt
  let tick = null;

  /* ----- building an attempt ----- */
  function pick(mode, part) {
    if (mode === 'mock') {
      const out = [];
      Object.entries(MOCK_WEIGHTS).forEach(([p, n]) => out.push(...shuffle(BANK.filter((q) => q.p === p)).slice(0, n)));
      return shuffle(out);
    }
    if (mode === 'quick') return shuffle(BANK).slice(0, 15);
    if (mode === 'part') return shuffle(BANK.filter((q) => q.p === part));
    if (mode === 'schem') return shuffle(BANK.filter((q) => q.s));
    return [];
  }
  function start(mode, part) {
    const qs = pick(mode, part);
    run = {
      mode, part, practice: mode !== 'mock',
      items: qs.map((q) => ({ id: q.id, order: shuffle([0, 1, 2, 3]), pick: null, flag: false })),
      i: 0, started: Date.now(), limit: mode === 'mock' ? 120 * 60 : 0, done: false, showNav: false, confirm: false
    };
    save(); renderQuestion();
  }
  function save() { if (run && !run.done) store.set(LS_RUN, run); else store.del(LS_RUN); }
  const Q = (it) => BANK[it.id];

  /* ----- home ----- */
  function renderHome() {
    clearInterval(tick);
    const hist = store.get(LS_KEY, []);
    const resume = store.get(LS_RUN, null);
    const counts = {}; BANK.forEach((q) => counts[q.p] = (counts[q.p] || 0) + 1);
    const nSch = BANK.filter((q) => q.s).length;
    app.innerHTML = `
      <section class="hero">
        <div class="hero-in">
          <p class="eyebrow">BS 7671:2018+A4:2026 · IET Wiring Regulations</p>
          <h1>Practise for the 18th Edition exam</h1>
          <p class="lede">${BANK.length} original questions across every Part, ${nSch} of them built on wiring schematics. The full mock follows the C&amp;G 2382-22 format: 60 questions, 2 hours, open book, 60% to pass.</p>
          <div class="hero-fig">${window.renderSchematic({ type: 'loop', ze: '0.35 Ω', sum: '0.62 Ω' })}</div>
        </div>
      </section>
      <div class="wrap">
        ${resume ? `<div class="resume"><div><strong>Attempt in progress</strong><span>${modeName(resume.mode, resume.part)} · ${resume.items.filter((x) => x.pick !== null).length}/${resume.items.length} answered</span></div><div class="row"><button class="btn primary" id="resume">Resume</button><button class="btn ghost" id="discard">Discard</button></div></div>` : ''}
        <h2 class="sec">Choose a mode</h2>
        <div class="modes">
          <button class="mode feature" data-mode="mock">
            <span class="m-k">Full mock exam</span>
            <span class="m-big">60 <small>questions</small></span>
            <span class="m-meta">2 h timer · weighted by Part · results at the end</span>
          </button>
          <button class="mode" data-mode="quick">
            <span class="m-k">Quick practice</span>
            <span class="m-big">15 <small>questions</small></span>
            <span class="m-meta">Instant feedback and explanations</span>
          </button>
          <button class="mode" data-mode="schem">
            <span class="m-k">Schematics drill</span>
            <span class="m-big">${nSch} <small>diagrams</small></span>
            <span class="m-meta">Earthing systems, loop paths, zones, tests</span>
          </button>
        </div>
        <h2 class="sec">Practise by Part</h2>
        <div class="parts">
          ${Object.entries(PARTS).map(([k, v]) => `<button class="part" data-part="${k}"><span>${esc(v)}</span><span class="cnt">${counts[k] || 0}</span></button>`).join('')}
        </div>
        <h2 class="sec">Recent attempts</h2>
        ${hist.length ? `<table class="hist"><thead><tr><th>Date</th><th>Mode</th><th>Score</th><th>Result</th></tr></thead><tbody>${hist.slice(0, 8).map((h) => `<tr><td>${new Date(h.at).toLocaleDateString()}</td><td>${esc(h.mode)}</td><td class="num">${h.score}/${h.total} · ${Math.round(h.score / h.total * 100)}%</td><td><span class="chip ${h.score / h.total >= PASS ? 'ok' : 'bad'}">${h.score / h.total >= PASS ? 'Pass' : 'Below 60%'}</span></td></tr>`).join('')}</tbody></table>` : `<p class="muted">No attempts yet. Finished attempts appear here, saved in this browser only.</p>`}
        <p class="note">Questions are written for practice and are not reproduced from BS 7671. Always check the answer against your own copy of the book, as you will in the open-book exam.</p>
      </div>`;
    app.querySelectorAll('.mode').forEach((b) => b.onclick = () => start(b.dataset.mode));
    app.querySelectorAll('.part').forEach((b) => b.onclick = () => start('part', b.dataset.part));
    if (resume) {
      $('#resume').onclick = () => { run = resume; renderQuestion(); };
      $('#discard').onclick = () => { store.del(LS_RUN); renderHome(); };
    }
    window.scrollTo(0, 0);
  }
  const modeName = (m, p) => ({ mock: 'Full mock exam', quick: 'Quick practice', schem: 'Schematics drill', part: PARTS[p] || 'By Part' }[m]);

  /* ----- question ----- */
  function timeLeft() { return run.limit - (Date.now() - run.started) / 1000; }
  function renderQuestion() {
    const it = run.items[run.i], q = Q(it);
    const answered = it.pick !== null;
    const reveal = run.practice && answered;
    const letters = 'ABCD';
    const total = run.items.length, nAns = run.items.filter((x) => x.pick !== null).length;
    app.innerHTML = `
      <div class="bar">
        <div class="bar-in">
          <button class="btn ghost sm" id="home" aria-label="Back to menu">Menu</button>
          <div class="prog"><span class="num">${run.i + 1}<i>/${total}</i></span><div class="track"><div style="width:${nAns / total * 100}%"></div></div></div>
          ${run.limit ? `<span class="timer num" id="timer">${fmt(timeLeft())}</span>` : `<span class="timer num muted">${nAns} answered</span>`}
          <button class="btn sm" id="finish">Finish</button>
        </div>
      </div>
      <div class="wrap qwrap">
        <div class="qhead"><span class="chip part-chip">${esc(PARTS[q.p])}</span>${it.flag ? '<span class="chip warn">Flagged</span>' : ''}</div>
        <h2 class="qtext">${esc(q.q)}</h2>
        ${q.s ? `<figure class="fig">${window.renderSchematic(q.s)}<figcaption class="legend"><span><i class="k kL"></i>Line</span><span><i class="k kN"></i>Neutral</span><span><i class="k kPE"></i>Protective</span><span><i class="k kK"></i>Other / unspecified</span></figcaption></figure>` : ''}
        <div class="opts" role="list">
          ${it.order.map((oi, pos) => {
            let cls = 'opt';
            if (it.pick === oi) cls += ' picked';
            if (reveal && oi === 0) cls += ' right';
            if (reveal && it.pick === oi && oi !== 0) cls += ' wrong';
            return `<button class="${cls}" data-oi="${oi}" ${reveal ? 'disabled' : ''}><span class="L">${letters[pos]}</span><span>${esc(q.o[oi])}</span></button>`;
          }).join('')}
        </div>
        ${reveal ? `<div class="explain ${it.pick === 0 ? 'ok' : 'bad'}"><strong>${it.pick === 0 ? 'Correct.' : 'Not quite. The answer is ' + letters[it.order.indexOf(0)] + '.'}</strong> ${esc(q.e)}<div class="ref">Look in: ${esc(q.r)}</div></div>` : ''}
        ${run.confirm ? confirmBox() : ''}
        <div class="nav">
          <button class="btn ghost" id="prev" ${run.i === 0 ? 'disabled' : ''}>Previous</button>
          <button class="btn ghost" id="flag">${it.flag ? 'Unflag' : 'Flag'}</button>
          <button class="btn ghost" id="grid">${run.showNav ? 'Hide' : 'All'} questions</button>
          ${run.i < total - 1 ? `<button class="btn primary" id="next">Next</button>` : `<button class="btn primary" id="end">Finish</button>`}
        </div>
        ${run.showNav ? `<div class="grid">${run.items.map((x, k) => `<button class="cell ${k === run.i ? 'cur' : ''} ${x.pick !== null ? (run.practice ? (x.pick === 0 ? 'ok' : 'bad') : 'ans') : ''} ${x.flag ? 'fl' : ''}" data-k="${k}">${k + 1}</button>`).join('')}</div>` : ''}
        <p class="muted kbd">Keys: A–D or 1–4 to answer, ←/→ to move, F to flag.</p>
      </div>`;

    app.querySelectorAll('.opt').forEach((b) => b.onclick = () => choose(+b.dataset.oi));
    app.querySelectorAll('.cell').forEach((b) => b.onclick = () => go(+b.dataset.k));
    $('#home').onclick = () => { save(); renderHome(); };
    $('#finish').onclick = askFinish;
    $('#prev').onclick = () => go(run.i - 1);
    $('#flag').onclick = () => { it.flag = !it.flag; save(); renderQuestion(); };
    $('#grid').onclick = () => { run.showNav = !run.showNav; renderQuestion(); };
    if ($('#next')) $('#next').onclick = () => go(run.i + 1);
    if ($('#end')) $('#end').onclick = askFinish;
    if ($('#cf-yes')) { $('#cf-yes').onclick = finish; $('#cf-no').onclick = () => { run.confirm = false; renderQuestion(); }; }
    clearInterval(tick);
    if (run.limit) tick = setInterval(() => {
      const t = timeLeft(), el = $('#timer');
      if (t <= 0) return finish();
      if (el) { el.textContent = fmt(t); el.classList.toggle('low', t < 600); }
    }, 1000);
  }
  function confirmBox() {
    const un = run.items.filter((x) => x.pick === null).length, fl = run.items.filter((x) => x.flag).length;
    return `<div class="confirm"><p><strong>Finish this attempt?</strong> ${un ? un + ' unanswered' : 'All answered'}${fl ? ', ' + fl + ' flagged' : ''}.</p><div class="row"><button class="btn primary" id="cf-yes">Finish and mark</button><button class="btn ghost" id="cf-no">Keep going</button></div></div>`;
  }
  function askFinish() { run.confirm = true; renderQuestion(); const c = $('.confirm'); if (c) c.scrollIntoView({ block: 'center' }); }
  function choose(oi) {
    const it = run.items[run.i];
    if (run.practice && it.pick !== null) return;
    it.pick = oi; save();
    if (!run.practice && run.i < run.items.length - 1) { renderQuestion(); }
    else renderQuestion();
  }
  function go(k) { if (k < 0 || k >= run.items.length) return; run.i = k; run.confirm = false; save(); renderQuestion(); window.scrollTo(0, 0); }

  /* ----- results ----- */
  function finish() {
    clearInterval(tick);
    run.done = true; run.confirm = false;
    const score = run.items.filter((x) => x.pick === 0).length;
    const hist = store.get(LS_KEY, []);
    hist.unshift({ at: Date.now(), mode: modeName(run.mode, run.part), score, total: run.items.length });
    store.set(LS_KEY, hist.slice(0, 30)); store.del(LS_RUN);
    renderResults('all');
  }
  function renderResults(filter) {
    const total = run.items.length, score = run.items.filter((x) => x.pick === 0).length, pct = score / total;
    const by = {};
    run.items.forEach((x) => { const p = Q(x).p; by[p] = by[p] || { n: 0, c: 0 }; by[p].n++; if (x.pick === 0) by[p].c++; });
    const used = Math.min((Date.now() - run.started) / 1000, run.limit || Infinity);
    const list = run.items.map((x, k) => ({ x, k })).filter(({ x }) => filter === 'all' || (filter === 'wrong' && x.pick !== 0) || (filter === 'flag' && x.flag));
    const letters = 'ABCD';
    app.innerHTML = `
      <div class="wrap">
        <section class="result">
          <div class="score-ring" style="--p:${pct * 100}"><div><span class="num big">${Math.round(pct * 100)}%</span><span class="muted">${score} of ${total}</span></div></div>
          <div class="result-side">
            <span class="chip lg ${pct >= PASS ? 'ok' : 'bad'}">${pct >= PASS ? 'Pass standard reached' : 'Below the 60% pass mark'}</span>
            <h1>${esc(modeName(run.mode, run.part))}</h1>
            <p class="muted">Time used ${fmt(used)}${run.limit ? ' of 2:00:00' : ''}. ${pct >= PASS ? 'Keep practising the weaker Parts below.' : 'Review the explanations and look each reference up in your book.'}</p>
            <div class="row"><button class="btn primary" id="again">Try another</button><button class="btn ghost" id="menu">Menu</button></div>
          </div>
        </section>
        <h2 class="sec">By Part</h2>
        <div class="bars">
          ${Object.keys(PARTS).filter((p) => by[p]).map((p) => { const r = by[p].c / by[p].n; return `<div class="pb"><span class="pb-l">${esc(PARTS[p])}</span><div class="pb-t"><div class="${r >= PASS ? 'ok' : 'bad'}" style="width:${r * 100}%"></div></div><span class="num pb-v">${by[p].c}/${by[p].n}</span></div>`; }).join('')}
        </div>
        <div class="rev-head"><h2 class="sec">Review</h2>
          <div class="seg" role="tablist">
            ${[['all', 'All'], ['wrong', 'Incorrect'], ['flag', 'Flagged']].map(([k, v]) => `<button class="${filter === k ? 'on' : ''}" data-f="${k}">${v}</button>`).join('')}
          </div>
        </div>
        <ol class="review">
          ${list.length ? list.map(({ x, k }) => { const q = Q(x); const ok = x.pick === 0; return `
            <li class="rv ${ok ? 'ok' : 'bad'}">
              <div class="rv-h"><span class="num">Q${k + 1}</span><span class="chip ${ok ? 'ok' : 'bad'}">${ok ? 'Correct' : x.pick === null ? 'Unanswered' : 'Incorrect'}</span><span class="muted sm">${esc(PARTS[q.p])}</span></div>
              <p class="rv-q">${esc(q.q)}</p>
              ${q.s ? `<figure class="fig small">${window.renderSchematic(q.s)}</figure>` : ''}
              ${!ok && x.pick !== null ? `<p class="yours">Your answer: ${letters[x.order.indexOf(x.pick)]}. ${esc(q.o[x.pick])}</p>` : ''}
              <p class="ans">Answer: ${letters[x.order.indexOf(0)]}. ${esc(q.o[0])}</p>
              <p class="exp">${esc(q.e)}</p><p class="ref">Look in: ${esc(q.r)}</p>
            </li>`; }).join('') : '<p class="muted">Nothing to show for this filter.</p>'}
        </ol>
      </div>`;
    $('#again').onclick = renderHome; $('#menu').onclick = renderHome;
    app.querySelectorAll('.seg button').forEach((b) => b.onclick = () => renderResults(b.dataset.f));
  }

  document.addEventListener('keydown', (e) => {
    if (!run || run.done || !$('.qwrap') || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase(); const idx = 'abcd'.indexOf(k) >= 0 ? 'abcd'.indexOf(k) : '1234'.indexOf(k);
    if (idx >= 0) { const b = app.querySelectorAll('.opt')[idx]; if (b && !b.disabled) b.click(); }
    else if (e.key === 'ArrowRight') go(run.i + 1);
    else if (e.key === 'ArrowLeft') go(run.i - 1);
    else if (k === 'f') $('#flag').click();
  });

  renderHome();
})();
