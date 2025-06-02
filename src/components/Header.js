import React from 'react';
import './Header.css';

const Header = ({ onToggleSidebar, knowledgeBase, onKnowledgeBaseManage, showBackButton, onBackToHome }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={onToggleSidebar}>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
          </button>
          
          {showBackButton && (
            <button className="back-button" onClick={onBackToHome}>
              <span className="back-icon">←</span>
              <span className="back-text">返回首页</span>
            </button>
          )}
          
          <div className="logo">
            <span className="logo-icon">🧠</span>
            <div className="logo-text">
              <h1>RAG智能问答</h1>
              <p>基于检索增强生成的智能助手</p>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <button className="kb-manage-btn" onClick={onKnowledgeBaseManage}>
            <span className="kb-manage-icon">📚</span>
            <span className="kb-manage-text">知识库管理</span>
          </button>
          
          <div className="kb-status">
            <span className={`kb-indicator ${knowledgeBase.status}`}></span>
            <span className="kb-text">
              知识库 {knowledgeBase.status === 'ready' ? '就绪' : 
                     knowledgeBase.status === 'loading' ? '加载中' : '离线'}
            </span>
          </div>
          
          <div className="status">
            <span className="status-indicator online"></span>
            <span className="status-text">在线</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;