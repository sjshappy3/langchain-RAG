import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ message }) => {
  const { text, sender, timestamp, isStreaming, isError } = message;
  
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatMessageText = (text) => {
    // 简单的文本格式化，支持换行
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className={`message ${sender} ${isError ? 'error' : ''}`}>
      <div className="message-wrapper">
        <div className="message-avatar">
          {sender === 'user' ? (
            <div className="avatar user-avatar">
              <span>👤</span>
            </div>
          ) : (
            <div className="avatar assistant-avatar">
              <span>🤖</span>
            </div>
          )}
        </div>
        
        <div className="message-content">
          <div className="message-header">
            <span className="message-sender">
              {sender === 'user' ? '您' : 'AI助手'}
            </span>
            <span className="message-time">
              {formatTime(timestamp)}
            </span>
          </div>
          
          <div className="message-text">
            {text ? formatMessageText(text) : ''}
            {isStreaming && (
              <span className="streaming-cursor">|</span>
            )}
          </div>
          
          {isError && (
            <div className="error-indicator">
              <span className="error-icon">⚠️</span>
              <span className="error-text">消息发送失败</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;