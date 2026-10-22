/* =============================================================
   resume.js — builds the printable one-page resume from
   content.js.  Classic script, so it runs after content.js.
   -------------------------------------------------------------
   Edit content.js and this page updates itself.
   ============================================================= */

(function () {
  'use strict';

  const P = window.PORTFOLIO;
  const sheet = document.getElementById('sheet');
  if (!P || !sheet) return;

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /* ---------- small helpers ---------- */

  // "Beginner" -> "beginner" (used to build the CSS class)
  const slug = (s) => String(s ?? '').trim().toLowerCase().replace(/[^a-z]/g, '');

  // Keep only the useful lines of a project: two highlights is the sweet spot
  // for a one-pager — the full list lives on the website.
  const highlights = (proj, n = 2) => (proj.highlights || []).slice(0, n);

  // Every project in the site, flattened, de-duplicated by title.
  const allProjects = () => {
    const seen = new Set();
    const out = [];
    (P.planets || []).forEach((pl) => {
      (pl.projects || []).forEach((pr) => {
        const key = pr.title.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        out.push({ ...pr, domain: pl.name });
      });
    });
    return out;
  };

  // A short role line under each project name.
  const projectRole = (pr) => {
    if (pr.domain === 'AI & LLM' && pr.title.startsWith('GapBridge')) {
      return 'Team of 4 · My part: RAG chatbot + frontend integration';
    }
    if (pr.domain === 'AI & LLM') return 'Solo · Diploma project';
    if (pr.domain === 'Backend') return 'Solo · GapBridge engine';
    if (pr.domain === 'Frontend') return 'Solo · Personal project';
    return pr.domain;
  };

  /* ---------- header ---------- */

  function header() {
    const p = P.profile;
    const l = p.links || {};
    const items = [
      p.email ? `<li><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></li>` : '',
      p.phone ? `<li>${esc(p.phone)}</li>` : '',
      p.location ? `<li>${esc(p.location)}</li>` : '',
      l.github ? `<li><a href="${esc(l.github)}" target="_blank" rel="noopener">github.com/${esc(String(l.github).split('/').filter(Boolean).pop())}</a></li>` : '',
      l.linkedin ? `<li><a href="${esc(l.linkedin)}" target="_blank" rel="noopener">linkedin.com/in/${esc(String(l.linkedin).split('/').filter(Boolean).pop())}</a></li>` : ''
    ].filter(Boolean);

    return `
      <header class="r-head">
        ${p.photo ? `<img class="r-photo" src="${esc(p.photo)}" alt="${esc(p.name)}" />` : ''}
        <div class="r-id">
          <h1 class="r-name">${esc(p.name)}</h1>
          <p class="r-role">${esc(p.role)}</p>
          <p class="r-tag">${esc(p.tagline)}</p>
          <ul class="r-contact">${items.join('<span class="dot">&bull;</span>')}</ul>
        </div>
      </header>`;
  }

  /* ---------- main column ---------- */

  function projectsSection() {
    const list = allProjects();
    if (!list.length) return '';

    return `
      <section class="sec">
        <h2 class="sec-title">Projects</h2>
        ${list.map((pr) => `
          <div class="proj">
            <div class="proj-head">
              <span class="proj-name">${esc(pr.title)}</span>
              <span class="proj-role">${esc(projectRole(pr))}</span>
            </div>
            <p class="proj-blurb">${esc(pr.blurb || '')}</p>
            ${highlights(pr).length ? `<ul>${highlights(pr).map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
            ${(pr.tech || []).length ? `<div class="tech">${pr.tech.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
          </div>`).join('')}
      </section>`;
  }

  function educationSection() {
    const edu = P.education || [];
    if (!edu.length) return '';

    return `
      <section class="sec">
        <h2 class="sec-title">Education</h2>
        ${edu.map((e) => `
          <div class="edu">
            <div class="edu-head">
              <span class="edu-deg">${esc(e.degree)}</span>
              <span class="edu-when">${esc(e.period || '')}</span>
            </div>
            <div class="edu-org">${esc(e.school || '')}</div>
            ${e.note ? `<div class="edu-note">${esc(e.note)}</div>` : ''}
            ${(e.points || []).length ? `<ul>${e.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
          </div>`).join('')}
      </section>`;
  }

  /* ---------- sidebar ---------- */

  function skillsSection() {
    const groups = (P.planets || []).filter((pl) => (pl.skills || []).length);
    if (!groups.length) return '';

    // Rank levels so the strongest ones read first.
    const RANK = { advanced: 0, intermediate: 1, learning: 2, beginner: 3 };
    const rank = (l) => RANK[String(l || '').toLowerCase()] ?? 4;

    return `
      <section class="sec">
        <h2 class="sec-title">Skills</h2>
        ${groups.map((pl) => {
          // Split the domain's skills into runs of the same level.
          const runs = [];
          (pl.skills || [])
            .slice()
            .sort((a, b) => rank(a.level) - rank(b.level))
            .forEach((s) => {
              const last = runs[runs.length - 1];
              if (last && last.level === s.level) last.items.push(s.name);
              else runs.push({ level: s.level, items: [s.name] });
            });

          const body = runs.map((r) => {
            const names = r.items.map((n) => esc(n)).join(' &middot; ');
            // Only prefix the level when the domain has more than one level.
            return runs.length > 1
              ? `<span class="lvl lvl-${slug(r.level)}">${esc(r.level)}</span> ${names}`
              : names;
          }).join('<br>');

          return `
            <div class="skill-group">
              <b>${esc(pl.name)}</b>
              <p class="skill-line">${body}</p>
            </div>`;
        }).join('')}
      </section>`;
  }

  function achievementsSection() {
    const ach = P.achievements || [];
    if (!ach.length) return '';

    return `
      <section class="sec">
        <h2 class="sec-title">Achievements</h2>
        ${ach.map((a) => `
          <div class="ach">
            <b>${esc(a.title)}</b>
            <span>${esc(a.detail || '')}</span>
          </div>`).join('')}
      </section>`;
  }

  function interestsSection() {
    const ints = P.interests || [];
    if (!ints.length) return '';

    return `
      <section class="sec">
        <h2 class="sec-title">Interests</h2>
        <ul class="interests">${ints.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
      </section>`;
  }

  /* ---------- assemble ---------- */

  sheet.innerHTML = `
    ${header()}
    <div class="r-body">
      <main class="r-main">
        ${P.summary ? `<section class="sec"><h2 class="sec-title">Summary</h2><p class="summary">${esc(P.summary)}</p></section>` : ''}
        ${projectsSection()}
        ${educationSection()}
      </main>
      <aside class="r-side">
        ${skillsSection()}
        ${achievementsSection()}
        ${interestsSection()}
      </aside>
    </div>
    <footer class="r-foot">
      <span>${esc(P.profile.name)} &middot; ${esc(P.profile.role)}</span>
      <span>${esc(P.profile.email || '')}</span>
    </footer>`;

  /* ---------- print button ---------- */

  const printBtn = document.getElementById('printBtn');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  // Mark the document as ready so the headless check can wait on it.
  document.documentElement.setAttribute('data-resume-ready', '1');
})();
