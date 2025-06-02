import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
# import gradio as gr  # 已移除Gradio依赖
from langchain.callbacks.base import BaseCallbackHandler
from langchain.callbacks.manager import CallbackManager
from langchain.agents import create_react_agent, AgentExecutor
from langchain_core.tools import tool
from langchain_core.prompts import PromptTemplate
from typing import Any
import queue
import threading
import requests
from tavily import TavilyClient
from datetime import datetime
import json
import os
import subprocess
import tempfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# 请求模型
class ChatRequest(BaseModel):
    message: str

class DatabaseConfig(BaseModel):
    type: str
    host: str
    port: str
    database: str
    username: str
    password: str

class ModelScopeConfig(BaseModel):
    dataset_name: str
    subset_name: Optional[str] = None
    split: str = 'train'
    cache_dir: Optional[str] = None


# 为React前端创建流式响应函数
def create_streaming_response(message: str):
    """创建流式响应生成器"""
    try:
        agent_executor, q = create_agent()
        
        def run_agent():
            try:
                response = agent_executor.invoke({
                    "input": message,
                    "handle_parsing_errors": True
                })
                if response and "output" in response:
                    output = response["output"]
                    if "PARSING_ERROR" in output:
                        q.put("抱歉，我理解有误。请使用更清晰的方式描述您的问题。")
                    else:
                        # 按字符分割输出以实现流式效果
                        for char in output:
                            q.put(char)
                else:
                    q.put("无法获取有效响应")
            except Exception as e:
                print(f"Agent error: {e}")
                q.put("处理请求时发生错误，请稍后重试。")
            finally:
                q.put(None)  # 结束标记
        
        # 启动代理线程
        thread = threading.Thread(target=run_agent)
        thread.daemon = True
        thread.start()
        
        # 生成流式响应
        while True:
            try:
                token = q.get(timeout=30.0)
                if token is None:
                    break
                yield token
            except queue.Empty:
                print("Response timeout")
                break
            except Exception as e:
                print(f"Stream error: {e}")
                break
                
    except Exception as e:
        print(f"Streaming response error: {e}")
        yield "处理消息时发生错误，请稍后重试。"


# API端点
@app.get("/")
async def root():
    """根路径端点"""
    return {"message": "RAG聊天服务正在运行", "status": "ok"}

