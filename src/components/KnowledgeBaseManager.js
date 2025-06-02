import React, { useState } from 'react';
import './KnowledgeBaseManager.css';

const KnowledgeBaseManager = ({ isOpen, onClose, knowledgeBase, onUpdateKnowledgeBase }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dbConfig, setDbConfig] = useState({
    type: 'mysql',
    host: '',
    port: '',
    database: '',
    username: '',
    password: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [modelScopeConfig, setModelScopeConfig] = useState({
    dataset_name: 'CMB_AILab/YiZhao-FinDataSet',
    subset_name: 'cn',
    split: 'train',
    cache_dir: ''
  });
  const [isLoadingDataset, setIsLoadingDataset] = useState(false);
  const [popularDatasets, setPopularDatasets] = useState([]);

  if (!isOpen) return null;

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('http://localhost:8000/api/upload-documents', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 更新知识库状态
        onUpdateKnowledgeBase({
          status: 'ready',
          documentsCount: knowledgeBase.documentsCount + files.length,
          lastUpdated: new Date().toISOString()
        });
        
        alert(result.message);
      } else {
        throw new Error(result.message || '文档上传失败');
      }
    } catch (error) {
      alert('文档上传失败：' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setUploadFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      uploadFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      
      const response = await fetch('http://localhost:8000/api/upload-documents', {
        method: 'POST',
        body: formData
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const result = await response.json();
      
      if (result.success) {
        onUpdateKnowledgeBase({
          status: 'ready',
          documentsCount: knowledgeBase.documentsCount + uploadFiles.length,
          lastUpdated: new Date().toISOString()
        });
        setUploadFiles([]);
        alert(result.message);
      } else {
        throw new Error(result.message || '文档上传失败');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('文档上传失败：' + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDbConfigChange = (field, value) => {
    setDbConfig(prev => ({ ...prev, [field]: value }));
  };

  const testConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/test-db-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dbConfig)
      });
      
      if (response.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDatabaseConnect = async () => {
    if (!dbConfig.host || !dbConfig.database) {
      alert('请填写完整的数据库连接信息');
      return;
    }

    setIsConnecting(true);
    try {
      // 测试数据库连接
      const testResponse = await fetch('http://localhost:8000/api/test-db-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dbConfig)
      });
      
      if (!testResponse.ok) {
        throw new Error('数据库连接测试失败');
      }
      
      // 连接数据库并导入数据
      const connectResponse = await fetch('http://localhost:8000/api/connect-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dbConfig)
      });
      
      const result = await connectResponse.json();
      
      if (result.success) {
        // 更新知识库状态
        onUpdateKnowledgeBase({
          status: 'ready',
          documentsCount: knowledgeBase.documentsCount + (result.documentsCount || 0),
          lastUpdated: new Date().toISOString()
        });
        
        alert(result.message);
      } else {
        throw new Error(result.message || '数据库连接失败');
      }
    } catch (error) {
      alert('数据库连接失败：' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectDatabase = async () => {
    if (connectionStatus !== 'success') {
      alert('请先测试数据库连接');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/connect-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dbConfig)
      });
      
      if (response.ok) {
        const result = await response.json();
        onUpdateKnowledgeBase({
          status: 'ready',
          documentsCount: result.documentsCount || 0,
          lastUpdated: new Date()
        });
        alert('数据库连接成功！知识库已更新。');
      } else {
        throw new Error('连接失败');
      }
    } catch (error) {
      console.error('Database connection error:', error);
      alert('数据库连接失败，请检查配置。');
    }
  };

  const clearKnowledgeBase = async () => {
    if (!window.confirm('确定要清空知识库吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/clear-knowledge-base', {
        method: 'POST'
      });
      
      if (response.ok) {
        onUpdateKnowledgeBase({
          status: 'ready',
          documentsCount: 0,
          lastUpdated: new Date()
        });
        alert('知识库已清空。');
      } else {
        throw new Error('清空失败');
      }
    } catch (error) {
      console.error('Clear knowledge base error:', error);
      alert('清空知识库失败，请重试。');
    }
  };

  return (
    <div className="kb-manager-overlay">
      <div className="kb-manager-modal">
        <div className="kb-manager-header">
          <h2>📚 知识库管理</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="kb-manager-tabs">
          <button 
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            📄 文档上传
          </button>
          <button 
            className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            🗄️ 数据库连接
          </button>
          <button 
            className={`tab-btn ${activeTab === 'modelscope' ? 'active' : ''}`}
            onClick={() => setActiveTab('modelscope')}
          >
            🤖 ModelScope数据集
          </button>
          <button 
            className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            ⚙️ 管理设置
          </button>
        </div>
        
        <div className="kb-manager-content">
          {activeTab === 'upload' && (
            <div className="upload-section">
              <div className="upload-area">
                <input
                  type="file"
                  multiple
                  accept=".txt,.pdf,.doc,.docx,.md"
                  onChange={handleFileSelect}
                  className="file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="upload-label">
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">
                    <p>点击选择文件或拖拽文件到此处</p>
                    <p className="upload-hint">支持 TXT, PDF, DOC, DOCX, MD 格式</p>
                  </div>
                </label>
              </div>
              
              {uploadFiles.length > 0 && (
                <div className="file-list">
                  <h4>待上传文件：</h4>
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <button 
                        className="remove-file-btn"
                        onClick={() => removeFile(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {isUploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p>上传进度: {uploadProgress}%</p>
                </div>
              )}
              
              <button 
                className="upload-btn"
                onClick={handleUpload}
                disabled={uploadFiles.length === 0 || isUploading}
              >
                {isUploading ? '上传中...' : '开始上传'}
              </button>
            </div>
          )}
          
          {activeTab === 'database' && (
            <div className="database-section">
              <div className="db-config">
                <h4>数据库配置</h4>
                
                <div className="config-row">
                  <label>数据库类型：</label>
                  <select 
                    value={dbConfig.type}
                    onChange={(e) => handleDbConfigChange('type', e.target.value)}
                  >
                    <option value="mysql">MySQL</option>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="sqlite">SQLite</option>
                  </select>
                </div>
                
                <div className="config-row">
                  <label>主机地址：</label>
                  <input
                    type="text"
                    value={dbConfig.host}
                    onChange={(e) => handleDbConfigChange('host', e.target.value)}
                    placeholder="localhost"
                  />
                </div>
                
                <div className="config-row">
                  <label>端口：</label>
                  <input
                    type="text"
                    value={dbConfig.port}
                    onChange={(e) => handleDbConfigChange('port', e.target.value)}
                    placeholder="3306"
                  />
                </div>
                
                <div className="config-row">
                  <label>数据库名：</label>
                  <input
                    type="text"
                    value={dbConfig.database}
                    onChange={(e) => handleDbConfigChange('database', e.target.value)}
                    placeholder="database_name"
                  />
                </div>
                
                <div className="config-row">
                  <label>用户名：</label>
                  <input
                    type="text"
                    value={dbConfig.username}
                    onChange={(e) => handleDbConfigChange('username', e.target.value)}
                    placeholder="username"
                  />
                </div>
                
                <div className="config-row">
                  <label>密码：</label>
                  <input
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => handleDbConfigChange('password', e.target.value)}
                    placeholder="password"
                  />
                </div>
                
                <div className="db-actions">
                  <button 
                    className="test-btn"
                    onClick={testConnection}
                    disabled={isConnecting}
                  >
                    {isConnecting ? '测试中...' : '测试连接'}
                  </button>
                  
                  {connectionStatus && (
                    <span className={`connection-status ${connectionStatus}`}>
                      {connectionStatus === 'success' ? '✅ 连接成功' : '❌ 连接失败'}
                    </span>
                  )}
                  
                  <button 
                    className="connect-btn"
                    onClick={connectDatabase}
                    disabled={connectionStatus !== 'success'}
                  >
                    连接数据库
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'modelscope' && (
            <div className="modelscope-section">
              <div className="modelscope-config">
                <h4>🤖 ModelScope数据集配置</h4>
                <div className="config-form">
                  <div className="form-group">
                    <label>数据集名称：</label>
                    <input
                      type="text"
                      value={modelScopeConfig.dataset_name}
                      onChange={(e) => setModelScopeConfig({
                        ...modelScopeConfig,
                        dataset_name: e.target.value
                      })}
                      placeholder="例如：CMB_AILab/YiZhao-FinDataSet"
                    />
                  </div>
                  <div className="form-group">
                    <label>子集名称（可选）：</label>
                    <input
                      type="text"
                      value={modelScopeConfig.subset_name}
                      onChange={(e) => setModelScopeConfig({
                        ...modelScopeConfig,
                        subset_name: e.target.value
                      })}
                      placeholder="例如：cn"
                    />
                  </div>
                  <div className="form-group">
                    <label>数据分割：</label>
                    <select
                      value={modelScopeConfig.split}
                      onChange={(e) => setModelScopeConfig({
                        ...modelScopeConfig,
                        split: e.target.value
                      })}
                    >
                      <option value="train">train</option>
                      <option value="test">test</option>
                      <option value="validation">validation</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>缓存目录（可选）：</label>
                    <input
                      type="text"
                      value={modelScopeConfig.cache_dir}
                      onChange={(e) => setModelScopeConfig({
                        ...modelScopeConfig,
                        cache_dir: e.target.value
                      })}
                      placeholder="留空使用默认缓存目录"
                    />
                  </div>
                  <button
                    className="connect-btn"
                    onClick={async () => {
                      setIsLoadingDataset(true);
                      try {
                        const response = await fetch('http://localhost:8000/api/connect-modelscope', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(modelScopeConfig)
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                          onUpdateKnowledgeBase({
                            status: 'ready',
                            documentsCount: result.data_count || 0,
                            lastUpdated: new Date().toISOString()
                          });
                          alert(`成功连接ModelScope数据集！\n数据集：${result.dataset_name}\n数据量：${result.data_count} 条`);
                        } else {
                          throw new Error(result.message || '连接失败');
                        }
                      } catch (error) {
                        alert('连接ModelScope数据集失败：' + error.message);
                      } finally {
                        setIsLoadingDataset(false);
                      }
                    }}
                    disabled={isLoadingDataset || !modelScopeConfig.dataset_name}
                  >
                    {isLoadingDataset ? '🔄 连接中...' : '🚀 连接数据集'}
                  </button>
                </div>
              </div>
              
              <div className="popular-datasets">
                <h4>🔥 热门数据集</h4>
                <div className="dataset-list">
                  <div className="dataset-item" onClick={() => setModelScopeConfig({
                    ...modelScopeConfig,
                    dataset_name: 'CMB_AILab/YiZhao-FinDataSet',
                    subset_name: 'cn',
                    split: 'train'
                  })}>
                    <div className="dataset-name">CMB_AILab/YiZhao-FinDataSet</div>
                    <div className="dataset-desc">金融数据集 - 中文</div>
                  </div>
                  <div className="dataset-item" onClick={() => setModelScopeConfig({
                    ...modelScopeConfig,
                    dataset_name: 'modelscope/alpaca-gpt4-data-zh',
                    subset_name: '',
                    split: 'train'
                  })}>
                    <div className="dataset-name">modelscope/alpaca-gpt4-data-zh</div>
                    <div className="dataset-desc">中文指令数据集</div>
                  </div>
                  <div className="dataset-item" onClick={() => setModelScopeConfig({
                    ...modelScopeConfig,
                    dataset_name: 'AI-ModelScope/blossom-math-v2',
                    subset_name: '',
                    split: 'train'
                  })}>
                    <div className="dataset-name">AI-ModelScope/blossom-math-v2</div>
                    <div className="dataset-desc">数学问题数据集</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'manage' && (
            <div className="manage-section">
              <div className="kb-info">
                <h4>知识库状态</h4>
                <div className="info-item">
                  <span>状态：</span>
                  <span className={`status ${knowledgeBase.status}`}>
                    {knowledgeBase.status === 'ready' ? '✅ 就绪' : 
                     knowledgeBase.status === 'loading' ? '🔄 加载中' : '❌ 离线'}
                  </span>
                </div>
                <div className="info-item">
                  <span>文档数量：</span>
                  <span>{knowledgeBase.documentsCount} 个</span>
                </div>
                <div className="info-item">
                  <span>最后更新：</span>
                  <span>
                    {knowledgeBase.lastUpdated 
                      ? new Date(knowledgeBase.lastUpdated).toLocaleString()
                      : '未知'}
                  </span>
                </div>
              </div>
              
              <div className="manage-actions">
                <button 
                  className="danger-btn"
                  onClick={async () => {
                    if (window.confirm('确定要清空知识库吗？此操作不可撤销。')) {
                      try {
                        const response = await fetch('http://localhost:8000/api/clear-knowledge-base', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          }
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                          onUpdateKnowledgeBase({
                            status: 'offline',
                            documentsCount: 0,
                            lastUpdated: new Date().toISOString()
                          });
                          alert(result.message);
                        } else {
                          throw new Error(result.message || '清空知识库失败');
                        }
                      } catch (error) {
                        alert('清空知识库失败：' + error.message);
                      }
                    }
                  }}
                >
                  🗑️ 清空知识库
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseManager;