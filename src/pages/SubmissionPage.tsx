// ============================================================
// 最终提交与提交码页面
// ============================================================

import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { getSession, markFinalSubmitted, setImportedSubmission } from '../services/storageService';
import { generateSubmissionCode, importSubmissionCode } from '../services/submissionCodeService';
import { PrivacyNotice } from '../components/PrivacyNotice';

export function SubmissionPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [submissionCode, setSubmissionCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

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

  const { localRole, finalSubmitted, importedSubmission, answers } = session;
  const isA = localRole === 'A';
  const expectedImportRole = isA ? 'B' : 'A';

  // 处理最终提交
  const handleFinalSubmit = () => {
    markFinalSubmitted();
    setShowConfirmDialog(false);
  };

  // 生成提交码
  const handleGenerateCode = async () => {
    try {
      const code = await generateSubmissionCode();
      setSubmissionCode(code);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // 导入对方提交码
  const handleImportCode = async () => {
    const result = await importSubmissionCode(importCode.trim(), session.roomCode, expectedImportRole);
    if (result.success) {
      setImportedSubmission({ role: expectedImportRole, submittedAt: result.submittedAt!, verified: true });
      setImportStatus({ success: true, message: `${expectedImportRole} 方回答已成功导入。` });
    } else {
      setImportStatus({ success: false, message: result.error || '提交码无效、已损坏，或不属于当前调解房间。' });
    }
    setImportCode('');
  };

  // 检查是否可以开始 AI 调解
  const canStartAI = isA && finalSubmitted && importedSubmission?.verified && importedSubmission?.role === 'B';

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <div className="max-w-lg w-full mx-auto space-y-6">
        {/* 回答摘要 */}
        {!finalSubmitted && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 space-y-4">
            <h2 className="text-lg font-semibold text-slate-700">你的回答摘要</h2>
            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-500">情绪强度</p>
                <p className="font-medium text-indigo-600">{answers.emotionIntensity}/10 - {answers.emotionWords.join('、')}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-500">矛盾前心情</p>
                <p className="text-slate-700">{answers.preConflictMood}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-500">首个不舒服瞬间</p>
                <p className="text-slate-700">{answers.firstUncomfortableMoment}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-500">事件描述</p>
                <p className="text-slate-700">{answers.eventDescription.slice(0, 100)}{answers.eventDescription.length > 100 ? '...' : ''}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-500">双方不妥行为</p>
                <p className="text-slate-700">{answers.inappropriateBehaviors.slice(0, 80)}{answers.inappropriateBehaviors.length > 80 ? '...' : ''}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-500">底线/原则</p>
                <p className="text-slate-700">{answers.bottomLine}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-500">具体诉求</p>
                <p className="text-slate-700">{answers.specificActions}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-500">让步底线</p>
                <p className="text-slate-700">{answers.compromiseLine}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-500">深层需求</p>
                <p className="text-slate-700">{answers.deepNeeds}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-500">重复矛盾遗留</p>
                <p className="text-slate-700">{answers.repeatedConflict}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-500">过往心结</p>
                <p className="text-slate-700">{answers.emotionalTrigger}</p>
              </div>
            </div>

            <button
              onClick={() => setShowConfirmDialog(true)}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              确认并最终提交
            </button>
            <button
              onClick={() => navigate(`/room/${roomCode}/questions/1`)}
              className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm"
            >
              返回修改
            </button>
          </div>
        )}

        {/* 最终提交确认对话框 */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 text-center">确认提交</h3>
              <p className="text-sm text-slate-500 text-center">
                提交后，本设备中的本次回答将被锁定。只有汇总设备同时获得双方提交后，才能调用 AI。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"
                >
                  返回修改
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  确认提交
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 已提交状态 */}
        {finalSubmitted && !submissionCode && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-green-700">已最终提交</h2>
              <p className="text-sm text-slate-500 mt-1">你的回答已被锁定</p>
            </div>

            <button
              onClick={handleGenerateCode}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              生成交题码
            </button>
          </div>
        )}

        {/* 提交码展示 */}
        {submissionCode && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 space-y-4">
            <h2 className="text-lg font-semibold text-slate-700">你的提交码</h2>
            <div className="bg-slate-50 rounded-xl p-3 font-mono text-xs break-all select-all border border-slate-200">
              {submissionCode}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(submissionCode)}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium"
            >
              复制提交码
            </button>
            {isA ? (
              <p className="text-sm text-slate-500 text-center">
                请先等待 B 方发送提交码，然后导入 B 方提交码后才能开始 AI 调解。
              </p>
            ) : (
              <p className="text-sm text-slate-500 text-center">
                请将这段提交码发送给 A 方。提交码中不包含你的 API Key。
              </p>
            )}
          </div>
        )}

        {/* 导入对方提交码 (A 方) */}
        {isA && finalSubmitted && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-pink-100 space-y-4">
            <h2 className="text-lg font-semibold text-slate-700">导入 B 方提交码</h2>
            {!importedSubmission?.verified ? (
              <>
                <textarea
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="粘贴 B 方的提交码..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none font-mono text-xs"
                />
                {importStatus && (
                  <p className={`text-sm text-center ${importStatus.success ? 'text-green-600' : 'text-red-500'}`}>
                    {importStatus.message}
                  </p>
                )}
                <button
                  onClick={handleImportCode}
                  className="w-full py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 font-medium"
                >
                  验证并导入
                </button>
              </>
            ) : (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center space-y-2">
                <p className="text-green-700 font-medium">B 方提交已验证</p>
                <p className="text-sm text-green-600">B 方提交时间：{new Date(importedSubmission.submittedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {/* 开始 AI 调解按钮 */}
        {canStartAI && (
          <button
            onClick={() => navigate(`/room/${roomCode}/ai-settings`)}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded-xl hover:from-indigo-700 hover:to-pink-600 transition-all font-semibold text-lg shadow-lg"
          >
            双方均已提交，开始 AI 调解
          </button>
        )}

        {/* B 方等待提示 */}
        {!isA && finalSubmitted && (
          <div className="bg-slate-50 rounded-xl p-4 text-center text-sm text-slate-500">
            <p>等待 A 方完成 AI 调解后，你将收到调解结果码。</p>
            <p className="mt-2">请将你的提交码发送给 A 方。</p>
          </div>
        )}

        <PrivacyNotice />
      </div>
    </div>
  );
}