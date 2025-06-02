import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const MessageInput = ({ 
  onSendMessage, 
  onClearMessages, 
  onStopGeneration, 
  isLoading, 
  disabled, 
  searchHistory = [] 
}) => {
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    setShowSuggestions(e.target.value.length > 0 && searchHistory.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const filteredSuggestions = searchHistory.filter(item => 
    item.toLowerCase().includes(message.toLowerCase()) && item !== message
  ).slice(0, 5);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="message-input-container" ref={containerRef}>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="suggestions-dropdown">
          <div className="suggestions-header">
            <span className="suggestions-icon">🕒</span>
            <span>搜索历史</span>
          </div>
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="suggestion-icon">🔍</span>
              <span className="suggestion-text">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="message-form">
        <div className="input-wrapper">
          <div className="textarea-container">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(message.length > 0 && searchHistory.length > 0)}
              placeholder="输入您的问题，或从历史记录中选择..."
              disabled={disabled}
              className="message-textarea"
              rows={1}
            />
            {message && (
              <button
                type="button"
                onClick={() => {
                  setMessage('');
                  setShowSuggestions(false);
                  textareaRef.current?.focus();
                }}
                className="clear-input-button"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="button-group">
            {isLoading ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="stop-button"
              >
                <span className="button-icon">⏹️</span>
                <span className="button-text">停止</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!message.trim() || disabled}
                className="send-button"
              >
                <span className="button-icon">🚀</span>
                <span className="button-text">发送</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClearMessages}
              className="clear-button"
              disabled={disabled}
              title="清空对话"
            >
              <span className="button-icon">🗑️</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;