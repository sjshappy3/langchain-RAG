import React, { useState } from 'react';
import './StockAnalysis.css';

const StockAnalysis = ({ module, onSendMessage }) => {
  const [selectedStock, setSelectedStock] = useState('');
  const [stockCode, setStockCode] = useState('');

  const popularStocks = [
    { code: '000001', name: '平安银行', sector: '银行' },
    { code: '000002', name: '万科A', sector: '房地产' },
    { code: '000858', name: '五粮液', sector: '白酒' },
    { code: '002594', name: '比亚迪', sector: '新能源汽车' },
    { code: '600519', name: '贵州茅台', sector: '白酒' },
    { code: '600036', name: '招商银行', sector: '银行' },
    { code: '000858', name: '五粮液', sector: '白酒' },
    { code: '002415', name: '海康威视', sector: '安防' }
  ];

  const handleStockSelect = (stock) => {
    setSelectedStock(stock.name);
    setStockCode(stock.code);
    
    const moduleQueries = {
      'stock-query': `查询${stock.name}(${stock.code})的最新股价、市值、涨跌幅等基本信息`,
      'technical-analysis': `分析${stock.name}(${stock.code})的技术指标，包括K线走势、MACD、RSI等技术分析`,
      'financial-analysis': `分析${stock.name}(${stock.code})的财务状况，包括营收、利润、负债率、ROE等财务指标`,
      'market-news': `搜索${stock.name}(${stock.code})相关的最新新闻、公告和市场资讯`,
      'portfolio-analysis': `分析${stock.name}(${stock.code})的投资价值和风险评估`
    };
    
    if (moduleQueries[module]) {
      onSendMessage(moduleQueries[module]);
    }
  };

  const handleCustomQuery = () => {
    if (stockCode.trim()) {
      const moduleQueries = {
        'stock-query': `查询股票代码${stockCode}的最新股价和基本信息`,
        'technical-analysis': `分析股票代码${stockCode}的技术指标和K线走势`,
        'financial-analysis': `分析股票代码${stockCode}的财务状况和估值水平`,
        'market-news': `搜索股票代码${stockCode}相关的最新资讯`,
        'portfolio-analysis': `分析股票代码${stockCode}的投资价值`
      };
      
      if (moduleQueries[module]) {
        onSendMessage(moduleQueries[module]);
      }
    }
  };

  const getModuleInfo = () => {
    const moduleInfo = {
      'stock-query': {
        title: '🔍 股票查询',
        description: '查询股票的实时价格、基本信息和市场数据',
        features: ['实时股价', '市值信息', '涨跌幅', '成交量', '市盈率']
      },
      'technical-analysis': {
        title: '📈 技术分析',
        description: '基于技术指标和图表分析股票走势',
        features: ['K线图分析', 'MACD指标', 'RSI指标', '均线系统', '支撑阻力位']
      },
      'financial-analysis': {
        title: '💰 财务分析',
        description: '深入分析公司财务状况和估值水平',
        features: ['营收分析', '利润指标', '负债情况', 'ROE/ROA', '估值模型']
      },
      'market-news': {
        title: '📰 市场资讯',
        description: '获取最新的市场新闻和公司公告',
        features: ['实时新闻', '公司公告', '行业资讯', '研报摘要', '市场热点']
      },
      'portfolio-analysis': {
        title: '📋 投资组合',
        description: '分析投资组合的风险和收益特征',
        features: ['风险评估', '收益分析', '相关性分析', '资产配置', '投资建议']
      }
    };
    
    return moduleInfo[module] || moduleInfo['stock-query'];
  };

  const moduleInfo = getModuleInfo();

  return (
    <div className="stock-analysis">
      <div className="module-header">
        <h2>{moduleInfo.title}</h2>
        <p>{moduleInfo.description}</p>
      </div>
      
      <div className="module-features">
        <h3>📋 功能特性</h3>
        <div className="features-list">
          {moduleInfo.features.map((feature, index) => (
            <span key={index} className="feature-tag">{feature}</span>
          ))}
        </div>
      </div>
      
      <div className="stock-input-section">
        <h3>🔍 股票查询</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="输入股票代码（如：600519）"
            value={stockCode}
            onChange={(e) => setStockCode(e.target.value)}
            className="stock-input"
          />
          <button onClick={handleCustomQuery} className="query-btn">
            查询
          </button>
        </div>
      </div>
      
      <div className="popular-stocks">
        <h3>🔥 热门股票</h3>
        <div className="stocks-grid">
          {popularStocks.map((stock, index) => (
            <div
              key={index}
              className="stock-card"
              onClick={() => handleStockSelect(stock)}
            >
              <div className="stock-code">{stock.code}</div>
              <div className="stock-name">{stock.name}</div>
              <div className="stock-sector">{stock.sector}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="quick-actions">
        <h3>⚡ 快速操作</h3>
        <div className="action-buttons">
          <button 
            className="action-btn"
            onClick={() => onSendMessage('查询今日A股市场整体表现和热点板块')}
          >
            📊 市场概览
          </button>
          <button 
            className="action-btn"
            onClick={() => onSendMessage('分析当前市场热点和投资机会')}
          >
            🔥 热点分析
          </button>
          <button 
            className="action-btn"
            onClick={() => onSendMessage('推荐一些优质的投资标的')}
          >
            💎 投资推荐
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis;