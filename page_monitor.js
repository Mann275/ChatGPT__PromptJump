// page_monitor.js — injected into page context
(function(){
  if (window.__PJ_PAGE_MONITOR_LOADED) return;
  window.__PJ_PAGE_MONITOR_LOADED = true;

  window.__CHATGPT_USER_MESSAGES = window.__CHATGPT_USER_MESSAGES || {};
  window.__CHATGPT_MONITOR_REQUEST = window.__CHATGPT_MONITOR_REQUEST || [];

  // simple helper: try to extract user messages from a mapping object if present
  function tryExtractFromMapping(mapping){
    if(!mapping) return;
    for(const [id, node] of Object.entries(mapping)){
      try {
        if(node?.message?.author?.role === 'user' && node?.message?.content?.parts?.[0]){
          window.__CHATGPT_USER_MESSAGES[id] = node.message.content.parts[0];
        }
      } catch(e){}
    }
  }

  // If the page already sets a global mapping (older monitor code), attempt to patch
  // Periodic scan fallback — read window objects that the page might expose
  setInterval(()=> {
    try {
      // try well-known variable names (if present)
      if(window.__CHATGPT_MONITOR_RESPONSE?.mapping){
        tryExtractFromMapping(window.__CHATGPT_MONITOR_RESPONSE.mapping);
      }
    } catch(e){}
  }, 1500);

  // Listen for requests from content script (CSP-safe)
  window.addEventListener('message', (ev) => {
    try {
      if(!ev || !ev.data) return;
      if(ev.data.type === 'pj_request_messages'){
        // reply with current user messages
        window.postMessage({ type: 'pj_page_messages', data: window.__CHATGPT_USER_MESSAGES || {} }, '*');
      }
    } catch(e){}
  });

  // Also expose a function page code (if you later want to call directly)
  window.__PJ_BROADCAST = function(){
    try {
      window.postMessage({ type: 'pj_page_messages', data: window.__CHATGPT_USER_MESSAGES || {} }, '*');
    } catch(e){}
  };

  // Optional: hook fetch to catch POST body messages (light weight)
  (function(){
    const origFetch = window.fetch;
    if(!origFetch) return;
    window.fetch = async function(...args){
      const [resource, config] = args;
      const url = resource instanceof Request ? resource.url : resource;
      const method = resource instanceof Request ? resource.method : (config && config.method) || 'GET';
      let reqBody = null;
      try {
        if(config && config.body){
          if(typeof config.body === 'string') {
            try { reqBody = JSON.parse(config.body); } catch{ reqBody = config.body; }
          } else reqBody = config.body;
        }
      } catch(e){}
      const resp = await origFetch.apply(this, args);
      try {
        // only attempt to parse JSON responses for conversation endpoints
        if(typeof url === 'string' && /conversation/.test(url)) {
          resp.clone().text().then(text => {
            try {
              const j = JSON.parse(text);
              if(j && j.mapping) tryExtractFromMapping(j.mapping);
            } catch(e){}
          }).catch(()=>{});
        }
      } catch(e){}
      return resp;
    };
  })();

})();
