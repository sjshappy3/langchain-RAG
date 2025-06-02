// MCP服务器调用辅助函数

// 模拟MCP调用函数，实际环境中这应该通过适当的MCP客户端实现
const mcpCall = async (serverName, toolName, args) => {
  try {
    // 在实际环境中，这里应该是真正的MCP客户端调用
    // 目前我们通过后端API来模拟MCP调用
    const response = await fetch('/api/mcp/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        server_name: serverName,
        tool_name: toolName,
        args: args
      })
    });

    if (!response.ok) {
      throw new Error(`MCP调用失败: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('MCP调用错误:', error);
    throw error;
  }
};

// 将MCP调用函数挂载到window对象上，供其他组件使用
if (typeof window !== 'undefined') {
  window.mcpCall = mcpCall;
}

export default mcpCall;