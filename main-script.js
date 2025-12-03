function attachTracker() {
  const configScript = document.createElement("script");
  configScript.src = chrome.runtime.getURL("chat-manager.js");
  configScript.onload = function () {
    this.remove();

    // Load XHR Tracker
    const xhrScript = document.createElement("script");
    xhrScript.src = chrome.runtime.getURL("xhr-tracker.js");
    xhrScript.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(xhrScript);

    // Load API Tracker
    const fetchScript = document.createElement("script");
    fetchScript.src = chrome.runtime.getURL("api-tracker.js");
    fetchScript.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(fetchScript);
  };
  (document.head || document.documentElement).appendChild(configScript);
}

function createNavButton() {
  const button = document.createElement("button");
  button.classList.add("promptjump-toggle-btn");
  button.innerHTML = "💬";
  button.style.position = "fixed";
  button.style.bottom = "30px";
  button.style.right = "30px";
  button.style.padding = "10px 12px";
  button.style.backgroundColor = "rgba(11, 18, 32, 0.9)";
  button.style.color = "#e6eef3";
  button.style.border = "1px solid rgba(255,255,255,0.15)";
  button.style.borderRadius = "12px";
  button.style.cursor = "pointer";
  button.style.zIndex = "9999";
  button.style.display = "block";
  button.style.fontSize = "18px";
  button.style.fontWeight = "500";
  button.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.2)";
  button.style.backdropFilter = "blur(16px)";
  button.style.webkitBackdropFilter = "blur(16px)";
  button.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  button.onmouseover = () => {
    button.style.backgroundColor = "rgba(138, 180, 255, 0.15)";
    button.style.borderColor = "rgba(138, 180, 255, 0.3)";
    button.style.transform = "translateY(-2px) scale(1.05)";
    button.style.boxShadow = "0 12px 32px rgba(0,0,0,0.5), 0 6px 12px rgba(138, 180, 255, 0.2)";
  };
  button.onmouseout = () => {
    button.style.backgroundColor = "rgba(11, 18, 32, 0.9)";
    button.style.borderColor = "rgba(255,255,255,0.15)";
    button.style.transform = "translateY(0px) scale(1)";
    button.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.2)";
    button.style.transform = "translateY(0px)";
  };
  button.onclick = togglePromptPanel;
  
  // Check if document.body exists before appending
  if (document.body) {
    document.body.appendChild(button);
  } else {
    console.warn('PromptJump: document.body not ready for nav button');
  }
  
  // Add hover tooltip
  button.title = "Prompts";
  
  // Make button draggable
  makeDraggable(button);
  
  return button;
}

function togglePromptPanel() {
  const promptPanel = document.querySelector(".promptjump-panel");
  const toggleButton = document.querySelector(".promptjump-toggle-btn");
  
  if (promptPanel) {
    const isVisible = promptPanel.style.display !== "none";
    promptPanel.style.display = isVisible ? "none" : "block";
    toggleButton.style.display = isVisible ? "block" : "none";
  }
}

