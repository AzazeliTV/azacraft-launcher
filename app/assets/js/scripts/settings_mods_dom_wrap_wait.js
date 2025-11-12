
// === Mods Dropdown (No EJS) — safe version that waits for DOM containers ===
(function(){
  const NEED_IDS = ['settingsReqModsContent','settingsOptModsContent','settingsDropinModsContent'];
  const START = performance.now();
  const TIMEOUT_MS = 15000;

  function byId(id){ return document.getElementById(id); }
  function anyFound(){ return NEED_IDS.some(id => byId(id)); }

  function ready(fn){
    if(document.readyState === 'complete' || document.readyState === 'interactive'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  }

  function tick(){
    if (anyFound()) return init();
    if ((performance.now() - START) > TIMEOUT_MS) return; // give up silently
    requestAnimationFrame(tick);
  }

  ready(tick);

  function init(){
    const LS_KEY = 'modsDropdownState';
    const defaultState = { req: true, opt: true, dropin: true };
    let state = defaultState;
    try { const raw = localStorage.getItem(LS_KEY); if(raw) state = { ...defaultState, ...JSON.parse(raw) }; } catch(e){}

    const reqC  = byId('settingsReqModsContent');
    const optC  = byId('settingsOptModsContent');
    const dropC = byId('settingsDropinModsContent');
    if(!reqC && !optC && !dropC) return;

    const mount =
      (reqC && reqC.parentElement && reqC.parentElement.parentElement) ||
      (optC && optC.parentElement && optC.parentElement.parentElement) ||
      (dropC && dropC.parentElement && dropC.parentElement.parentElement) ||
      document.body;

    function createSection(key, title, contentEl){
      const section = document.createElement('section');
      section.className = 'settingsModsSection';
      section.id = key+'ModsSection';

      const header = document.createElement('button');
      header.type = 'button';
      header.className = 'settingsModsHeader';
      header.setAttribute('aria-expanded','true');
      header.setAttribute('data-section', key);

      const left = document.createElement('div');
      left.className = 'settingsModsHeaderLeft';

      const chev = document.createElementNS('http://www.w3.org/2000/svg','svg');
      chev.setAttribute('viewBox','0 0 24 24');
      chev.setAttribute('aria-hidden','true');
      chev.classList.add('settingsModsChevron');
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('fill','currentColor');
      path.setAttribute('d','M7 10l5 5 5-5z');
      chev.appendChild(path);

      const titleEl = document.createElement('span');
      titleEl.className = 'settingsModsTitle';
      titleEl.textContent = title;

      left.appendChild(chev);
      left.appendChild(titleEl);

      const badge = document.createElement('span');
      badge.className = 'settingsModsBadge';
      badge.id = key+'ModsCount';
      badge.textContent = '0';

      header.appendChild(left);
      header.appendChild(badge);

      const list = document.createElement('div');
      list.className = 'settingsModsList';
      list.id = key+'ModsList';

      const inner = document.createElement('div');
      inner.className = 'settingsModsListInner';

      const holder = document.createElement('div');
      holder.id = contentEl.id;
      while(contentEl.firstChild){ holder.appendChild(contentEl.firstChild); }
      contentEl.replaceWith(holder);

      inner.appendChild(holder);
      list.appendChild(inner);
      section.appendChild(header);
      section.appendChild(list);

      const expanded = !!state[key];
      header.toggleAttribute('expanded', expanded);
      if(expanded) list.setAttribute('expanded','true');

      header.addEventListener('click', ()=>{
        const isExpanded = list.hasAttribute('expanded') ? false : true;
        header.setAttribute('aria-expanded', String(isExpanded));
        header.toggleAttribute('expanded', isExpanded);
        if(isExpanded) list.setAttribute('expanded','true');
        else list.removeAttribute('expanded');
        state[key] = isExpanded;
        try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch(e){}
        updateCounters();
      });

      return { section, badge, holder };
    }

    const sections = [];
    if(reqC)  sections.push(createSection('req',  'Benötigte Mods', reqC));
    if(optC)  sections.push(createSection('opt',  'Optionale Mods', optC));
    if(dropC) sections.push(createSection('dropin','Drop-in Mods', dropC));

    sections.forEach(({section}) => mount.appendChild(section));

    function setEmptyIfNeeded(holder){
      const hasAny = Array.from(holder.children).some(c => !c.classList || !c.classList.contains('settingsModsEmpty'));
      if(!hasAny){
        const empty = document.createElement('div');
        empty.className = 'settingsModsEmpty';
        empty.textContent = 'Keine Einträge.';
        holder.appendChild(empty);
      }
    }

    function updateCounters(){
      sections.forEach(({badge, holder})=>{
        const count = holder.querySelectorAll('.settingsMod, .settingsSubMod, .settingsDropinMod').length;
        badge.textContent = String(count);
        if(count === 0) setEmptyIfNeeded(holder);
      });
    }

    const mo = new MutationObserver(()=> updateCounters());
    sections.forEach(({holder})=> mo.observe(holder, { childList:true, subtree:true }));

    setTimeout(updateCounters, 0);
    window.__applyModsCounters = updateCounters;
  }
})();
