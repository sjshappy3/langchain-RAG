# 智能股票分析系统 (RAG-GUI)

基于LangChain和FastAPI的智能股票分析系统，配备现代化React前端界面和实时图表功能。

## ✨ 核心功能

- 🤖 **智能对话**: 基于LangChain的RAG架构，支持自然语言交互
- 📊 **实时图表**: 自动检测股票查询并生成可视化图表
- 📈 **股票分析**: 实时股票行情、技术分析、财务分析
- 🔍 **智能搜索**: 集成Tavily搜索引擎，获取最新市场资讯
- 💬 **流式响应**: 实时流式对话体验，支持中断和重新生成
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🎨 **现代UI**: 玻璃态设计风格，优雅的用户界面
- 🔄 **并排显示**: 聊天界面与图表面板同时显示，提升分析效率

## 🛠️ 技术栈

### 后端
- **FastAPI** - 高性能Web框架
- **LangChain** - AI应用开发框架
- **Ollama** - 本地LLM服务 (qwen2.5:7b)
- **Tavily API** - 智能搜索引擎
- **美瑞API** - 实时股票数据服务
- **MCP Server** - 图表生成服务集成

### 前端
- **React 18** - 现代化前端框架
- **CSS3** - 玻璃态设计与响应式布局
- **Chart.js/D3.js** - 数据可视化图表库
- **Axios** - HTTP客户端
- **Fetch API** - 流式数据处理
- **React Hooks** - 状态管理与生命周期

## 安装和运行

### 前置要求

1. **Python 3.8+**
2. **Node.js 16+**
3. **Ollama** (用于本地LLM)

### 后端设置

1. 安装Python依赖:
```bash
pip install fastapi uvicorn langchain langchain-ollama gradio tavily-python requests
```

2. 启动Ollama并下载模型:
```bash
# 安装Ollama后运行
ollama pull qwen2.5:7b
```

3. 启动后端服务:
```bash
python 使用FastAPI基于langchain实现RAG-GUI版本.py
```

后端将在 `http://localhost:8000` 启动

### 前端设置

1. 安装Node.js依赖:
```bash
npm install
```

2. 启动React开发服务器:
```bash
npm start
```

前端将在 `http://localhost:3000` 启动

## 📖 使用说明

### 🌐 访问方式

- **React前端**: http://localhost:3000 (推荐，完整功能)
- **FastAPI文档**: http://localhost:8000/docs (API接口文档)

### 🎯 功能模块

#### 1. 📊 实时图表功能
- **自动触发**: 输入包含股票代码或股票名称的问题时自动显示图表
- **并排显示**: 聊天界面左侧，图表面板右侧
- **交互操作**: 点击图表面板右上角 ✕ 关闭图表
- **响应式**: 移动端自动调整为上下布局

#### 2. 📈 股票分析
- **实时查询**: "查询贵州茅台(600519)最新股价"
- **技术分析**: "分析比亚迪(002594)的K线走势和技术指标"
- **财务分析**: "分析平安银行(000001)的财务状况和估值"
- **市场资讯**: "搜索今日A股市场热点新闻"

#### 3. 🔍 智能搜索
- **实时资讯**: "最新科技新闻和市场动态"
- **行业分析**: "人工智能行业发展趋势分析"
- **投资建议**: "当前市场环境下的投资策略"

#### 4. 💬 智能对话
- **自然交互**: 支持中文自然语言对话
- **流式响应**: 实时显示AI回复过程
- **中断功能**: 随时停止生成并重新提问
- **历史记录**: 自动保存搜索历史

## 📁 项目结构

