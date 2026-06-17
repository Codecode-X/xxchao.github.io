// ============================================================
// 可选基础信息页
// ============================================================

import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { getSession, updateBasicInfo } from '../services/storageService';
import type { RelationshipDuration, ConflictScene, FirstConflictOption } from '../types';

const DURATION_OPTIONS: RelationshipDuration[] = ['不足3个月', '3个月至1年', '1年至3年', '3年以上', '暂不填写'];
const SCENE_OPTIONS: ConflictScene[] = ['居家', '线上', '外出', '其他', '暂不填写'];
const FIRST_OPTIONS: FirstConflictOption[] = ['是', '否', '不确定', '暂不填写'];

export function BasicInfoPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const [duration, setDuration] = useState<RelationshipDuration>(session?.basicInfo?.relationshipDuration || '暂不填写');
  const [scene, setScene] = useState<ConflictScene>(session?.basicInfo?.conflictScene || '暂不填写');
  const [first, setFirst] = useState<FirstConflictOption>(session?.basicInfo?.isFirstConflictOnTopic || '暂不填写');

  if (!session || session.roomCode !== roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-slate-500">未找到有效会话</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl">返回首页</button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    updateBasicInfo({ relationshipDuration: duration, conflictScene: scene, isFirstConflictOnTopic: first });
    navigate(`/room/${session.roomCode}/questions/1`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 space-y-5">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-700">基础信息</h2>
            <p className="text-sm text-slate-500 mt-1">
              以下信息仅用于让调解建议更贴合你们的情况，不需要填写姓名或任何身份信息。
            </p>
          </div>

          {/* 关系时长 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">关系时长</label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setDuration(opt)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    duration === opt
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 争吵场景 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">争吵场景</label>
            <div className="flex flex-wrap gap-2">
              {SCENE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setScene(opt)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    scene === opt
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 是否首次 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">是否首次因该问题争吵</label>
            <div className="flex flex-wrap gap-2">
              {FIRST_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFirst(opt)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    first === opt
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            继续到问题填写
          </button>
        </div>
      </div>
    </div>
  );
}