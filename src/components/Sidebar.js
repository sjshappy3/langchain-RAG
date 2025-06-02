import React from 'react';
import './Sidebar.css';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  searchHistory, 
  onHistorySelect, 
  knowledgeBase, 
  onClearHistory,
  onModuleSelect 
}) => {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>📈 股票分析系统</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="sidebar-content">
          {/* 股票分析模块 */}
          <div className="stock-modules-section">
            <h4>📊 分析模块</h4>
            <div className="module-list">
              <div className="module-item" onClick={() => onModuleSelect && onModuleSelect('stock-query')}>
                <span className="module-icon">🔍</span>
                <div className="module-info">
                  <strong>股票查询</strong>
                  <p>实时股价、基本信息</p>
                </div>
              </div>
              <div className="module-item" onClick={() => onModuleSelect && onModuleSelect('technical-analysis')}>
                <span className="module-icon">📈</span>
                <div className="module-info">
                  <strong>技术分析</strong>
                  <p>K线图、技术指标</p>
                </div>
              </div>
              <div className="module-item" onClick={() => onModuleSelect && onModuleSelect('financial-analysis')}>
                <span className="module-icon">💰</span>
                <div className="module-info">
                  <strong>财务分析</strong>
                  <p>财报数据、估值分析</p>
                </div>
              </div>
              <div className="module-item" onClick={() => onModuleSelect && onModuleSelect('market-news')}>
                <span className="module-icon">📰</span>
                <div className="module-info">
                  <strong>市场资讯</strong>
                  <p>新闻、公告、研报</p>
                </div>
              </div>
              <div className="module-item" onClick={() => onModuleSelect && onModuleSelect('portfolio-analysis')}>
                <span className="module-icon">📋</span>
                <div className="module-info">
                  <strong>投资组合</strong>
                  <p>持仓分析、风险评估</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 知识库状态 */}
          <div className="knowledge-base-section">
            <h4>📚 数据源状态</h4>
            <div className="kb-status">
              <div className={`status-indicator ${knowledgeBase.status}`}>
                <span className="status-dot"></span>
                <span className="status-text">
                  {knowledgeBase.status === 'ready' ? '数据正常' : 
                   knowledgeBase.status === 'loading' ? '更新中' : '连接异常'}
                </span>
              </div>
              <div className="kb-info">
                <p>股票数据: 实时更新</p>
                <p>财务数据: 每日更新</p>
                <p>新闻资讯: 实时推送</p>
              </div>
            </div>
          </div>
          
          {/* 搜索历史 */}
          <div className="search-history-section">
            <div className="section-header">
              <h4>🕒 搜索历史</h4>
              {searchHistory.length > 0 && (
                <button className="clear-btn" onClick={onClearHistory}>
                  清空
                </button>
              )}
            </div>
            
            {searchHistory.length === 0 ? (
              <p className="empty-state">暂无搜索历史</p>
            ) : (
              <div className="history-list">
                {searchHistory.map((query, index) => (
                  <div 
                    key={index} 
                    className="history-item"
                    onClick={() => onHistorySelect(query)}
                  >
                    <span className="history-icon">🔍</span>
                    <span className="history-text">{query}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* AI助手功能 */}
          <div className="ai-features-section">
            <h4>🤖 AI助手</h4>
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">💡</span>
                <div>
                  <strong>智能问答</strong>
                  <p>股票相关问题解答</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <div>
                  <strong>趋势预测</strong>
                  <p>基于AI的走势分析</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚠️</span>
                <div>
                  <strong>风险提醒</strong>
                  <p>投资风险智能识别</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;