```
langchian project/
├── 使用FastAPI基于langchain实现RAG-GUI版本.py  # 后端主文件
├── package.json                                # Node.js配置
├── README.md                                   # 项目说明
├── public/
│   └── index.html                             # HTML模板
└── src/
    ├── index.js                               # 入口文件
    ├── index.css                              # 全局样式
    ├── App.js                                 # 主应用组件
    ├── App.css                                # 应用样式
    ├── utils/
    │   └── mcpHelper.js                       # MCP服务工具
    └── components/
        ├── Header.js                          # 头部组件
        ├── Header.css                         # 头部样式
        ├── Sidebar.js                         # 侧边栏组件
        ├── Sidebar.css                        # 侧边栏样式
        ├── ChatMessage.js                     # 消息组件
        ├── ChatMessage.css                    # 消息样式
        ├── MessageInput.js                    # 输入组件
        ├── MessageInput.css                   # 输入样式
        ├── StockAnalysis.js                   # 股票分析组件
        ├── StockAnalysis.css                  # 股票分析样式
        ├── StockChart.js                      # 股票图表组件
        ├── StockChart.css                     # 股票图表样式
        ├── KnowledgeBaseManager.js            # 知识库管理组件
        └── KnowledgeBaseManager.css           # 知识库管理样式
```

## 🔌 API接口

### POST /api/chat

智能聊天接口，支持流式响应和多功能集成。

**请求体**:
```json
{
  "message": "用户消息内容"
}
```

**响应**: 流式文本响应 (text/plain)

### POST /api/mcp/call

MCP服务调用接口，用于图表生成和数据可视化。

**请求体**:
```json
{
  "server_name": "mcp.config.usrlocalmcp.mcp-server-chart",
  "tool_name": "generate_line_chart",
  "args": {
    "data": [
      {"time": "09:30", "value": 100.5},
      {"time": "10:00", "value": 102.3}
    ],
    "title": "股价走势图",
    "width": 600,
    "height": 400
  }
}
```

**响应**:
```json
{
  "chart_url": "https://example.com/chart.png",
  "success": true
}
```

### 图表生成接口

- `POST /api/mcp/generate-line-chart` - 生成折线图
- `POST /api/mcp/generate-column-chart` - 生成柱状图  
- `POST /api/mcp/generate-bar-chart` - 生成条形图

## 配置说明

### API密钥配置

在 `使用FastAPI基于langchain实现RAG-GUI版本.py` 中配置:

```python
# Tavily搜索API密钥
client = TavilyClient(api_key="your-tavily-api-key")

# 美瑞股票API密钥
api_key = "your-mairui-api-key"
```

### 模型配置

默认使用 `qwen2.5:7b` 模型，可在代码中修改:

```python
llm = OllamaLLM(model="qwen2.5:7b")
```

## 🔧 开发说明

### 添加新功能

#### 后端扩展
1. **新增工具函数**: 在FastAPI应用中添加LangChain工具
2. **MCP服务集成**: 扩展图表类型和数据可视化功能
3. **API接口**: 添加新的RESTful接口

#### 前端扩展
1. **React组件**: 在 `src/components/` 添加新组件
2. **状态管理**: 使用React Hooks管理应用状态
3. **图表集成**: 扩展StockChart组件支持更多图表类型

### 样式定制

- **玻璃态效果**: 修改CSS中的 `backdrop-filter` 和 `rgba` 值
- **响应式布局**: 调整媒体查询断点和Flexbox布局
- **主题色彩**: 更新渐变背景和组件配色方案
- **动画效果**: 自定义 `transition` 和 `transform` 属性

### 部署建议

#### 生产环境部署
1. **后端**: 
   ```bash
   # 使用Gunicorn部署
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker 使用FastAPI基于langchain实现RAG-GUI版本:app
   
   # 或使用Docker
   docker build -t stock-analysis-backend .
   docker run -p 8000:8000 stock-analysis-backend
   ```

2. **前端**:
   ```bash
   # 构建生产版本
   npm run build
   
   # 使用Nginx或Apache部署静态文件
   cp -r build/* /var/www/html/
   ```

