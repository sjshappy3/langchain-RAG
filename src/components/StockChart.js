import React, { useEffect, useState } from 'react';
import './StockChart.css';

const StockChart = ({ data }) => {
  const [priceChart, setPriceChart] = useState(null);
  const [volumeChart, setVolumeChart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data) {
      generateCharts();
    }
  }, [data]);

  const generateCharts = async () => {
    try {
      setLoading(true);
      
      // 生成价格走势图（线图）
      if (data.prices) {
        try {
          // 调用MCP服务器生成线图
          const priceResponse = await window.mcpCall?.(
            'mcp.config.usrlocalmcp.mcp-server-chart',
            'generate_line_chart',
            {
              data: data.prices,
              title: '股价走势图',
              axisXTitle: '时间',
              axisYTitle: '价格 (元)',
              width: 500,
              height: 300
            }
          );
          
          if (priceResponse && priceResponse.length > 0) {
            // MCP服务器返回图片URL
            setPriceChart(priceResponse[0].text);
          }
        } catch (error) {
          console.error('生成价格图表失败:', error);
          // 使用模拟数据作为后备
          setPriceChart(generateMockLineChart(data.prices));
        }
      }

      // 生成成交量柱状图
      if (data.volume) {
        try {
          const volumeResponse = await window.mcpCall?.(
            'mcp.config.usrlocalmcp.mcp-server-chart',
            'generate_column_chart',
            {
              data: data.volume,
              title: '股票指标分析',
              axisXTitle: '指标',
              axisYTitle: '数值',
              width: 500,
              height: 300,
              group: false
            }
          );
          
          if (volumeResponse && volumeResponse.length > 0) {
            setVolumeChart(volumeResponse[0].text);
          }
        } catch (error) {
          console.error('生成指标图表失败:', error);
          // 使用模拟数据作为后备
          setVolumeChart(generateMockColumnChart(data.volume));
        }
      }
    } catch (error) {
      console.error('生成图表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockLineChart = (prices) => {
    // 生成简单的SVG线图作为后备
    const width = 500;
    const height = 300;
    const maxValue = Math.max(...prices.map(p => p.value));
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="white" stroke="#ddd" stroke-width="1"/>`;
    svg += `<text x="${width/2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">股价走势图</text>`;
    svg += `<g transform="translate(50, 50)">`;
    svg += `<line x1="0" y1="0" x2="0" y2="${height-100}" stroke="#333" stroke-width="2"/>`;
    svg += `<line x1="0" y1="${height-100}" x2="${width-100}" y2="${height-100}" stroke="#333" stroke-width="2"/>`;
    
    const points = prices.map((item, i) => {
      const x = (i / (prices.length - 1)) * (width - 100);
      const y = (height - 100) - (item.value / maxValue) * (height - 100);
      return `${x},${y}`;
    }).join(' ');
    
    svg += `<polyline points="${points}" fill="none" stroke="#4F46E5" stroke-width="3"/>`;
    svg += '</g></svg>';
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const generateMockColumnChart = (volume) => {
    // 生成简单的SVG柱状图作为后备
    const width = 500;
    const height = 300;
    const maxValue = Math.max(...volume.map(v => v.value));
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="white" stroke="#ddd" stroke-width="1"/>`;
    svg += `<text x="${width/2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">股票指标分析</text>`;
    svg += `<g transform="translate(50, 50)">`;
    svg += `<line x1="0" y1="0" x2="0" y2="${height-100}" stroke="#333" stroke-width="2"/>`;
    svg += `<line x1="0" y1="${height-100}" x2="${width-100}" y2="${height-100}" stroke="#333" stroke-width="2"/>`;
    
    const barWidth = (width - 100) / volume.length * 0.8;
    volume.forEach((item, i) => {
      const x = i * (width - 100) / volume.length + (width - 100) / volume.length * 0.1;
      const barHeight = (item.value / maxValue) * (height - 100);
      const y = (height - 100) - barHeight;
      
      svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#10B981"/>`;
      svg += `<text x="${x + barWidth/2}" y="${height-80}" text-anchor="middle" font-family="Arial" font-size="12">${item.category}</text>`;
    });
    
    svg += '</g></svg>';
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  if (loading) {
    return (
      <div className="chart-loading">
        <div className="loading-spinner"></div>
        <p>正在生成图表...</p>
      </div>
    );
  }

  return (
    <div className="stock-chart">
      {priceChart && (
        <div className="chart-section">
          <h3>价格走势</h3>
          <div className="chart-display">
            {priceChart.startsWith('http') ? (
              <img src={priceChart} alt="股价走势图" style={{maxWidth: '100%', height: 'auto'}} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: priceChart }} />
            )}
          </div>
        </div>
      )}
      
      {volumeChart && (
        <div className="chart-section">
          <h3>股票指标</h3>
          <div className="chart-display">
            {volumeChart.startsWith('http') ? (
              <img src={volumeChart} alt="股票指标分析" style={{maxWidth: '100%', height: 'auto'}} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: volumeChart }} />
            )}
          </div>
        </div>
      )}
      
      {!priceChart && !volumeChart && (
        <div className="no-chart">
          <p>暂无图表数据</p>
        </div>
      )}
    </div>
  );
};

export default StockChart;