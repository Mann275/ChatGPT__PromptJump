// content_script.js — PromptJump (fixed + ordered so createPanelIfMissing exists)
console.log("PromptJump content script loaded (bridge-ready).");

/* ---------- Helpers ---------- */
function getChatKey() {
  try {
    const origin = location.origin;
    const m = location.pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
    if (m) return origin + "/c/" + m[1];
    return origin + location.pathname + location.search;
  } catch {
    return location.href;
  }
}
function savePromptItem(item) {
  chrome.storage.local.get({ prompts: [] }, (res) => {
    const arr = res.prompts || [];
    arr.unshift(item);
    if (arr.length > 2000) arr.length = 2000;
    chrome.storage.local.set({ prompts: arr });
  });
}

/* ---------- Capture prompts (Enter + send buttons) ---------- */
function recordPrompt(text) {
  try {
    const chatKey = getChatKey();
    const promptId = "pj-" + Date.now() + "-" + Math.random().toString(36).slice(2,7);

    setTimeout(() => {
      // try annotate DOM node
      const nodes = Array.from(document.querySelectorAll("div")).reverse();
      for (const n of nodes) {
        try {
          const s = (n.innerText || "").trim();
          if (!s) continue;
          if (s === text || s.startsWith(text) || s.includes(text.slice(0, Math.min(50, text.length)))) {
            n.setAttribute("data-prompt-id", promptId);
            break;
          }
        } catch {}
      }
      savePromptItem({ promptId, text, chatKey, date: new Date().toISOString() });
      window.dispatchEvent(new Event("pj_refresh_list"));
    }, 350);
  } catch (e) {
    console.warn("PromptJump recordPrompt error", e);
  }
}

function attachSendHooks() {
  // helper: try to hook textarea + buttons
  function tryHook() {
    tryTextarea();
    tryButtons();
  }

  function tryTextarea() {
    const ta = document.querySelector("textarea");
    if (!ta) return false;
    if (ta._pj_hooked) return true;
    ta._pj_hooked = true;
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const text = (ta.value || "").trim();
        if (text) recordPrompt(text);
      }
    });
    return true;
  }

  function tryButtons() {
    const btns = Array.from(document.querySelectorAll("button"));
    if (!btns.length) return false;
    btns.forEach(b => {
      if (b._pj_hooked) return;
      b._pj_hooked = true;
      b.addEventListener("click", () => {
        const ta = document.querySelector("textarea");
        const text = ta ? (ta.value || "").trim() : "";
        if (text) recordPrompt(text);
      });
    });
    return true;
  }

  // setup observer (use document.documentElement as safe fallback)
  const observerTarget = () => document.body || document.documentElement || document;
  const obs = new MutationObserver(() => {
    tryHook();
  });

  // If DOM already ready -> run setup immediately
  function setupObserver() {
    tryHook();
    try {
      const target = observerTarget();
      // ensure target is Node
      if (target && typeof target.appendChild !== "undefined") {
        obs.observe(target, { childList: true, subtree: true });
      } else {
        // fallback: poll for body if something odd
        const poll = setInterval(() => {
          const t = observerTarget();
          if (t && typeof t.appendChild !== "undefined") {
            clearInterval(poll);
            obs.observe(t, { childList: true, subtree: true });
          }
        }, 300);
      }
    } catch (e) {
      console.warn("PromptJump: observer setup failed, will poll instead", e);
      const poll = setInterval(() => {
        tryHook();
      }, 600);
      // stop polling once hooks found
      setTimeout(() => clearInterval(poll), 30000);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupObserver, { once: true });
  } else {
    setupObserver();
  }

  // extra safety: also try periodically for first few seconds
  let tries = 0;
  const periodic = setInterval(() => {
    tries++;
    tryHook();
    if (tries > 30) clearInterval(periodic); // stop after ~30*200ms = 6s
  }, 200);
}


/* ---------- Scroll helper ---------- */
function scrollToPromptById(promptId, textFallback) {
  try {
    const el = document.querySelector(`[data-prompt-id="${promptId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const prev = el.style.boxShadow;
      el.style.transition = "box-shadow 0.3s";
      el.style.boxShadow = "0 0 0 6px rgba(255,204,0,0.6)";
      setTimeout(()=> el.style.boxShadow = prev, 1500);
      return true;
    }
    if (textFallback) {
      const nodes = Array.from(document.querySelectorAll("div")).reverse();
      for (const n of nodes) {
        try {
          const s = (n.innerText || "").trim();
          if (!s) continue;
          if (s === textFallback || s.includes(textFallback.slice(0, Math.min(50, textFallback.length)))) {
            n.setAttribute("data-prompt-id", promptId);
            n.scrollIntoView({ behavior: "smooth", block: "center" });
            const prev = n.style.boxShadow;
            n.style.transition = "box-shadow 0.3s";
            n.style.boxShadow = "0 0 0 6px rgba(255,204,0,0.6)";
            setTimeout(()=> n.style.boxShadow = prev, 1500);
            return true;
          }
        } catch {}
      }
    }
  } catch (e) {
    console.warn("PromptJump scrollToPrompt error", e);
  }
  return false;
}

/* ---------- chrome.runtime listener ---------- */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  try {
    if (msg && msg.type === "scrollToPrompt") {
      const ok = scrollToPromptById(msg.promptId, msg.text);
      sendResponse({ ok });
      return true;
    }
  } catch (e) {
    sendResponse({ ok:false, error: e && e.message });
    return true;
  }
});

/* ---------- UI: createPanel FIRST (to avoid 'not defined' errors) ---------- */
function createPanelIfMissing() {
  if (document.getElementById("pj-panel-root")) return;
  const root = document.createElement("div");
  root.id = "pj-panel-root";
  root.innerHTML = `
    <style>
      #pj-panel { position: fixed; right: 18px; bottom: 120px; width: 360px; height: 420px;
        background: rgba(7,18,37,0.84);
        color:#dbe8f0; border-radius:12px; box-shadow:0 20px 60px rgba(0,0,0,0.6);
        z-index:2147483647; font-family: system-ui, Arial; display:flex; flex-direction:column; overflow:hidden; border:1px solid rgba(255,255,255,0.04); }
      #pj-head { display:flex; align-items:center; gap:8px; padding:10px; cursor:grab; user-select:none; }
      #pj-title { font-size:15px; font-weight:700; color:#fff; margin-right:8px; }
      #pj-desc { font-size:11px; color:#aebfc7; margin-left:6px; }
      #pj-close { margin-left:auto; background:transparent; border:none; color:#cbd5e1; cursor:pointer; font-size:16px; padding:6px; border-radius:6px;}
      #pj-search { margin:10px; padding:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); background:rgba(10,20,34,0.6); color:#e6eef3; outline:none;}
      #pj-list { padding:10px; overflow:auto; flex:1; }
      .pj-item { padding:8px; border-radius:8px; margin-bottom:8px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.02); cursor:pointer; color:#e6eef3; }
      .pj-meta { font-size:11px; color:#9aa6ad; margin-bottom:6px; }
      .pj-empty { text-align:center; color:#9aa6ad; margin-top:20px; }
      #pj-foot { padding:8px 10px; border-top:1px solid rgba(255,255,255,0.02); font-size:11px; color:#9aa6ad; display:flex; justify-content:space-between; align-items:center;}
      #pj-refresh { padding:6px 8px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); background:rgba(10,20,34,0.6); color:#e6eef3; cursor:pointer;}
      #pj-report { background:transparent; color:#9aa6ad; border:none; cursor:pointer; text-decoration:underline; font-size:12px; }
      #pj-made { font-size:11px; color:#9aa6ad; opacity:0.9; }
    </style>

    <div id="pj-panel" role="dialog" aria-label="PromptJump" style="display:none">
      <div id="pj-head">
        <div id="pj-title">Prompts</div>
        <div id="pj-desc">Jump to saved prompts for this chat</div>
        <button id="pj-close" title="Close">✕</button>
      </div>
      <input id="pj-search" placeholder="Search prompts..." />
      <div id="pj-list"><div class="pj-empty">Loading...</div></div>
      <div id="pj-foot">
        <div id="pj-made">Made with ❤️</div>
        <div>
          <button id="pj-refresh">Refresh</button>
          <button id="pj-report">Report an issue</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  // Make panel draggable
  (function makeDraggable(){
    const panel = document.getElementById("pj-panel");
    const head = document.getElementById("pj-head");
    let dragging=false, ox=0, oy=0;
    head.addEventListener("mousedown", (e)=>{ dragging=true; ox = e.clientX - panel.getBoundingClientRect().left; oy = e.clientY - panel.getBoundingClientRect().top; head.style.cursor='grabbing';});
    window.addEventListener("mousemove", (e)=>{ if(!dragging) return; panel.style.left = (e.clientX - ox) + "px"; panel.style.top = (e.clientY - oy) + "px"; panel.style.right = "auto"; panel.style.bottom = "auto"; });
    window.addEventListener("mouseup", ()=>{ dragging=false; head.style.cursor='grab';});
  })();

  // wire controls
  document.getElementById("pj-close").addEventListener("click", hidePanelAndShowIcon);
  document.getElementById("pj-refresh").addEventListener("click", renderList);
  document.getElementById("pj-search").addEventListener("input", debounce(renderList, 120));
  document.getElementById("pj-report").addEventListener("click", ()=> {
    window.open("https://github.com/your-repo/issues/new", "_blank");
  });

  // initial render
  setTimeout(renderList, 150);
}

/* ---------- UI: small icon (only) ---------- */
function createSmallIcon() {
  // don't create twice
  if (document.getElementById("pj-small-icon")) return;

  function actuallyCreate() {
    // double-check again (race-safe)
    if (document.getElementById("pj-small-icon")) return;
    const btn = document.createElement("button");
    btn.id = "pj-small-icon";
    btn.title = "Open PromptJump";
    btn.innerText = "💬";
    Object.assign(btn.style, {
      position: "fixed",
      right: "14px",
      bottom: "86px",
      width: "44px",
      height: "44px",
      borderRadius: "10px",
      zIndex: 2147483647,
      border: "none",
      background: "rgba(10, 16, 28, 0.95)",
      color: "#e6eef3",
      boxShadow: "0 8px 18px rgba(0,0,0,0.4)",
      cursor: "pointer",
      fontSize: "18px"
    });
    btn.addEventListener("click", () => {
      btn.style.display = "none";
      showPanel();
    });

    // prefer body, fallback to documentElement
    const mount = document.body || document.documentElement;
    try {
      mount.appendChild(btn);
    } catch (e) {
      // final fallback: use setTimeout retry append
      setTimeout(() => {
        try {
          (document.body || document.documentElement || document).appendChild(btn);
        } catch (err) {
          console.warn("PromptJump: failed to mount small icon", err);
        }
      }, 200);
    }
  }

  // If DOM not ready, wait for it
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", actuallyCreate, { once: true });
    // but also try after small delay in case DOMContentLoaded already fired
    setTimeout(() => {
      if (!document.getElementById("pj-small-icon")) actuallyCreate();
    }, 400);
  } else {
    actuallyCreate();
  }
}


function showPanel() {
  // ensure panel exists
  try {
    createPanelIfMissing();
  } catch(e) {
    console.warn("PromptJump: createPanelIfMissing failed", e);
    return;
  }
  const panel = document.getElementById("pj-panel");
  if (panel) panel.style.display = "flex";
  const s = document.getElementById("pj-small-icon");
  if (s) s.style.display = "none";
}
function hidePanelAndShowIcon() {
  const panel = document.getElementById("pj-panel");
  if (panel) panel.style.display = "none";
  const s = document.getElementById("pj-small-icon");
  if (s) s.style.display = "block";
}

/* ---------- render list with robust matching ---------- */
function formatDate(iso) { try { return new Date(iso).toLocaleString(); } catch { return iso; } }
function escapeHtml(s) { return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }

function renderList() {
  const listEl = document.getElementById("pj-list"); if(!listEl) return;
  listEl.innerHTML = '<div class="pj-empty">Loading...</div>';
  const q = (document.getElementById("pj-search") && document.getElementById("pj-search").value || "").toLowerCase().trim();
  const chatKey = getChatKey();
  const pathnameOnly = location.pathname;

  chrome.storage.local.get({ prompts: [] }, (res) => {
    let items = (res.prompts || []).filter(p => {
      if (!p || !p.chatKey) return false;
      if (p.chatKey === chatKey) return true;
      if (p.chatKey.endsWith(pathnameOnly)) return true;
      try {
        const a = p.chatKey.match(/\/c\/([a-zA-Z0-9-]+)/);
        const b = chatKey.match(/\/c\/([a-zA-Z0-9-]+)/);
        if (a && b && a[1] === b[1]) return true;
      } catch {}
      return false;
    });

    if (!items.length) {
      const all = (res.prompts || []).slice(0, 50);
      if (!q && all.length) items = all.slice(0, 8);
    }

    if (q) items = items.filter(p => p.text && p.text.toLowerCase().includes(q));
    if (!items.length) {
      listEl.innerHTML = '<div class="pj-empty">No prompts for this chat yet. Send one and click Refresh.</div>';
      return;
    }

    listEl.innerHTML = "";
    items.forEach(it => {
      const d = document.createElement("div");
      d.className = "pj-item";
      d.innerHTML = `<div class="pj-meta">${formatDate(it.date)}</div><div>${escapeHtml(it.text.length>320?it.text.slice(0,320)+"...":it.text)}</div>`;
      d.addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "scrollToPrompt", promptId: it.promptId, text: it.text }, (resp) => {
          if (chrome.runtime.lastError) {
            window.postMessage({ type: "pj_scroll", promptId: it.promptId, text: it.text }, "*");
          }
        });
      });
      listEl.appendChild(d);
    });
  });
}

