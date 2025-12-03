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
  button.style.bottom = "20px";
  button.style.right = "20px";
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
  document.body.appendChild(button);
  
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
  headerContainer.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
  headerContainer.style.cursor = "move";
  
  // Create title
  const titleElement = document.createElement("h3");
  titleElement.innerHTML = "Prompts";
  titleElement.style.margin = "0";
  titleElement.style.fontSize = "14px";
  titleElement.style.fontWeight = "600";
  titleElement.style.color = "#e6eef3";
  
  // Create buttons container
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.display = "flex";
  buttonsContainer.style.gap = "8px";
  buttonsContainer.style.alignItems = "center";
  
  // Create refresh button
  const refreshButton = document.createElement("button");
  refreshButton.innerHTML = "🔄";
  refreshButton.style.background = "rgba(138, 180, 255, 0.1)";
  refreshButton.style.border = "1px solid rgba(138, 180, 255, 0.2)";
  refreshButton.style.color = "#8ab4ff";
  refreshButton.style.cursor = "pointer";
  refreshButton.style.fontSize = "12px";
  refreshButton.style.padding = "6px 8px";
  refreshButton.style.borderRadius = "6px";
  refreshButton.style.transition = "all 0.2s ease";
  
  refreshButton.onmouseover = () => {
    refreshButton.style.backgroundColor = "rgba(138, 180, 255, 0.2)";
    refreshButton.style.transform = "scale(1.1)";
  };
  
  refreshButton.onmouseout = () => {
    refreshButton.style.backgroundColor = "rgba(138, 180, 255, 0.1)";
    refreshButton.style.transform = "scale(1)";
  };
  refreshButton.onclick = () => {
    if (window.__PROMPTJUMP_CORE_CONFIG && window.__PROMPTJUMP_CORE_CONFIG.updatePromptPanel) {
      window.__PROMPTJUMP_CORE_CONFIG.updatePromptPanel(0);
    }
  };
  
  // Create close button
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "×";
  closeButton.style.background = "rgba(239, 68, 68, 0.1)";
  closeButton.style.border = "1px solid rgba(239, 68, 68, 0.2)";
  closeButton.style.color = "#ef4444";
  closeButton.style.cursor = "pointer";
  closeButton.style.fontSize = "14px";
  closeButton.style.padding = "6px 8px";
  closeButton.style.borderRadius = "6px";
  closeButton.style.transition = "all 0.2s ease";
  closeButton.style.fontWeight = "600";
  
  closeButton.onmouseover = () => {
    closeButton.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
    closeButton.style.transform = "scale(1.1)";
  };
  
  closeButton.onmouseout = () => {
    closeButton.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
    closeButton.style.transform = "scale(1)";
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
  searchInput.style.padding = "10px 14px";
  searchInput.style.border = "1px solid rgba(255,255,255,0.1)";
  searchInput.style.borderRadius = "8px";
  searchInput.style.backgroundColor = "rgba(255,255,255,0.08)";
  searchInput.style.color = "#e6eef3";
  searchInput.style.fontSize = "13px";
  searchInput.style.outline = "none";
  searchInput.style.boxSizing = "border-box";
  searchInput.style.transition = "all 0.2s ease";
  searchInput.style.fontFamily = "inherit";
  
  searchInput.onfocus = () => {
    searchInput.style.borderColor = "rgba(138, 180, 255, 0.4)";
    searchInput.style.backgroundColor = "rgba(255,255,255,0.12)";
    searchInput.style.boxShadow = "0 0 0 3px rgba(138, 180, 255, 0.1)";
  };
  
  searchInput.onblur = () => {
    searchInput.style.borderColor = "rgba(255,255,255,0.1)";
    searchInput.style.backgroundColor = "rgba(255,255,255,0.08)";
    searchInput.style.boxShadow = "none";
  };
  
  searchContainer.appendChild(searchInput);
  
  // Create content wrapper
  const contentWrapper = document.createElement("div");
  contentWrapper.classList.add("content-wrapper");
  contentWrapper.innerHTML = '<div style="margin: 0 0 12px 0; color: #9aa6ad; font-size: 11px;">Initializing chat tracker...</div>';
  
  // add a style to the div
  div.style.position = "fixed";
  div.style.top = "50%";
  div.style.left = "50%";
  div.style.transform = "translate(-50%, -50%)";
  div.style.backgroundColor = "rgba(11, 18, 32, 0.98)";
  div.style.backdropFilter = "blur(24px)";
  div.style.webkitBackdropFilter = "blur(24px)";
  div.style.padding = "20px";
  div.style.paddingBottom = "50px";
  div.style.zIndex = "10000";
  div.style.border = "1px solid rgba(138, 180, 255, 0.2)";
  div.style.borderRadius = "16px";
  div.style.boxShadow = "0 20px 60px rgba(0,0,0,0.6), 0 8px 24px rgba(11, 18, 32, 0.8), inset 0 1px 0 rgba(255,255,255,0.1)";
  div.style.maxWidth = "420px";
  div.style.minWidth = "420px";
  div.style.maxHeight = "500px";
  div.style.fontSize = "13px";
  div.style.fontFamily = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, Arial";
  div.style.display = "none";
  div.style.color = "#e6eef3";
  div.style.animation = "promptjump-fadein 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

  // Create footer container
  const footerContainer = document.createElement("div");
  footerContainer.style.position = "absolute";
  footerContainer.style.bottom = "8px";
  footerContainer.style.left = "16px";
  footerContainer.style.right = "16px";
  footerContainer.style.display = "flex";
  footerContainer.style.justifyContent = "space-between";
  footerContainer.style.alignItems = "center";
  footerContainer.style.borderTop = "1px solid rgba(255,255,255,0.05)";
  footerContainer.style.paddingTop = "8px";
  
  // Made with text on left
  const madeWithText = document.createElement("span");
  madeWithText.innerHTML = "Made with ❤️";
  madeWithText.style.fontSize = "10px";
  madeWithText.style.color = "#9aa6ad";
  
  // Report issue link on right
  const reportLink = document.createElement("a");
  reportLink.href = "https://github.com/promptjump/issues/new";
  reportLink.target = "_blank";
  reportLink.innerHTML = "Report issue";
  reportLink.style.fontSize = "10px";
  reportLink.style.color = "#8ab4ff";
  reportLink.style.textDecoration = "none";
  
  footerContainer.appendChild(madeWithText);
  footerContainer.appendChild(reportLink);
  
  div.appendChild(headerContainer);
  div.appendChild(searchContainer);
  div.appendChild(contentWrapper);
  div.appendChild(footerContainer);
  document.body.appendChild(div);
  
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
if (!document.getElementById('promptjump-styles')) {
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
  document.head.appendChild(styleSheet);
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
