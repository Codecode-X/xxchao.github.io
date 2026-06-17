// ============================================================
// 首页
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoomCode, generateRoomSecret, validateRoomCode } from '../services/roomCodeGenerator';
import { createSession } from '../services/storageService';
import { PrivacyNotice } from '../components/PrivacyNotice';

export function HomePage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinRoomSecret, setJoinRoomSecret] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleCreate = () => {
    const roomCode = generateRoomCode();
    const roomSecret = generateRoomSecret();
    createSession(roomCode, roomSecret, 'A');
    navigate(`/room/${roomCode}/credentials`);
  };

  const handleJoin = () => {
    const code = joinRoomCode.toUpperCase().trim();
    if (!validateRoomCode(code)) {
      setJoinError('房间代码格式无效（需6位大写字母+数字）');
      return;
    }
    if (!joinRoomSecret.trim()) {
      setJoinError('请输入房间密钥');
      return;
    }
    createSession(code, joinRoomSecret.trim(), 'B');
    navigate(`/room/${code}/credentials`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full space-y-8">
        {/* 标题区域 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-indigo-600 tracking-wide">息小吵</h1>
          <p className="text-lg text-slate-500 italic">
            先让情绪停一停，再把彼此的话听清楚。
          </p>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            双方独立完成表达，再将提交码交给发起方。
            只有收集到双方的完整提交后，AI 才会开始调解。
          </p>
        </div>

        {/* 入口按钮 */}
        {!showCreate && !showJoin && (
          <div className="space-y-4">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-lg shadow-lg shadow-indigo-200"
            >
              创建调解房间
            </button>
            <button
              onClick={() => setShowJoin(true)}
              className="w-full py-4 bg-white border-2 border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-semibold text-lg"
            >
              以 B 方身份加入
            </button>
          </div>
        )}

        {/* 创建调解 */}
        {showCreate && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-indigo-100">
            <h2 className="text-xl font-semibold text-slate-700">创建调解房间</h2>
            <p className="text-sm text-slate-500">
              你将作为 A 方（发起方），创建房间后需要将房间代码和房间密钥发送给对方。
            </p>
            <button
              onClick={handleCreate}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              确认创建
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="w-full py-2 text-slate-500 hover:text-slate-700 transition-colors text-sm"
            >
              返回
            </button>
          </div>
        )}

        {/* 加入调解 */}
        {showJoin && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-pink-100">
            <h2 className="text-xl font-semibold text-slate-700">以 B 方身份加入</h2>
            <p className="text-sm text-slate-500">
              请输入 A 方提供的房间代码和房间密钥。
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  请输入房间代码
                </label>
                <input
                  type="text"
                  value={joinRoomCode}
                  onChange={(e) => {
                    setJoinRoomCode(e.target.value.toUpperCase());
                    setJoinError('');
                  }}
                  placeholder="X7K9MP"
                  maxLength={6}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none text-center text-lg font-mono tracking-widest"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  请输入房间密钥
                </label>
                <textarea
                  value={joinRoomSecret}
                  onChange={(e) => {
                    setJoinRoomSecret(e.target.value);
                    setJoinError('');
                  }}
                  placeholder="A 方提供的房间密钥"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none text-sm font-mono"
                />
              </div>
              {joinError && (
                <p className="text-sm text-red-500 text-center">{joinError}</p>
              )}
            </div>
            <button
              onClick={handleJoin}
              className="w-full py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors font-medium"
            >
              以 B 方身份加入
            </button>
            <button
              onClick={() => {
                setShowJoin(false);
                setJoinError('');
              }}
              className="w-full py-2 text-slate-500 hover:text-slate-700 transition-colors text-sm"
            >
              返回
            </button>
          </div>
        )}

        {/* 隐私说明 */}
        <PrivacyNotice />
      </div>
    </div>
  );
}