/* ---------- fallback message handler ---------- */
window.addEventListener("message", (ev) => {
  if (ev.data && ev.data.type === "pj_scroll_resp") {
    if (!ev.data.ok) {
      const list = document.getElementById("pj-list");
      if (list) {
        const t = document.createElement("div");
        t.className = "pj-empty";
        t.textContent = "Could not find prompt in DOM. Try refreshing page and clicking Refresh.";
        list.prepend(t);
        setTimeout(()=> t.remove(), 3000);
      }
    }
  }
});

/* ---------- init UI ---------- */
function ensureUI() {
  createSmallIcon(); // only small icon initially
  // panel created lazily when icon is clicked
}
ensureUI();

// keep track of navigation changes
let lastKey = getChatKey();
setInterval(()=> {
  const k = getChatKey();
  if (k !== lastKey) { lastKey = k; /* don't auto-open panel */ }
}, 1000);

function debounce(fn, t=150){ let id; return function(){ clearTimeout(id); id=setTimeout(()=>fn(), t); }; }

/* -------------------------
   PAGE -> STORAGE SYNC (bridge)
--------------------------*/

console.log("PromptJump: starting bridge-based page->storage sync");

// inject page_monitor.js into page context (if web_accessible resource present)
(function injectPageMonitor(){
  try {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL('page_monitor.js');
    s.onload = () => s.remove();
    (document.head || document.documentElement).appendChild(s);
    console.log("PromptJump: injected page_monitor + page_bridge");
  } catch(e){
    console.warn("PromptJump: failed to inject page_monitor", e);
  }
})();