function createPromptPanel() {
  const div = document.createElement("div");
  // add a class to the div
  div.classList.add("promptjump-panel");
  
  // Create header container
  const headerContainer = document.createElement("div");
  headerContainer.style.display = "flex";
  headerContainer.style.justifyContent = "space-between";
  headerContainer.style.alignItems = "center";
  headerContainer.style.paddingBottom = "8px";
  headerContainer.style.marginBottom = "12px";
  headerContainer.style.borderBottom = "1px solid #374151";
  headerContainer.style.cursor = "move";
  
  // Add proper hand cursor for dragging
  headerContainer.onmousedown = () => {
    headerContainer.style.cursor = "grabbing";
  };
  
  headerContainer.onmouseup = () => {
    headerContainer.style.cursor = "move";
  };
  
  // Create title
  const titleElement = document.createElement("h3");
  titleElement.innerHTML = "Prompts";
  titleElement.style.margin = "0";
  titleElement.style.fontSize = "16px";
  titleElement.style.fontWeight = "600";
  titleElement.style.color = "#f7fafc";
  
  // Create buttons container
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.display = "flex";
  buttonsContainer.style.gap = "8px";
  buttonsContainer.style.alignItems = "center";
  
  // Create refresh button
  const refreshButton = document.createElement("button");
  refreshButton.innerHTML = "Refresh";
  refreshButton.style.background = "transparent";
  refreshButton.style.border = "1px solid #ffffff";
  refreshButton.style.color = "#ffffff";
  refreshButton.style.cursor = "pointer";
  refreshButton.style.fontSize = "11px";
  refreshButton.style.padding = "5px 10px";
  refreshButton.style.borderRadius = "4px";
  refreshButton.style.transition = "all 0.2s ease";
  refreshButton.style.fontWeight = "400";
  
  refreshButton.onmouseover = () => {
    refreshButton.style.backgroundColor = "#ffffff";
    refreshButton.style.color = "#000000";
  };
  
  refreshButton.onmouseout = () => {
    refreshButton.style.backgroundColor = "transparent";
    refreshButton.style.color = "#ffffff";
  };
  refreshButton.onclick = () => {
    if (window.__PROMPTJUMP_CORE_CONFIG && window.__PROMPTJUMP_CORE_CONFIG.updatePromptPanel) {
      window.__PROMPTJUMP_CORE_CONFIG.updatePromptPanel(0);
    }
  };
  
  // Create close button
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "×";
  closeButton.style.background = "transparent";
  closeButton.style.border = "1px solid #ffffff";
  closeButton.style.color = "#ffffff";
  closeButton.style.cursor = "pointer";
  closeButton.style.fontSize = "16px";
  closeButton.style.padding = "4px 8px";
  closeButton.style.borderRadius = "4px";
  closeButton.style.transition = "all 0.2s ease";
  closeButton.style.fontWeight = "400";
  
  closeButton.onmouseover = () => {
    closeButton.style.backgroundColor = "#ffffff";
    closeButton.style.color = "#000000";
  };
  
  closeButton.onmouseout = () => {
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.color = "#ffffff";
  };
  closeButton.onclick = togglePromptPanel;
  
  buttonsContainer.appendChild(refreshButton);
  buttonsContainer.appendChild(closeButton);
  headerContainer.appendChild(titleElement);
  headerContainer.appendChild(buttonsContainer);
  
  // Create search bar
  const searchContainer = document.createElement("div");
  searchContainer.style.marginBottom = "12px";
  
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search prompts...";
  searchInput.style.width = "100%";
  searchInput.style.padding = "8px 12px";
  searchInput.style.border = "1px solid #374151";
  searchInput.style.borderRadius = "6px";
  searchInput.style.backgroundColor = "#111827";
  searchInput.style.color = "#ffffff";
  searchInput.style.fontSize = "13px";
  searchInput.style.outline = "none";
  searchInput.style.boxSizing = "border-box";
  searchInput.style.transition = "all 0.2s ease";
  searchInput.style.fontFamily = "inherit";
  
  searchInput.onfocus = () => {
    searchInput.style.borderColor = "#60a5fa";
    searchInput.style.backgroundColor = "#111827";
    searchInput.style.boxShadow = "0 0 0 2px rgba(96, 165, 250, 0.2)";
  };
  
  searchInput.onblur = () => {
    searchInput.style.borderColor = "#374151";
    searchInput.style.backgroundColor = "#111827";
    searchInput.style.boxShadow = "none";
  };
  
  searchContainer.appendChild(searchInput);
  
  // Create content wrapper
  const contentWrapper = document.createElement("div");
  contentWrapper.classList.add("content-wrapper");
  contentWrapper.style.height = "280px";
  contentWrapper.style.overflowY = "auto";
  contentWrapper.style.overflowX = "hidden";
  contentWrapper.style.background = "rgba(17, 24, 39, 0.6)";
  contentWrapper.style.border = "1px solid #374151";
  contentWrapper.style.borderRadius = "6px";
  contentWrapper.style.padding = "8px";
  contentWrapper.style.margin = "8px 0";
  contentWrapper.innerHTML = '<div style="margin: 0 0 8px 0; color: #9ca3af; font-size: 13px; text-align: center; padding: 15px 0;">Jump to saved prompts for this chat</div>';
  
  // Panel styling to match image
  div.style.position = "fixed";
  div.style.top = "20px";
  div.style.right = "20px";
  div.style.transform = "none";
  div.style.backgroundColor = "#1f2937";
  div.style.backdropFilter = "blur(20px)";
  div.style.webkitBackdropFilter = "blur(20px)";
  div.style.padding = "16px";
  div.style.zIndex = "10000";
  div.style.border = "1px solid #374151";
  div.style.borderRadius = "8px";
  div.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
  div.style.maxWidth = "360px";
  div.style.minWidth = "360px";
  div.style.maxHeight = "420px";
  div.style.fontSize = "14px";
  div.style.fontFamily = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  div.style.display = "none";
  div.style.color = "#ffffff";
  div.style.animation = "promptjump-fadein 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

  // Create footer container
  const footerContainer = document.createElement("div");
  footerContainer.style.marginTop = "16px";
  footerContainer.style.display = "flex";
  footerContainer.style.justifyContent = "space-between";
  footerContainer.style.alignItems = "center";
  footerContainer.style.borderTop = "1px solid rgba(255,255,255,0.05)";
  footerContainer.style.paddingTop = "8px";
  
  // Made with text on left
  const madeWithText = document.createElement("span");
  madeWithText.innerHTML = "Made with ❤️";
  madeWithText.style.fontSize = "11px";
  madeWithText.style.color = "#6b7280";
  madeWithText.style.fontWeight = "400";
  
  // Report issue link on right
  const reportLink = document.createElement("a");
  reportLink.href = "https://github.com/Mann275/ChatGPT__PromptJump/issues/new";
  reportLink.target = "_blank";
  reportLink.innerHTML = "Report an issue";
  reportLink.style.fontSize = "11px";
  reportLink.style.color = "#10a37f";
  reportLink.style.textDecoration = "none";
  reportLink.style.fontWeight = "400";
  reportLink.onmouseover = () => reportLink.style.textDecoration = "underline";
  reportLink.onmouseout = () => reportLink.style.textDecoration = "none";
  
  footerContainer.appendChild(madeWithText);
  footerContainer.appendChild(reportLink);
  
  div.appendChild(headerContainer);
  div.appendChild(searchContainer);
  div.appendChild(contentWrapper);
  div.appendChild(footerContainer);
  
  // Check if document.body exists before appending
  if (document.body) {
    document.body.appendChild(div);
  } else {
    console.warn('PromptJump: document.body not ready for prompt panel');
  }
  
  // Make div draggable by header
  makeDraggable(div, headerContainer);
  
  // Add search functionality
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const messageButtons = contentWrapper.querySelectorAll('button');
    
    messageButtons.forEach(btn => {
      const messageText = btn.textContent.toLowerCase();
      const messageDiv = btn.parentElement;
      if (messageText.includes(searchTerm)) {
        messageDiv.style.display = 'block';
      } else {
        messageDiv.style.display = 'none';
      }
    });
  });
}

