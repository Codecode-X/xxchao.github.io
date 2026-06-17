// ============================================================
// 参与确认页
// ============================================================

import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { getSession } from '../services/storageService';

export function ParticipantConfirmationPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const [confirmed, setConfirmed] = useState(false);

  if (!session || session.roomCode !== roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <p className="text-slate-500">未找到有效的调解会话</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">返回首页</button>
        </div>
      </div>
    );
  }

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      navigate(`/room/${session.roomCode}/basic-info`);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 space-y-5">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-700">参与确认</h2>
            <p className="text-sm text-slate-500 mt-1">
              身份：{session.localRole} 方
            </p>
          </div>

          <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200">
            <p className="text-slate-700 text-center leading-relaxed">
              我确认目前正处于一段争吵或矛盾中，并愿意尝试通过平等表达和 AI 调解寻找解决方式。
            </p>
          </div>

          <p className="text-xs text-slate-400 text-center">
            确认只记录在当前设备
          </p>

          {!confirmed ? (
            <button
              onClick={handleConfirm}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              我愿意参与调解
            </button>
          ) : (
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 font-medium">已确认参与</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}