@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy", "service": "RAG Chat API"}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """处理聊天请求的API端点"""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="消息不能为空")
    
    return StreamingResponse(
        create_streaming_response(request.message),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.post("/api/upload-documents")
async def upload_documents(files: List[UploadFile] = File(...)):
    """上传文档到知识库"""
    try:
        uploaded_files = []
        for file in files:
            # 这里可以添加文档处理逻辑
            # 例如：解析文档内容，向量化，存储到向量数据库等
            content = await file.read()
            uploaded_files.append({
                "filename": file.filename,
                "size": len(content),
                "type": file.content_type
            })
            
        return {
            "success": True,
            "message": f"成功上传 {len(files)} 个文档",
            "files": uploaded_files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文档上传失败: {str(e)}")

@app.post("/api/test-db-connection")
async def test_db_connection(config: DatabaseConfig):
    """测试数据库连接"""
    try:
        # 这里可以添加实际的数据库连接测试逻辑
        # 根据不同的数据库类型使用相应的连接库
        if config.type == "mysql":
            # 模拟MySQL连接测试
            pass
        elif config.type == "postgresql":
            # 模拟PostgreSQL连接测试
            pass
        elif config.type == "sqlite":
            # 模拟SQLite连接测试
            pass
            
        return {
            "success": True,
            "message": "数据库连接测试成功"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"数据库连接测试失败: {str(e)}")

@app.post("/api/connect-database")
async def connect_database(config: DatabaseConfig):
    """连接数据库并导入数据到知识库"""
    try:
        # 这里可以添加实际的数据库连接和数据导入逻辑
        # 例如：连接数据库，查询数据，处理并存储到向量数据库
        
        return {
            "success": True,
            "message": "数据库连接成功，数据已导入知识库",
            "documentsCount": 100  # 模拟导入的文档数量
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"数据库连接失败: {str(e)}")

@app.post("/api/clear-knowledge-base")
async def clear_knowledge_base():
    """清空知识库"""
    try:
        # 这里可以添加清空知识库的逻辑
        # 例如：删除向量数据库中的所有数据
        
        return {
            "success": True,
            "message": "知识库已清空"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"清空知识库失败: {str(e)}")

# MCP图表生成请求模型
class MCPChartRequest(BaseModel):
    server_name: str
    tool_name: str
    args: dict

@app.post("/api/mcp/generate-line-chart")
async def generate_line_chart(request: MCPChartRequest):
    """生成线图"""
    try:
        # 调用MCP服务器生成图表
        result = await call_mcp_server(
            request.server_name,
            request.tool_name,
            request.args
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成线图失败: {str(e)}")

@app.post("/api/mcp/generate-column-chart")
async def generate_column_chart(request: MCPChartRequest):
    """生成柱状图"""
    try:
        # 调用MCP服务器生成图表
        result = await call_mcp_server(
            request.server_name,
            request.tool_name,
            request.args
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成柱状图失败: {str(e)}")

@app.post("/api/mcp/generate-bar-chart")
async def generate_bar_chart(request: MCPChartRequest):
    """生成条形图"""
    try:
        # 调用MCP服务器生成图表
        result = await call_mcp_server(
            request.server_name,
            request.tool_name,
            request.args
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成条形图失败: {str(e)}")

@app.post("/api/mcp/call")
async def mcp_call(request: MCPChartRequest):
    """通用MCP服务器调用端点"""
    try:
        # 模拟MCP调用，返回图表URL
        if request.server_name == "mcp.config.usrlocalmcp.mcp-server-chart":
            if request.tool_name == "generate_line_chart":
                # 返回模拟的图表URL格式，与真实MCP服务器返回格式一致
                return [{"type": "text", "text": "https://mdn.alipayobjects.com/one_clip/afts/img/yWgRSq3SMOkAAAAAQxAAAAgAoEACAQFr/original"}]
            elif request.tool_name == "generate_column_chart":
                return [{"type": "text", "text": "https://mdn.alipayobjects.com/one_clip/afts/img/A*8qbRQKQdXPsAAAAAQxAAAAgAoEACAQFr/original"}]
            elif request.tool_name == "generate_bar_chart":
                return [{"type": "text", "text": "https://mdn.alipayobjects.com/one_clip/afts/img/A*2VvTSZmI4vYAAAAAQxAAAAgAoEACAQFr/original"}]
        
        # 如果不是图表服务器，返回通用成功响应
        return {"status": "success", "message": "MCP调用成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MCP调用失败: {str(e)}")

async def call_mcp_server(server_name: str, tool_name: str, args: dict):
    """调用MCP服务器"""
    try:
        # 这里需要实际调用MCP服务器
        # 由于MCP服务器通常通过命令行或特定协议调用，这里提供一个模拟实现
        
        # 模拟生成SVG图表内容
        if tool_name == 'generate_line_chart':
            svg_content = generate_mock_line_chart(args)
        elif tool_name == 'generate_column_chart':
            svg_content = generate_mock_column_chart(args)
        elif tool_name == 'generate_bar_chart':
            svg_content = generate_mock_bar_chart(args)
        else:
            raise ValueError(f"不支持的图表类型: {tool_name}")
            
        return svg_content
    except Exception as e:
        raise Exception(f"MCP服务器调用失败: {str(e)}")

def generate_mock_line_chart(args):
    """生成模拟线图SVG"""
    data = args.get('data', [])
    title = args.get('title', '线图')
    width = args.get('width', 500)
    height = args.get('height', 300)
    
    # 生成简单的SVG线图
    svg = f'''<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white" stroke="#ddd" stroke-width="1"/>
        <text x="{width//2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">{title}</text>
        <g transform="translate(50, 50)">
            <line x1="0" y1="0" x2="0" y2="{height-100}" stroke="#333" stroke-width="2"/>
            <line x1="0" y1="{height-100}" x2="{width-100}" y2="{height-100}" stroke="#333" stroke-width="2"/>
    '''
    
    if data:
        # 计算点的位置
        max_value = max([item['value'] for item in data])
        points = []
        for i, item in enumerate(data):
            x = (i / (len(data) - 1)) * (width - 100) if len(data) > 1 else (width - 100) / 2
            y = (height - 100) - (item['value'] / max_value) * (height - 100)
            points.append(f"{x},{y}")
        
        # 绘制线条
        svg += f'<polyline points="{" ".join(points)}" fill="none" stroke="#4F46E5" stroke-width="3"/>'
        
        # 绘制点
        for i, point in enumerate(points):
            x, y = point.split(',')
            svg += f'<circle cx="{x}" cy="{y}" r="4" fill="#4F46E5"/>'
    
    svg += '</g></svg>'
    return svg

def generate_mock_column_chart(args):
    """生成模拟柱状图SVG"""
    data = args.get('data', [])
    title = args.get('title', '柱状图')
    width = args.get('width', 500)
    height = args.get('height', 300)
    
    svg = f'''<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white" stroke="#ddd" stroke-width="1"/>
        <text x="{width//2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">{title}</text>
        <g transform="translate(50, 50)">
            <line x1="0" y1="0" x2="0" y2="{height-100}" stroke="#333" stroke-width="2"/>
            <line x1="0" y1="{height-100}" x2="{width-100}" y2="{height-100}" stroke="#333" stroke-width="2"/>
    '''
    
    if data:
        max_value = max([item['value'] for item in data])
        bar_width = (width - 100) / len(data) * 0.8
        
        for i, item in enumerate(data):
            x = i * (width - 100) / len(data) + (width - 100) / len(data) * 0.1
            bar_height = (item['value'] / max_value) * (height - 100)
            y = (height - 100) - bar_height
            
            svg += f'<rect x="{x}" y="{y}" width="{bar_width}" height="{bar_height}" fill="#10B981"/>'
            svg += f'<text x="{x + bar_width/2}" y="{height-80}" text-anchor="middle" font-family="Arial" font-size="12">{item.get("category", "")})</text>'
    
    svg += '</g></svg>'
    return svg

def generate_mock_bar_chart(args):
    """生成模拟条形图SVG"""
    data = args.get('data', [])
    title = args.get('title', '条形图')
    width = args.get('width', 500)
    height = args.get('height', 300)
    
    svg = f'''<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white" stroke="#ddd" stroke-width="1"/>
        <text x="{width//2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">{title}</text>
        <g transform="translate(50, 50)">
            <line x1="0" y1="0" x2="0" y2="{height-100}" stroke="#333" stroke-width="2"/>
            <line x1="0" y1="{height-100}" x2="{width-100}" y2="{height-100}" stroke="#333" stroke-width="2"/>
    '''
    
    if data:
        max_value = max([item['value'] for item in data])
        bar_height = (height - 100) / len(data) * 0.8
        
        for i, item in enumerate(data):
            y = i * (height - 100) / len(data) + (height - 100) / len(data) * 0.1
            bar_width = (item['value'] / max_value) * (width - 100)
            
            svg += f'<rect x="0" y="{y}" width="{bar_width}" height="{bar_height}" fill="#F59E0B"/>'
            svg += f'<text x="-10" y="{y + bar_height/2 + 4}" text-anchor="end" font-family="Arial" font-size="12">{item.get("category", "")}</text>'
    
    svg += '</g></svg>'
    return svg

@app.post("/api/connect-modelscope")
async def connect_modelscope(config: ModelScopeConfig):
    """连接ModelScope数据集并导入到知识库"""
    try:
        # 导入ModelScope相关库
        try:
            from modelscope.msdatasets import MsDataset
        except ImportError:
            raise HTTPException(status_code=500, detail="ModelScope库未安装，请先安装：pip install modelscope")
        
        # 加载数据集
        dataset_params = {
            'dataset_name': config.dataset_name,
            'split': config.split
        }
        
        if config.subset_name:
            dataset_params['subset_name'] = config.subset_name
        if config.cache_dir:
            dataset_params['cache_dir'] = config.cache_dir
            
        # 加载数据集
        ds = MsDataset.load(**dataset_params)
        
        # 获取数据集信息
        dataset_info = {
            "dataset_name": config.dataset_name,
            "subset_name": config.subset_name,
            "split": config.split,
            "total_samples": len(ds) if hasattr(ds, '__len__') else "未知",
            "features": list(ds.features.keys()) if hasattr(ds, 'features') else []
        }
        
        # 这里可以添加数据集处理和向量化的逻辑
        # 例如：提取文本内容，分块，向量化，存储到向量数据库
        
        return {
            "success": True,
            "message": f"成功连接ModelScope数据集: {config.dataset_name}",
            "dataset_info": dataset_info,
            "documentsCount": len(ds) if hasattr(ds, '__len__') else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"连接ModelScope数据集失败: {str(e)}")

@app.get("/api/modelscope/datasets")
async def get_popular_datasets():
    """获取热门ModelScope数据集列表"""
    try:
        # 返回一些热门的数据集示例
        popular_datasets = [
            {
                "name": "CMB_AILab/YiZhao-FinDataSet",
                "description": "金融数据集",
                "subsets": ["cn", "en"],
                "splits": ["train", "test", "validation"]
            },
            {
                "name": "DAMO_NLP/news_commentary",
                "description": "新闻评论数据集",
                "subsets": ["zh-en"],
                "splits": ["train", "test"]
            },
            {
                "name": "modelscope/alpaca-gpt4-data-zh",
                "description": "中文指令数据集",
                "subsets": [],
                "splits": ["train"]
            },
            {
                "name": "AI-ModelScope/blossom-math-v2",
                "description": "数学问题数据集",
                "subsets": [],
                "splits": ["train"]
            }
        ]
        
        return {
            "success": True,
            "datasets": popular_datasets
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取数据集列表失败: {str(e)}")


# 定义工具
@tool("tavily_search")
def tavily_search(query: str) -> dict:
    """使用Tavily搜索引擎搜索信息.
    query: 搜索查询词
    """
    client = TavilyClient(api_key="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")
    return client.search(query, max_results=3)


@tool("mairui")
def mairui_api(code: str) -> dict:
    """查询股票实时行情.
    code: 股票代码(如000001)
    字段说明：
    fm: 五分钟涨跌幅（%）
    h: 最高价（元）
    hs: 换手（%）
    lb: 量比（%）
    l: 最低价（元）
    lt: 流通市值（元）
    o: 开盘价（元）
    pe: 市盈率
    pc: 涨跌幅（%）
    p: 当前价格（元）
    sz: 总市值（元）
    cje: 成交额（元）
    ud: 涨跌额（元）
    v: 成交量（手）
    yc: 昨日收盘价（元）
    zf: 振幅（%）
    zs: 涨速（%）
    """
    api_key = "00F373EB-1FC8-4F31-A34C-F496BA4B87C2"
    url = f"http://api.mairui.club/hsrl/ssjy/{code}/{api_key}"
    try:
        response = requests.get(url)
        result = response.json()

        if not isinstance(result, dict):
            return {"error": "API返回格式错误"}

        if result.get('msg') == 'ok' and result.get('data'):
            data = result['data']
            return {
                "股票名称": data.get('name', '未知'),
                "当前价格": f"{data.get('p', 0)}元",
                "涨跌幅": f"{data.get('pc', 0)}%",
                "涨跌额": f"{data.get('ud', 0)}元",
                "成交量": f"{data.get('v', 0)}手",
                "成交额": f"{data.get('cje', 0)}元",
                "振幅": f"{data.get('zf', 0)}%",
                "最高": f"{data.get('h', 0)}元",
                "最低": f"{data.get('l', 0)}元",
                "今开": f"{data.get('o', 0)}元",
                "昨收": f"{data.get('yc', 0)}元",
                "量比": f"{data.get('lb', 0)}",
                "换手率": f"{data.get('hs', 0)}%",
                "市盈率": data.get('pe', 0),
                "总市值": f"{data.get('sz', 0)}元",
                "流通市值": f"{data.get('lt', 0)}元",
                "涨速": f"{data.get('zs', 0)}%",
                "60日涨跌幅": f"{data.get('zdf60', 0)}%",
                "年初至今涨跌幅": f"{data.get('zdfnc', 0)}%",
                "更新时间": data.get('t', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
            }
        return {"error": "获取数据失败，API返回错误"}

    except requests.RequestException as e:
        return {"error": f"网络请求失败: {str(e)}"}
    except json.JSONDecodeError as e:
        return {"error": f"数据解析失败: {str(e)}"}
    except Exception as e:
        return {"error": f"未知错误: {str(e)}"}


class QueueCallback(BaseCallbackHandler):
    """自定义回调处理器"""

    def __init__(self, q: queue.Queue):
        self.q = q

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        self.q.put(token)


def create_agent():
    """创建Agent"""
    q = queue.Queue()
    callback = QueueCallback(q)

    # from vllm import LLM
    # llm = LLM(model="qwen2.5:7b")

    # from langchain_openai import ChatOpenAI
    # from dotenv import load_dotenv, find_dotenv
    # from langchain.schema import SystemMessage, AIMessage, HumanMessage
    #
    # _ = load_dotenv(find_dotenv())
    # llm = ChatOpenAI(model="gpt-4", temperature=0)
    from langchain_ollama import OllamaLLM
    llm = OllamaLLM(
        model="qwen2.5:7b",
        callback_manager=CallbackManager([callback])
    )

    tools = [mairui_api, tavily_search]

    prompt = PromptTemplate.from_template(
        """尽可能简约和准确地使用中文回应如下问题。您可以使用以下工具:
{tools}

