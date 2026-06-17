// ============================================================
// AI 服务设置页面
// ============================================================

import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { getSession, saveAISettingsToSession, getAISettingsFromSession, setMediationStyle } from '../services/storageService';
import type { MediationStyle } from '../types';

const STYLE_OPTIONS: MediationStyle[] = ['理性分析型', '温柔共情型', '直接高效型'];

export function AISettingsPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const savedSettings = getAISettingsFromSession();

  const [apiEndpoint, setApiEndpoint] = useState(savedSettings?.apiEndpoint || '');
  const [modelName, setModelName] = useState(savedSettings?.modelName || '');
  const [apiKey, setApiKey] = useState(savedSettings?.apiKey || '');
  const [saveToSession, setSaveToSession] = useState(savedSettings?.saveToSession || false);
  const [mediationStyle, setMediationStyleState] = useState<MediationStyle>(session?.mediationStyle || '温柔共情型');

  if (!session || session.roomCode !== roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-slate-500">未找到有效会话</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">返回首页</button>
        </div>
      </div>
    );
  }

  const handleStart = () => {
    const settings = {
      apiEndpoint,
      modelName,
      apiKey,
      saveToSession,
    };

    if (saveToSession) {
      saveAISettingsToSession(settings);
    }

    setMediationStyle(mediationStyle);

    if (window.confirm('系统已经收集到双方的完整提交。接下来将把双方信息发送给所配置的 AI 服务进行分析。\n\n确认继续？')) {
      navigate(`/room/${roomCode}/ai-processing`);
    }
  };

  const isValid = apiEndpoint.trim() && modelName.trim() && apiKey.trim();

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <div className="max-w-lg w-full mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 space-y-5">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-700">AI 服务设置</h2>
            <p className="text-sm text-slate-500 mt-1">配置 AI 服务的连接信息</p>
          </div>

          {/* 安全提示 */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <p className="text-sm text-amber-700">
              本网站是纯前端应用。你填写的 API Key 将由浏览器直接发送到所配置的 AI 接口，请勿使用权限过高或长期有效的主密钥。
            </p>
          </div>

          {/* API 地址 */}
          <div>
            <label className="text-sm font-medium text-slate-600">API 地址</label>
            <input
              type="url"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              placeholder="https://api.example.com/v1/chat/completions"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none mt-1"
            />
          </div>

          {/* 模型名称 */}
          <div>
            <label className="text-sm font-medium text-slate-600">模型名称</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="gpt-4o / deepseek-chat / claude-3.5-sonnet 等"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none mt-1"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="text-sm font-medium text-slate-600">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="你的 AI 服务 API Key"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none mt-1"
            />
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={saveToSession}
                onChange={(e) => setSaveToSession(e.target.checked)}
                className="accent-indigo-600"
              />
              <span className="text-sm text-slate-500">保存到当前页面会话（刷新后可能需要重新填写）</span>
            </div>
          </div>

          {/* 调解风格 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">调解风格</label>
            <div className="flex gap-2">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style}
                  onClick={() => setMediationStyleState(style)}
                  className={`flex-1 py-2 rounded-xl text-sm transition-colors ${
                    mediationStyle === style
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!isValid}
            className={`w-full py-3 rounded-xl font-medium transition-colors ${
              isValid
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            确认并开始 AI 调解
          </button>
        </div>
      </div>
    </div>
  );
}