// PromptJump XHR Interceptor - Unique Implementation
(function() {
  'use strict';
  
  // Store original methods with unique namespace
  const PROMPTJUMP_XHR_ORIGINALS = {
    open: XMLHttpRequest.prototype.open,
    send: XMLHttpRequest.prototype.send
  };

  // Custom open method with unique property names
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    this.__pj_method = method;
    this.__pj_url = url;
    this.__pj_timestamp = Date.now();
    return PROMPTJUMP_XHR_ORIGINALS.open.apply(this, arguments);
  };

  // Custom send method with PromptJump specific logic
  XMLHttpRequest.prototype.send = function(requestPayload) {
    const xhrInstance = this;
    const requestUrl = this.__pj_url;
    const requestMethod = this.__pj_method || 'GET';
    const startTime = this.__pj_timestamp;
    
    // PromptJump specific data parsing
    let parsedRequestData = null;
    if (requestPayload) {
      if (typeof requestPayload === 'string') {
        try {
          parsedRequestData = JSON.parse(requestPayload);
        } catch (parseError) {
          parsedRequestData = requestPayload;
        }
      } else {
        parsedRequestData = requestPayload;
      }
    }
    
    // Use PromptJump configuration
    const promptJumpConfig = window.__PROMPTJUMP_CORE_CONFIG;
    const shouldTrack = promptJumpConfig && promptJumpConfig.shouldLogRequest(requestUrl, requestMethod);
    
    if (shouldTrack) {
      const originalStateHandler = xhrInstance.onreadystatechange;
      
      // PromptJump specific response handler
      xhrInstance.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE) {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          try {
            let processedResponse;
            const contentType = this.getResponseHeader('content-type');
            
            if (contentType && contentType.includes('application/json')) {
              try {
                processedResponse = JSON.parse(this.responseText);
              } catch (jsonError) {
                processedResponse = this.responseText;
              }
            } else {
              processedResponse = this.responseText;
            }
            
            // PromptJump specific tracking
            promptJumpConfig.trackResponse(requestUrl, processedResponse, parsedRequestData, {
              duration: duration,
              status: this.status,
              timestamp: endTime
            });
          } catch (trackingError) {
            console.error('PromptJump XHR tracking error:', trackingError);
          }
        }
        
        // Call original handler if exists
        if (originalStateHandler) {
          return originalStateHandler.apply(this, arguments);
        }
      };
    }
    
    return PROMPTJUMP_XHR_ORIGINALS.send.apply(this, arguments);
  };
})();