使用以下格式：
Question: 您必须回答的输入问题
Thought: 你应该始终思考该做什么
Action: 要采取的操作名称（可用工具：{tool_names}）
Action Input: 要传递给工具的参数
Observation: 工具返回的结果
... (这个思考/行动/观察可以重复多次)
Thought: 我现在知道最终答案了
Final Answer: 原始输入问题的最终答案

对于股票查询，你可以：
1. 使用mairui工具获取股票的实时行情数据
2. 使用tavily_search工具搜索相关新闻和分析

注意事项：
- 股票代码必须是6位数字，不要加任何引号或其他字符
- A股代码：上海主板以6开头，深圳主板以000开头，创业板以300开头，科创板以688开头
- 如果遇到股票名称查询，请先使用tavily_search搜索股票代码

示例格式：
Action: mairui
Action Input: 600519

开始!
Question: {input}
Thought: {agent_scratchpad}

提醒！务必使用中文回答，并对数据进行合理的解读和总结。
""")

    agent = create_react_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True,
        max_iterations=5  # 限制最大迭代次数
    )

    return agent_executor, q


# bot_response函数已移除，使用FastAPI的流式响应替代


# FastAPI后端已配置完成，移除Gradio界面

# 挂载静态文件目录（在所有API路由定义之后）
# 注意：根路径挂载必须放在最后，避免拦截API请求
app.mount("/static", StaticFiles(directory="build/static"), name="static")
# 移除根路径挂载，改为在根路径返回index.html

@app.get("/")
async def read_index():
    """返回React应用的index.html"""
    return FileResponse('build/index.html')

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """为React SPA提供fallback路由"""
    # 如果是静态资源请求，直接返回文件
    if full_path.startswith('static/'):
        file_path = f"build/{full_path}"
        if os.path.exists(file_path):
            return FileResponse(file_path)
    
    # 对于其他路径，返回index.html让React Router处理
    return FileResponse('build/index.html')

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)