// ask page for messages and sync to storage
async function requestPageMessagesOnce(){
  return new Promise((resolve)=>{
    const respHandler = (ev) => {
      if(!ev || !ev.data) return;
      if(ev.data.type === 'pj_page_messages_resp') {
        window.removeEventListener('message', respHandler);
        resolve(ev.data.data || {});
      }
    };
    window.addEventListener('message', respHandler);

    // send request - page_monitor.js should reply with pj_page_messages_resp
    window.postMessage({ type: 'pj_request_messages' }, '*');

    // fallback timeout
    setTimeout(()=> { window.removeEventListener('message', respHandler); resolve({}); }, 800);
  });
}

async function syncPageMessagesToStorage(){
  try {
    const pageMsgs = await requestPageMessagesOnce();
    const keys = Object.keys(pageMsgs || {});
    if (!keys.length) return;

    chrome.storage.local.get({ prompts: [] }, (res) => {
      const arr = res.prompts || [];
      const present = new Set(arr.map(x => x.promptId));
      const chatKey = getChatKey();
      let changed = false;
      for (const id of keys) {
        if (!id || present.has(id)) continue;
        const text = pageMsgs[id];
        if (!text || !text.trim()) continue;
        const item = { promptId: id, text: text, chatKey: chatKey, date: new Date().toISOString() };
        arr.unshift(item);
        present.add(id);
        changed = true;
        console.log('PromptJump: synced new page message', id, text.slice(0,80));
      }
      if (changed) {
        if (arr.length > 2000) arr.length = 2000;
        chrome.storage.local.set({ prompts: arr }, ()=> {
          window.dispatchEvent(new Event('pj_refresh_list'));
        });
      }
    });
  } catch (e) {
    console.warn('PromptJump sync error', e);
  }
}

// run periodically and when page monitor fires custom event
setInterval(syncPageMessagesToStorage, 1400);
// ---- add this in content_script.js (put it above the existing pj_scroll_resp handler) ----
window.addEventListener("message", (ev) => {
  try {
    if (!ev || !ev.data) return;
    // fallback from panel: page -> content-script (when chrome.runtime.sendMessage fails)
    if (ev.data.type === "pj_scroll") {
      const { promptId, text } = ev.data;
      const ok = scrollToPromptById(promptId, text);
      // reply back to panel via window.postMessage
      window.postMessage({ type: "pj_scroll_resp", ok }, "*");
    }
  } catch (e) {
    console.warn("PromptJump: pj_scroll handler error", e);
    window.postMessage({ type: "pj_scroll_resp", ok: false, error: String(e) }, "*");
  }
});

setTimeout(syncPageMessagesToStorage, 800);