#### 环境变量配置
```bash
# .env 文件
TAVILY_API_KEY=your_tavily_api_key
MAIRUI_API_KEY=your_mairui_api_key
OLLAMA_HOST=http://localhost:11434
```

## 🔧 故障排除

### 常见问题

#### 🚀 启动问题
1. **端口冲突**: 
   - 修改 `package.json` 中的proxy设置
   - 检查8000和3000端口是否被占用

2. **依赖安装失败**:
   ```bash
   # 清除缓存重新安装
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

#### 🤖 AI服务问题
3. **Ollama连接失败**:
   - 确保Ollama服务正常运行: `ollama serve`
   - 检查模型是否已下载: `ollama list`
   - 重新拉取模型: `ollama pull qwen2.5:7b`

4. **API调用失败**:
   - 检查网络连接和API密钥配置
   - 验证Tavily和美瑞API密钥有效性

#### 📊 图表功能问题
5. **图表不显示**:
   - 检查浏览器控制台是否有JavaScript错误
   - 确认股票关键词检测逻辑是否触发
   - 验证MCP服务响应是否正常

6. **图表样式异常**:
   - 清除浏览器缓存
   - 检查CSS文件是否正确加载
   - 验证响应式媒体查询设置

#### 🌐 网络问题
7. **CORS错误**: 
   - 检查FastAPI的CORS配置
   - 确认前后端端口设置正确

8. **流式响应中断**:
   - 检查网络稳定性
   - 验证AbortController实现

### 📋 日志查看

- **后端日志**: 控制台输出和FastAPI访问日志
- **前端日志**: 浏览器开发者工具 Console 面板
- **网络请求**: 浏览器开发者工具 Network 面板
- **React组件**: 使用React Developer Tools扩展

### 🔍 调试技巧

1. **启用详细日志**:
   ```python
   # 在Python文件中添加
   import logging
   logging.basicConfig(level=logging.DEBUG)
   ```

2. **前端调试**:
   ```javascript
   // 在组件中添加调试信息
   console.log('Chart data:', chartData);
   console.log('Show chart:', showChart);
   ```

## 🌟 功能特色

### 🎨 用户界面
- **玻璃态设计**: 现代化的毛玻璃效果界面
- **流畅动画**: 丝滑的过渡效果和交互反馈
- **响应式布局**: 完美适配各种屏幕尺寸
- **深色主题**: 护眼的深色配色方案

### 🚀 性能优化
- **流式响应**: 实时显示AI生成内容
- **智能缓存**: 优化API调用和数据加载
- **异步处理**: 非阻塞的用户交互体验
- **错误恢复**: 优雅的错误处理和重试机制

### 📊 数据可视化
- **多种图表**: 支持折线图、柱状图、饼图等
- **实时更新**: 动态生成和更新图表数据
- **交互操作**: 支持图表缩放、筛选等操作
- **导出功能**: 支持图表导出为图片格式

## 📸 项目截图

> 注: 实际运行效果请访问 http://localhost:3000 体验

- **主界面**: 现代化的聊天界面和功能模块
- **实时图表**: 股票查询时自动显示的可视化图表
- **响应式设计**: 移动端和桌面端的完美适配
- **智能交互**: 流式对话和实时反馈

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献
1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 贡献类型
- 🐛 Bug修复
- ✨ 新功能开发
- 📚 文档改进
- 🎨 UI/UX优化
- ⚡ 性能提升
- 🧪 测试用例

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢以下开源项目和服务：
- [LangChain](https://langchain.com/) - AI应用开发框架
- [FastAPI](https://fastapi.tiangolo.com/) - 现代化Web框架
- [React](https://reactjs.org/) - 用户界面库
- [Ollama](https://ollama.ai/) - 本地LLM服务
- [Tavily](https://tavily.com/) - 智能搜索API

---

**🚀 开始您的智能股票分析之旅！**

如有问题或建议，欢迎提交 [Issue](../../issues) 或联系开发团队。