// popup.js
document.getElementById('open-panel').addEventListener('click', async () => {
  // focus the active tab (if it's chat.openai.com / chatgpt.com) and send a message to show panel
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  try {
    // if content script present, ask it to show panel by toggling small icon click
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        try {
          const btn = document.getElementById('pj-small-icon');
          if (btn) btn.click();
          else {
            // if no button, create one then click
            const e = new Event('pj_open_from_popup');
            window.dispatchEvent(e);
          }
        } catch(e){}
      }
    });
  } catch (e) {
    // fallback: open chat tab
    chrome.tabs.update(tab.id, { active: true });
  }
});

document.getElementById('refresh-storage').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      try { window.dispatchEvent(new Event('pj_refresh_list')) } catch(e){}
    }
  });
});
