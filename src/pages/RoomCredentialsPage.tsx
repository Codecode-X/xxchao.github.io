// ============================================================
// 房间凭据展示页
// ============================================================

import { useNavigate, useParams } from 'react-router-dom';
import { getSession } from '../services/storageService';

export function RoomCredentialsPage() {
  const { roomCode: urlRoomCode } = useParams();
  const navigate = useNavigate();
  const session = getSession();

  if (!session || session.roomCode !== urlRoomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <p className="text-slate-500">未找到有效的调解会话</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const isCreator = session.localRole === 'A';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 space-y-5">
          <div className="text-center">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-700">
              {isCreator ? '调解房间已创建' : '已加入调解房间'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              你的身份：{session.localRole} 方{isCreator ? '（发起方）' : '（参与方）'}
            </p>
          </div>

          {/* 房间代码 */}
          <div className="bg-slate-50 rounded-xl p-4 text-center space-y-2">
            <p className="text-sm text-slate-500">房间代码</p>
            <p className="text-3xl font-mono font-bold text-indigo-600 tracking-[0.3em]">
              {session.roomCode}
            </p>
          </div>

          {/* 房间密钥 */}
          {isCreator && (
            <div className="bg-amber-50 rounded-xl p-4 space-y-2 border border-amber-200">
              <p className="text-sm font-medium text-amber-700">房间密钥（请安全地发送给 B 方）</p>
              <div className="bg-white rounded-lg p-3 font-mono text-xs break-all select-all border border-amber-100">
                {session.roomSecret}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(session.roomSecret)}
                className="text-sm text-amber-600 hover:text-amber-700 underline"
              >
                复制密钥
              </button>
            </div>
          )}

          {/* 重要提示 */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-700">
              房间代码只用于标识本次调解。由于网站没有服务器，请同时将房间密钥发送给对方。
            </p>
          </div>

          {/* 下一步 */}
          <button
            onClick={() => navigate(`/room/${session.roomCode}/confirm`)}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            继续
          </button>
        </div>
      </div>
    </div>
  );
}