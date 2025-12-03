// PromptJump unique configuration to avoid conflicts
window.__PROMPTJUMP_RESPONSE_DATA = {};
window.__PROMPTJUMP_REQUEST_QUEUE = [];
window.__PROMPTJUMP_USER_MSGS = {};
window.__PROMPTJUMP_CORE_CONFIG = {
  apiPattern: /^https:\/\/chatgpt\.com\/backend-api(?:\/[^\/]*)?\/(conversation|chat)(?:\/[0-9a-f-]+)?$/,
  shouldLogRequest: function(url) {
    console.log(url, this.apiPattern.test(url))

    return this.apiPattern.test(url);
  },
  extractUserMessages: function() {
    const mapping = window.__PROMPTJUMP_RESPONSE_DATA.mapping;
    if(!mapping) return {};
    for (const [id, node] of Object.entries(mapping)) {
      if (node.message && node.message.author && node.message.author.role === 'user') {
        if(node?.message?.content?.parts?.[0]) {
          window.__PROMPTJUMP_USER_MSGS[id] = node.message.content.parts[0];
        }
      }
    }
    return window.__PROMPTJUMP_USER_MSGS;
  },
  processUserRequests: function() {
    const requests = window.__PROMPTJUMP_REQUEST_QUEUE
    for(const request of requests) {
      const messageId = request.messages[0].id;
      const message = request.messages[0].content.parts[0];
      window.__PROMPTJUMP_USER_MSGS[messageId] = message;
    }
    return window.__PROMPTJUMP_USER_MSGS;
  },
  jumpToMessage: function(messageId) {
    const targetElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add highlight effect
      targetElement.style.transition = 'background-color 0.3s ease';
      targetElement.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
      setTimeout(() => {
        targetElement.style.backgroundColor = '';
      }, 1500);
    }
  },
  updatePromptPanel: function(retryCount = 0) {
    const promptPanel = document.querySelector('.promptjump-panel');
    let userMessages = this.extractUserMessages();
    userMessages = this.processUserRequests();
    if (promptPanel && Object.keys(userMessages).length > 0) {
      // Find or create content wrapper
      let contentWrapper = promptPanel.querySelector('.content-wrapper');
      if (!contentWrapper) {
        contentWrapper = promptPanel.children[1]; // Second child after close button
      }
      
      // Clear previous content
      contentWrapper.innerHTML = '';
      
      // Add full mapping section
      const fullMappingSection = document.createElement('div');

      // Add a style to the fullMappingSection
      fullMappingSection.style.overflow = 'visible';
      fullMappingSection.style.maxHeight = 'none';

      // Check if we have user messages
      if (Object.keys(userMessages).length === 0) {
        fullMappingSection.innerHTML += '<div style="margin: 10px 0;">No messages yet. Start a conversation with ChatGPT to see messages here.</div>';
      } else {
        Object.entries(userMessages).forEach(([id, message]) => {
          const messageDiv = document.createElement('div');
          messageDiv.style.marginBottom = '1px';
          messageDiv.style.padding = '1px';
          
          const msgButton = document.createElement('button');
          msgButton.innerHTML = `💬 ${message}`;
          msgButton.style.cursor = 'pointer';
          msgButton.style.border = '1px solid rgba(51, 65, 85, 0.5)';
          msgButton.style.padding = '8px 12px';
          msgButton.style.textAlign = 'left';
          msgButton.style.width = '100%';
          msgButton.style.borderRadius = '6px';
          msgButton.style.fontSize = '13px';
          msgButton.style.display = '-webkit-box';
          msgButton.style.webkitLineClamp = '2';
          msgButton.style.webkitBoxOrient = 'vertical';
          msgButton.style.overflow = 'hidden';
          msgButton.style.textOverflow = 'ellipsis';
          msgButton.style.background = 'rgba(30, 41, 59, 0.7)';
          msgButton.style.color = '#f1f5f9';
          msgButton.style.border = '1px solid rgba(51, 65, 85, 0.5)';
          msgButton.style.marginBottom = '1px';
          msgButton.style.transition = 'all 0.2s ease';
          msgButton.onmouseover = () => {
            msgButton.style.backgroundColor = 'rgba(51, 65, 85, 0.8)';
            msgButton.style.borderColor = 'rgba(96, 165, 250, 0.5)';
            msgButton.style.transform = 'translateY(-1px)';
          };
          msgButton.onmouseout = () => {
            msgButton.style.backgroundColor = 'rgba(30, 41, 59, 0.7)';
            msgButton.style.borderColor = 'rgba(138, 180, 255, 0.15)';
            msgButton.style.transform = 'translateY(0)';
          };
          
          msgButton.onclick = () => this.jumpToMessage(id);
          
          messageDiv.appendChild(msgButton);
          fullMappingSection.appendChild(messageDiv);
        });
      }

      contentWrapper.appendChild(fullMappingSection);
      
      // Scroll to the bottom to show the latest messages
      fullMappingSection.scrollTop = fullMappingSection.scrollHeight;
    } else if (retryCount < 5) {
      setTimeout(() => {
        this.updatePromptPanel(retryCount + 1);
      }, 2000);
    }
  },
  trackResponse: function(url, response, request) {
    console.log(url, response, request)
    if(typeof response === 'object') {
      window.__PROMPTJUMP_RESPONSE_DATA = response;
      window.__PROMPTJUMP_REQUEST_QUEUE = []
      window.__PROMPTJUMP_USER_MSGS = {}
    }

    // POST request for delete chat or new chat
    const isDeleteChat = request && request?.is_visible === false
    const isNewChat = request && !request.conversation_id
    if(isDeleteChat || isNewChat) {
      window.__PROMPTJUMP_RESPONSE_DATA = {}
      window.__PROMPTJUMP_REQUEST_QUEUE = []
      window.__PROMPTJUMP_USER_MSGS = {}
      if(isDeleteChat) return 
    }
    // POST request for new chat
    if(request) {
      window.__PROMPTJUMP_REQUEST_QUEUE.push(request);
    }
    // Start the retry process for updating the prompt panel
    this.updatePromptPanel(0);
  }
}; 