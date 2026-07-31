// ===== LebotSchool PBL 静态版 · 渲染器 =====
(function() {
  const C = window.LEBOT_CONTENT;
  const app = document.getElementById('app');
  const esc = s => { const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; };

  function route() {
    const hash = location.hash || '#/';
    const match = hash.match(/^#\/project\/(pbl-\d+)$/);
    if (match) return renderProject(match[1]);
    if (hash.match(/^#\/task\/(pbl-\d+)\/(\w+)\/([\w-]+)$/)) {
      return renderTask(RegExp.$1, RegExp.$2, RegExp.$3);
    }
    renderHome();
  }

  // ===== 首页：6 个项目卡片 =====
  function renderHome() {
    const cards = C.projects.map(p => `
      <div class="card p-card" onclick="location.href='#/project/${p.id}'">
        <div class="pc-cover">${p.cover}</div>
        <div class="pc-title">${esc(p.title)}</div>
        <div class="pc-sub" style="font-size:13px;color:var(--ink-soft);margin:4px 0">${esc(p.subtitle)}</div>
        <div class="pc-meta">
          <span class="chip accent">${p.level}</span>
          <span class="chip tag">${p.hours}</span>
          ${(p.tags||[]).map(t => `<span class="chip tag">${esc(t)}</span>`).join('')}
        </div>
      </div>`).join('');

    app.innerHTML = `
      <div class="topbar">
        <span class="logo">🏫 LebotSchool</span>
        <span style="flex:1"></span>
        <span class="navlink" onclick="location.href='#/'">PBL 项目式课程</span>
      </div>
      <div class="wrap">
        <h1 style="font-size:28px;margin:24px 0 8px">📚 PBL 项目式课程</h1>
        <p style="color:var(--ink-soft);margin-bottom:8px">六个项目，从入门到高阶——造 AI 智能体，解决真实问题</p>
        <div class="card-grid">${cards}</div>
      </div>`;
  }

  // ===== 项目详情 =====
  function renderProject(pid) {
    const p = C.projects.find(x => x.id === pid);
    if (!p) return renderHome();

    const phasesHtml = (p.phases||[]).map(ph => {
      const meta = (C.phasesMeta||[]).find(m => m.id === ph.id) || {};
      const goals = (ph.phaseGoal||[]).map(g => `<div class="pn-goal">· ${esc(g)}</div>`).join('');
      return `<div class="phase-node" onclick="location.href='#/phases/${pid}/${ph.id}'">
        <div class="pn-name">${ph.icon||meta.icon||'📌'} ${esc(ph.name)}</div>
        <div class="pn-hours">${ph.hours||''} · ${(ph.tasks||[]).length} 个任务</div>
        ${goals}
      </div>`;
    }).join('');

    app.innerHTML = `
      <div class="topbar">
        <span class="logo" onclick="location.href='#/'">🏫 LebotSchool</span>
        <span style="flex:1"></span>
        <span class="navlink" onclick="location.href='#/'">← 项目列表</span>
      </div>
      <div class="wrap">
        <div class="chapter-hero card">
          <div class="ch-cover">${p.cover}</div>
          <div style="flex:1">
            <h1 style="font-size:24px">${esc(p.title)}</h1>
            <p style="font-size:14px;margin:8px 0"><b>项目背景：</b>${esc(p.intro)}</p>
            <div style="font-size:13px;margin-top:8px;line-height:1.8"><b>项目目标：</b>${(p.goals||[]).map((g,i) => `<div>${i+1}. ${esc(g)}</div>`).join('')}</div>
            <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
              <span class="chip accent">${p.level}</span><span class="chip tag">${p.hours}</span>
              ${(p.tags||[]).map(t => `<span class="chip tag">${esc(t)}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="phase-rail">${phasesHtml}</div>
      </div>`;
  }

  // ===== 活动下的任务列表（点击活动节点后） =====
  window.addEventListener('hashchange', route);
  // 劫持 #/phases/ 路由
  const origRoute = route;
  const origHashHandler = () => {
    const hash = location.hash;
    const m = hash.match(/^#\/phases\/(pbl-\d+)\/(\w+)$/);
    if (m) return renderPhase(m[1], m[2]);
    route();
  };
  window.removeEventListener('hashchange', origRoute);
  window.addEventListener('hashchange', origHashHandler);
  route = origHashHandler;

  function renderPhase(pid, phid) {
    const p = C.projects.find(x => x.id === pid);
    const ph = (p?.phases||[]).find(x => x.id === phid);
    if (!p || !ph) return route();

    const tasksHtml = (ph.tasks||[]).map((t,i) => `
      <div class="task-row" onclick="location.href='#/task/${pid}/${phid}/${t.id}'">
        <div class="task-title">${i+1}. ${esc(t.title)}</div>
        <div class="task-goal">🎯 ${esc(t.goal)}</div>
      </div>`).join('');

    app.innerHTML = `
      <div class="topbar">
        <span class="logo" onclick="location.href='#/'">🏫 LebotSchool</span>
        <span style="flex:1"></span>
        <span class="navlink" onclick="location.href='#/project/${pid}'">← ${esc(p.title)}</span>
      </div>
      <div class="wrap">
        <h2 style="font-size:20px;margin-top:16px">${ph.icon||''} ${esc(ph.name)}</h2>
        <p style="font-size:13px;color:var(--ink-soft);margin:4px 0 16px">${esc(ph.desc)} · ${(ph.tasks||[]).length} 个任务</p>
        ${(ph.phaseGoal||[]).map(g => `<div style="font-size:13px;color:var(--ink);margin:2px 0">· ${esc(g)}</div>`).join('')}
        <div class="task-list" style="margin-top:16px">${tasksHtml}</div>
      </div>`;
  }

  // ===== 任务详情 =====
  function renderTask(pid, phid, tid) {
    const p = C.projects.find(x => x.id === pid);
    const ph = (p?.phases||[]).find(x => x.id === phid);
    const t = (ph?.tasks||[]).find(x => x.id === tid);
    if (!t) return route();

    const af = t.artifactFields||[];
    let artifactHtml = '';
    if (t.artifactType === 'form') {
      artifactHtml = af.map((f,i) => `
        <div class="field"><label>${esc(f)}</label>
          <textarea rows="2" placeholder="在此填写…"></textarea>
        </div>`).join('');
    } else if (t.artifactType === 'table') {
      const rows = t.artifactRows||2;
      const labels = t.rowLabels;
      artifactHtml = `<table class="data-table"><thead><tr>${af.map(f => `<th>${esc(f)}</th>`).join('')}</tr></thead><tbody>${
        Array.from({length:rows}, (_,r) => `<tr>${af.map((_,ci) => {
          if (ci===0 && labels && labels[r]) return `<td class="dt-label">${esc(labels[r])}</td>`;
          return `<td><input type="text" placeholder="…"></td>`;
        }).join('')}</tr>`).join('')
      }</tbody></table>`;
    }

    const quizHtml = (t.quiz||[]).map((q,qi) => `
      <div class="quiz-block" data-qi="${qi}" data-answer="${q.answer}">
        <div class="quiz-q">${qi+1}. ${esc(q.q)}</div>
        <div class="quiz-opts">${(q.options||[]).map((o,i) => `
          <div class="quiz-opt" data-oi="${i}">${esc(o)}</div>`).join('')}</div>
      </div>`).join('');

    const stepsHtml = (t.steps||[]).map(s => `<li>${esc(s)}</li>`).join('');

    app.innerHTML = `
      <div class="topbar">
        <span class="logo" onclick="location.href='#/'">🏫 LebotSchool</span>
        <span style="flex:1"></span>
        <span class="navlink" onclick="location.href='#/phases/${pid}/${phid}'">← ${esc(ph.name)}</span>
      </div>
      <div class="wrap">
        <h2 style="font-size:20px;margin-top:16px">${esc(t.title)}</h2>
        <p style="font-size:14px;color:var(--ink-soft);margin-top:4px">🎯 ${esc(t.goal)}</p>

        ${t.tip ? `<div class="tip-box">💡 ${esc(t.tip)}</div>` : ''}

        <h3 style="font-size:16px;margin-top:20px">📋 怎么做</h3>
        <ol class="step-list">${stepsHtml}</ol>

        <h3 style="font-size:16px;margin-top:20px">✍️ 我的作品</h3>
        <div class="card" style="margin-top:8px">${artifactHtml || '<p style="font-size:13px;color:var(--ink-soft)">（查看步骤，按要求完成作品）</p>'}</div>
        ${t.artifactHint ? `<p style="font-size:12px;color:var(--ink-soft);margin-top:6px">💡 ${esc(t.artifactHint)}</p>` : ''}

        ${t.knowledgeCard ? `
        <div class="knowledge-card">
          <div class="kc-head"><span style="font-size:20px">💡</span> 知识卡片</div>
          <div class="kc-body">${esc(t.knowledgeCard).replace(/\n/g,'<br>')}</div>
        </div>` : ''}

        ${quizHtml ? `<h3 style="font-size:16px;margin-top:20px">💭 思考</h3>${quizHtml}` : ''}
      </div>`;

    // Quiz click handler
    app.querySelectorAll('.quiz-opt').forEach(opt => {
      opt.onclick = () => {
        const qb = opt.closest('.quiz-block');
        const answer = +qb.dataset.answer;
        const oi = +opt.dataset.oi;
        qb.querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('right','wrong'));
        opt.classList.add(oi === answer ? 'right' : 'wrong');
        if (oi !== answer) qb.querySelector(`.quiz-opt[data-oi="${answer}"]`).classList.add('right');
      };
    });
  }

  // 启动
  route();
})();