import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ChatMessage from './components/ChatMessage';
import MessageInput from './components/MessageInput';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StockAnalysis from './components/StockAnalysis';
import KnowledgeBaseManager from './components/KnowledgeBaseManager';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [currentModule, setCurrentModule] = useState('chat'); // 当前选中的模块
  const [showBackButton, setShowBackButton] = useState(false); // 是否显示返回按键
  const [knowledgeBase, setKnowledgeBase] = useState({
    status: 'ready',
    documentsCount: 0,
    lastUpdated: null
  });
  const [showKnowledgeBaseManager, setShowKnowledgeBaseManager] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message) => {
    if (!message.trim() || isLoading) return;

    // 添加到搜索历史
    setSearchHistory(prev => {
      const newHistory = [message, ...prev.filter(item => item !== message)];
      return newHistory.slice(0, 10); // 保留最近10条
    });

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setShowBackButton(true); // 有消息时显示返回按键

    // 添加助手消息占位符
    const assistantMessage = {
      id: Date.now() + 1,
      text: '',
      sender: 'assistant',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // 创建新的AbortController
      abortControllerRef.current = new AbortController();

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        
        // 更新助手消息
        const currentText = accumulatedText;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, text: currentText }
              : msg
          )
        );
      }

      // 完成流式传输
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('请求被取消');
        return;
      }
      
      console.error('发送消息失败:', error);
      
      // 更新助手消息为错误信息
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { 
                ...msg, 
                text: '抱歉，处理您的请求时出现了错误。请稍后重试。',
                isStreaming: false,
                isError: true
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const clearMessages = () => {
    setMessages([]);
    // 如果有正在进行的请求，取消它
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setShowBackButton(false); // 清除消息时隐藏返回按键
  };

  // 返回主页面
  const handleBackToHome = () => {
    setMessages([]);
    setCurrentModule('chat');
    setShowBackButton(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      
      // 停止当前流式传输
      setMessages(prev => 
        prev.map(msg => 
          msg.isStreaming 
            ? { ...msg, isStreaming: false, text: msg.text + '\n\n[生成已停止]' }
            : msg
        )
      );
    }
  };

  // 处理模块选择
  const handleModuleSelect = (moduleId) => {
    setCurrentModule(moduleId);
    setSidebarOpen(false); // 选择模块后关闭侧边栏
    
    // 根据模块类型发送相应的消息
    const moduleMessages = {
      'stock-query': '请帮我查询股票信息，我想了解某只股票的基本情况',
      'technical-analysis': '请为我进行技术分析，包括K线图和技术指标分析',
      'financial-analysis': '请帮我分析公司的财务状况和估值情况',
      'market-news': '请为我搜索最新的市场资讯和相关新闻',
      'portfolio-analysis': '请帮我分析投资组合的风险和收益情况'
    };
    
    if (moduleMessages[moduleId]) {
      sendMessage(moduleMessages[moduleId]);
    }
  };

  // 处理知识库管理
  const handleKnowledgeBaseManage = () => {
    setShowKnowledgeBaseManager(true);
  };

  // 更新知识库状态
  const handleUpdateKnowledgeBase = (newKnowledgeBase) => {
    setKnowledgeBase(newKnowledgeBase);
  };

  return (
    <div className="app">
      <Header 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        knowledgeBase={knowledgeBase}
        onKnowledgeBaseManage={handleKnowledgeBaseManage}
        showBackButton={showBackButton}
        onBackToHome={handleBackToHome}
      />
      
      <div className="main-container">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          searchHistory={searchHistory}
          onHistorySelect={sendMessage}
          knowledgeBase={knowledgeBase}
          onClearHistory={() => setSearchHistory([])}
          onModuleSelect={handleModuleSelect}
        />
        
        <div className={`chat-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="messages-container">
            {messages.length === 0 ? (
              currentModule !== 'chat' ? (
                <StockAnalysis 
                  module={currentModule} 
                  onSendMessage={sendMessage}
                />
              ) : (
                <div className="welcome-message">
                  <div className="welcome-content">
                    <div className="welcome-icon">📈</div>
                    <h2>股票智能分析系统</h2>
                    <p className="welcome-subtitle">基于AI的专业股票分析平台</p>
                  
                  <div className="features-grid">
                    <div className="feature-card" onClick={() => handleModuleSelect('stock-query')}>
                      <div className="feature-icon">🔍</div>
                      <h3>股票查询</h3>
                      <p>实时股价、基本信息查询</p>
                    </div>
                    <div className="feature-card" onClick={() => handleModuleSelect('technical-analysis')}>
                      <div className="feature-icon">📈</div>
                      <h3>技术分析</h3>
                      <p>K线图表、技术指标分析</p>
                    </div>
                    <div className="feature-card" onClick={() => handleModuleSelect('financial-analysis')}>
                      <div className="feature-icon">💰</div>
                      <h3>财务分析</h3>
                      <p>财报数据、估值分析</p>
                    </div>
                    <div className="feature-card" onClick={() => handleModuleSelect('market-news')}>
                      <div className="feature-icon">📰</div>
                      <h3>市场资讯</h3>
                      <p>实时新闻、市场动态</p>
                    </div>
                    <div className="feature-card" onClick={() => handleModuleSelect('portfolio-analysis')}>
                      <div className="feature-icon">📋</div>
                      <h3>投资组合</h3>
                      <p>持仓分析、风险评估</p>
                    </div>
                    <div className="feature-card" onClick={() => handleModuleSelect('chat')}>
                      <div className="feature-icon">💡</div>
                      <h3>智能问答</h3>
                      <p>AI助手自由对话</p>
                    </div>
                  </div>
                  
                  <div className="example-questions">
                    <h3>💬 试试这些问题：</h3>
                    <div className="question-tags">
                      <button 
                        className="question-tag" 
                        onClick={() => sendMessage('查询贵州茅台(600519)的最新股价和基本信息')}
                      >
                        查询贵州茅台最新股价
                      </button>
                      <button 
                        className="question-tag" 
                        onClick={() => sendMessage('分析比亚迪(002594)的技术指标和K线走势')}
                      >
                        技术分析比亚迪走势
                      </button>
                      <button 
                        className="question-tag" 
                        onClick={() => sendMessage('分析平安银行(000001)的财务状况和估值水平')}
                      >
                        财务分析平安银行
                      </button>
                      <button 
                        className="question-tag" 
                        onClick={() => sendMessage('搜索今日A股市场最新资讯和热点新闻')}
                      >
                        今日市场热点资讯
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              )
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <MessageInput 
            onSendMessage={sendMessage}
            onClearMessages={clearMessages}
            onStopGeneration={stopGeneration}
            isLoading={isLoading}
            disabled={isLoading}
            searchHistory={searchHistory}
          />
        </div>
      </div>
      
      <KnowledgeBaseManager
        isOpen={showKnowledgeBaseManager}
        onClose={() => setShowKnowledgeBaseManager(false)}
        knowledgeBase={knowledgeBase}
        onUpdateKnowledgeBase={handleUpdateKnowledgeBase}
      />
    </div>
  );
}

export default App;