// Function to make an element draggable
function makeDraggable(element, dragHandle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  if (dragHandle) {
    // If present, the dragHandle is where you move the element from
    dragHandle.onmousedown = dragMouseDown;
  } else {
    // Otherwise, move the element from anywhere inside it
    element.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e.preventDefault();
    // Get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // Call function whenever the cursor moves
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Set the element's new position
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
    element.style.right = "auto"; // Remove the right position so it doesn't conflict
  }

  function closeDragElement() {
    // Stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Add CSS animations for smooth transitions
function injectStyles() {
  if (document.head && !document.getElementById('promptjump-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'promptjump-styles';
    styleSheet.textContent = `
      @keyframes promptjump-fadein {
        from {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
      
      @keyframes promptjump-slideup {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .promptjump-panel {
        animation: promptjump-fadein 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .promptjump-panel .content-wrapper > div {
        animation: promptjump-slideup 0.2s ease-out;
      }
    `;
    (document.head || document.documentElement).appendChild(styleSheet);
  }
}

// Try to inject styles immediately, or wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectStyles);
} else {
  injectStyles();
}

// Initialize the tracker with error handling
try {
  attachTracker();
} catch (error) {
  console.error('PromptJump: Error attaching tracker:', error);
}

// Handle popup events
window.addEventListener('promptjump_open_from_popup', () => {
  const promptPanel = document.querySelector('.promptjump-panel');
  const toggleButton = document.querySelector('.promptjump-toggle-btn');
  
  if (promptPanel) {
    promptPanel.style.display = 'block';
    if (toggleButton) toggleButton.style.display = 'none';
  } else {
    // Create panel if it doesn't exist
    createPromptPanel();
    createNavButton();
    setTimeout(() => {
      const newPanel = document.querySelector('.promptjump-panel');
      if (newPanel) newPanel.style.display = 'block';
    }, 100);
  }
});

window.addEventListener('promptjump_refresh', () => {
  if (window.__PROMPTJUMP_CORE_CONFIG && window.__PROMPTJUMP_CORE_CONFIG.updatePromptPanel) {
    window.__PROMPTJUMP_CORE_CONFIG.updatePromptPanel(0);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    try {
      createPromptPanel();
      createNavButton();
    } catch (error) {
      console.error('PromptJump: Error creating UI elements:', error);
    }
  }, 2000);
});
