// page_bridge.js — runs in page, replies to request from content script (CSP-safe)
(function(){
  if (window.__PJ_BRIDGE_LOADED) return;
  window.__PJ_BRIDGE_LOADED = true;

  // Listen for content-script requests
  window.addEventListener('message', (ev) => {
    try {
      if (!ev || !ev.data) return;
      if (ev.data && ev.data.type === 'pj_request_messages') {
        const data = window.__CHATGPT_USER_MESSAGES || {};
        // reply back in window.postMessage so content script can catch it
        window.postMessage({ type: 'pj_page_messages', data: data }, '*');
      }
    } catch(e){}
  }, false);

  // When page monitor updates, broadcast automatically too
  window.addEventListener('pj_monitor_updated', () => {
    try {
      const data = window.__CHATGPT_USER_MESSAGES || {};
      window.postMessage({ type: 'pj_page_messages', data: data }, '*');
    } catch(e){}
  }, false);
})();
