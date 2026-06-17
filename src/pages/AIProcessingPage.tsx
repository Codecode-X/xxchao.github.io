// ============================================================
// AI 处理中 + 结果 + 追问 + 反馈 + 共识 + 和解
// ============================================================

import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  getSession,
  setMediationResult,
  setFollowUpQuestion,
  setFollowUpAnswer,
  setImportedFollowUp,
  setConsensusChoice,
  setImportedConsensus,
  getAISettingsFromSession,
} from '../services/storageService';
import { callDiagnosisAPI, callMediationAPI } from '../services/aiClient';
import { generateResultCode, importResultCode } from '../services/resultCodeService';
import { generateFeedbackCode, importFeedbackCode } from '../services/feedbackCodeService';
import {
  serializeFollowUpRequestCode,
  deserializeFollowUpRequestCode,
  serializeFollowUpSubmissionCode,
  deserializeFollowUpSubmissionCode,
  serializeConsensusCode,
  deserializeConsensusCode,
} from '../services/payloadSerializer';
import {
  validateFollowUpRequestPayload,
  validateFollowUpSubmissionPayload,
  validateConsensusPayload,
} from '../services/payloadValidator';
import type {
  SubmissionPayload,
  DiagnosisResult,
  MediationResult,
  FeedbackChoice,
  ConsensusChoice,
  FollowUpRequestPayload,
  FollowUpSubmissionPayload,
  ConsensusPayload,
} from '../types';

// ============================================================
// AI 处理中
// ============================================================
export function AIProcessingPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const settings = getAISettingsFromSession();

  const [status, setStatus] = useState<'diagnosing' | 'mediating' | 'done' | 'follow-up' | 'error'>('diagnosing');
  const [error, setError] = useState('');
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [partyAData, setPartyAData] = useState<SubmissionPayload | null>(null);
  const [partyBData, setPartyBData] = useState<SubmissionPayload | null>(null);

  useEffect(() => {
    if (!session || !settings) {
      setError('缺少会话或 AI 配置');
      setStatus('error');
      return;
    }

    const storedA = sessionStorage.getItem('xixiao_party_a_data');
    const storedB = sessionStorage.getItem('xixiao_party_b_data');

    if (!storedA || !storedB) {
      setError('无法获取双方数据，请返回重新导入提交码');
      setStatus('error');
      return;
    }

    const aData = JSON.parse(storedA) as SubmissionPayload;
    const bData = JSON.parse(storedB) as SubmissionPayload;
    setPartyAData(aData);
    setPartyBData(bData);

    runDiagnosis(aData, bData);
  }, []);

  const runDiagnosis = async (aData: SubmissionPayload, bData: SubmissionPayload) => {
    setStatus('diagnosing');
    const result = await callDiagnosisAPI(settings!, aData, bData, session!.mediationStyle || '温柔共情型');

    if (!result.success) {
      setError(result.error || 'AI 诊断失败');
      setStatus('error');
      return;
    }

    setDiagnosis(result.result!);

    if (result.result!.needFollowUp && result.result!.followUpQuestion) {
      setFollowUpQuestion(result.result!.followUpQuestion);
      sessionStorage.setItem('xixiao_diagnosis', JSON.stringify(result.result));
      setStatus('follow-up');
    } else {
      sessionStorage.setItem('xixiao_diagnosis', JSON.stringify(result.result));
      runMediation(aData, bData, result.result!);
    }
  };

  const runMediation = async (
    aData: SubmissionPayload,
    bData: SubmissionPayload,
    diag: DiagnosisResult,
    followUpAnswers?: { A?: string; B?: string }
  ) => {
    setStatus('mediating');
    const result = await callMediationAPI(
      settings!,
      aData,
      bData,
      diag,
      session!.mediationStyle || '温柔共情型',
      followUpAnswers
    );

    if (!result.success) {
      setError(result.error || 'AI 调解失败');
      setStatus('error');
      return;
    }

    const mediationResult: MediationResult = {
      version: 1,
      emotionalConsensus: result.result!.emotionalConsensus,
      messageToPartyA: result.result!.messageToPartyA,
      messageToPartyB: result.result!.messageToPartyB,
      potentialConsensus: result.result!.potentialConsensus,
      jointActions: result.result!.jointActions,
    };

    setMediationResult(mediationResult);
    sessionStorage.setItem('xixiao_mediation_result', JSON.stringify(mediationResult));
    setStatus('done');
  };

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

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <div className="max-w-lg w-full mx-auto space-y-6">
        {status === 'diagnosing' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100 text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.36-.573l-1.12 1.32" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-700">AI 正在分析双方信息</h2>
            <p className="text-sm text-slate-500">请耐心等待，正在生成冲突诊断...</p>
          </div>
        )}

        {status === 'mediating' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100 text-center space-y-4">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-700">AI 正在生成调解方案</h2>
            <p className="text-sm text-slate-500">请耐心等待...</p>
          </div>
        )}

        {status === 'follow-up' && diagnosis && partyAData && partyBData && (
          <FollowUpSection
            followUpQuestion={diagnosis.followUpQuestion!}
            roomCode={session.roomCode}
            roomSecret={session.roomSecret}
            onBothAnswersCollected={(answers) => {
              runMediation(partyAData, partyBData, diagnosis, answers);
            }}
          />
        )}

        {status === 'done' && (
          <ResultSection roomCode={session.roomCode} localRole={session.localRole} />
        )}

        {status === 'error' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-100 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-700">处理失败</h2>
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => navigate(`/room/${roomCode}/ai-settings`)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
            >
              返回设置
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 追问组件
// ============================================================
function FollowUpSection({
  followUpQuestion,
  roomCode,
  roomSecret,
  onBothAnswersCollected,
}: {
  followUpQuestion: string;
  roomCode: string;
  roomSecret: string;
  onBothAnswersCollected: (answers: { A?: string; B?: string }) => void;
}) {
  const [partyAAnswer, setPartyAAnswer] = useState('');
  const [followUpRequestCode, setFollowUpRequestCode] = useState('');
  const [importFollowUpCode, setImportFollowUpCode] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [partyBAnswer, setPartyBAnswer] = useState<string | null>(null);

  const generateRequestCode = async () => {
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const payload: FollowUpRequestPayload = {
      schemaVersion: 1,
      roomCode,
      followUpQuestion,
      generatedAt: new Date().toISOString(),
      nonce,
    };

    const code = await serializeFollowUpRequestCode(payload, roomSecret);
    setFollowUpRequestCode(code);
  };

  const handleImportFollowUp = async () => {
    try {
      const payload = await deserializeFollowUpSubmissionCode(importFollowUpCode.trim(), roomSecret);
      const validation = validateFollowUpSubmissionPayload(payload, roomCode);
      if (!validation.valid) {
        setImportStatus({ success: false, message: validation.error || '追问提交码无效' });
        return;
      }
      if (payload.role !== 'B') {
        setImportStatus({ success: false, message: '追问提交码角色不匹配' });
        return;
      }
      setPartyBAnswer(payload.followUpAnswer);
      setImportedFollowUp({ role: 'B', submittedAt: payload.generatedAt, verified: true });
      setImportStatus({ success: true, message: 'B 方追问回答已成功导入' });
    } catch {
      setImportStatus({ success: false, message: '追问提交码无效或已损坏' });
    }
  };

  const handleContinue = () => {
    setFollowUpAnswer('A', partyAAnswer);
    onBothAnswersCollected({ A: partyAAnswer, B: partyBAnswer || undefined });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-amber-700">AI 补充追问</h2>
          <p className="text-sm text-slate-500 mt-1">AI 需要更多信息才能做出更好的判断</p>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <p className="text-slate-700">{followUpQuestion}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600">你的回答</label>
          <textarea
            value={partyAAnswer}
            onChange={(e) => setPartyAAnswer(e.target.value)}
            rows={3}
            placeholder="请回答追问..."
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-300 focus:border-amber-300 outline-none mt-1"
          />
        </div>

        {!followUpRequestCode && (
          <button
            onClick={generateRequestCode}
            className="w-full py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-medium"
          >
            生成追问请求码
          </button>
        )}

        {followUpRequestCode && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">将此追问请求码发送给 B 方，B 方填写追问后会将追问提交码返回给你。</p>
            <div className="bg-slate-50 rounded-xl p-3 font-mono text-xs break-all select-all border border-slate-200">
              {followUpRequestCode}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(followUpRequestCode)}
              className="w-full py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 text-sm"
            >
              复制追问请求码
            </button>
          </div>
        )}

        {!partyBAnswer && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-600">导入 B 方追问提交码</label>
            <textarea
              value={importFollowUpCode}
              onChange={(e) => setImportFollowUpCode(e.target.value)}
              placeholder="粘贴 B 方的追问提交码..."
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-mono text-xs"
            />
            {importStatus && (
              <p className={`text-sm ${importStatus.success ? 'text-green-600' : 'text-red-500'}`}>
                {importStatus.message}
              </p>
            )}
            <button
              onClick={handleImportFollowUp}
              className="w-full py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 font-medium"
            >
              验证并导入
            </button>
          </div>
        )}

        {partyBAnswer && (
          <div className="bg-green-50 rounded-xl p-3 text-center border border-green-200">
            <p className="text-green-600 font-medium">B 方追问已导入</p>
          </div>
        )}

        {partyAAnswer.trim() && partyBAnswer && (
          <button
            onClick={handleContinue}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium"
          >
            继续生成调解方案
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 结果展示组件（A 方）
// ============================================================
function ResultSection({
  roomCode,
  localRole,
}: {
  roomCode: string;
  localRole: 'A' | 'B';
}) {
  const session = getSession();
  const result = session?.mediationResult;
  const [resultCode, setResultCode] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  let currentResult: MediationResult;
  if (result) {
    currentResult = result;
  } else {
    const stored = sessionStorage.getItem('xixiao_mediation_result');
    if (!stored) {
      return <div className="text-center text-slate-500">加载结果中...</div>;
    }
    currentResult = JSON.parse(stored) as MediationResult;
  }

  const handleGenerateResultCode = async () => {
    try {
      const code = await generateResultCode(currentResult);
      setResultCode(code);
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const displayResult = localRole === 'A' ? {
    emotionalConsensus: currentResult.emotionalConsensus,
    messageToMe: currentResult.messageToPartyA,
    potentialConsensus: currentResult.potentialConsensus,
    jointActions: currentResult.jointActions,
  } : {
    emotionalConsensus: currentResult.emotionalConsensus,
    messageToMe: currentResult.messageToPartyB,
    potentialConsensus: currentResult.potentialConsensus,
    jointActions: currentResult.jointActions,
  };

  return (
    <div className="space-y-6">
      {/* 结果展示 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-indigo-700">第 {currentResult.version} 轮调解</h2>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
          <h3 className="text-sm font-medium text-indigo-600 mb-2">你们现在可能都在经历什么</h3>
          <p className="text-slate-700 leading-relaxed">{displayResult.emotionalConsensus}</p>
        </div>

        <div className={`rounded-xl p-4 border ${localRole === 'A' ? 'bg-pink-50 border-pink-200' : 'bg-purple-50 border-purple-200'}`}>
          <h3 className={`text-sm font-medium mb-2 ${localRole === 'A' ? 'text-pink-600' : 'text-purple-600'}`}>
            想对 {localRole} 方说的话
          </h3>
          <p className="text-slate-700 leading-relaxed">{displayResult.messageToMe}</p>
        </div>

        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <h3 className="text-sm font-medium text-green-600 mb-2">你们其实已经存在的共识</h3>
          <p className="text-slate-700 leading-relaxed">{displayResult.potentialConsensus}</p>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <h3 className="text-sm font-medium text-amber-600 mb-2">现在可以一起做什么</h3>
          <div className="space-y-3">
            {displayResult.jointActions.map((action, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-amber-100">
                <p className="font-medium text-slate-700">{i + 1}. {action.title}</p>
                <p className="text-sm text-slate-600 mt-1">{action.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* A 方：生成结果码 */}
      {localRole === 'A' && !resultCode && (
        <button
          onClick={handleGenerateResultCode}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium"
        >
          生成调解结果码
        </button>
      )}

      {resultCode && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 space-y-3">
          <h3 className="font-semibold text-slate-700">调解结果码</h3>
          <div className="bg-slate-50 rounded-xl p-3 font-mono text-xs break-all select-all border border-slate-200">
            {resultCode}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(resultCode)}
            className="w-full py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm"
          >
            复制调解结果码
          </button>
          <p className="text-sm text-slate-500 text-center">
            请将此结果码发送给 B 方，B 方可以查看写给 B 方的内容。
          </p>
        </div>
      )}

      {/* 反馈区域 */}
      {!showFeedback && (
        <button
          onClick={() => setShowFeedback(true)}
          className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-medium"
        >
          对调解结果提供反馈
        </button>
      )}

      {showFeedback && localRole === 'A' && (
        <FeedbackSectionA roomCode={roomCode} currentResult={currentResult} />
      )}

      {/* 共识区域 */}
      {localRole === 'A' && (
        <ConsensusSectionA roomCode={roomCode} currentResult={currentResult} />
      )}
    </div>
  );
}

// ============================================================
// A 方反馈组件
// ============================================================
function FeedbackSectionA({
  roomCode,
  currentResult,
}: {
  roomCode: string;
  currentResult: MediationResult;
}) {
  const navigate = useNavigate();
  const [feedbackChoice, setFeedbackChoice] = useState<FeedbackChoice>('接受');
  const [inconsistentPoint, setInconsistentPoint] = useState('');
  const [missingInfo, setMissingInfo] = useState('');
  const [feedbackCode, setFeedbackCode] = useState('');
  const [importFeedback, setImportFeedback] = useState('');
  const [importFeedbackStatus, setImportFeedbackStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [canReMediate, setCanReMediate] = useState(false);

  const handleGenerateFeedbackCode = async () => {
    try {
      const code = await generateFeedbackCode(
        'A',
        currentResult.version,
        feedbackChoice,
        inconsistentPoint || undefined,
        missingInfo || undefined
      );
      setFeedbackCode(code);
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const handleImportFeedbackCode = async () => {
    const res = await importFeedbackCode(importFeedback.trim(), roomCode);
    if (res.success) {
      setImportFeedbackStatus({ success: true, message: '对方反馈已成功导入' });
      setCanReMediate(true);
    } else {
      setImportFeedbackStatus({ success: false, message: res.error || '反馈码无效' });
    }
  };

  const handleReMediate = () => {
    if (currentResult.version >= 3) {
      alert('已达到最多3轮调解上限');
      return;
    }
    navigate(`/room/${roomCode}/ai-settings`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 space-y-4">
      <h3 className="text-lg font-semibold text-slate-700">反馈（第 {currentResult.version} 轮）</h3>
      {currentResult.version >= 3 && (
        <p className="text-sm text-amber-600">已达到最多 3 轮调解上限</p>
      )}

      <div className="flex gap-2">
        {(['接受', '部分接受', '不接受'] as FeedbackChoice[]).map((opt) => (
          <button
            key={opt}
            onClick={() => setFeedbackChoice(opt)}
            className={`flex-1 py-2 rounded-xl text-sm ${
              feedbackChoice === opt ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {feedbackChoice !== '接受' && (
        <>
          <div>
            <label className="text-sm font-medium text-slate-600">调解内容中，哪一点与你的真实想法不一致？</label>
            <textarea value={inconsistentPoint} onChange={(e) => setInconsistentPoint(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">还有什么重要信息没有被考虑到？</label>
            <textarea value={missingInfo} onChange={(e) => setMissingInfo(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl mt-1" />
          </div>
        </>
      )}

      {!feedbackCode && (
        <button onClick={handleGenerateFeedbackCode} className="w-full py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-medium">
          生成反馈码
        </button>
      )}

      {feedbackCode && (
        <div className="space-y-2">
          <p className="text-sm text-slate-500">请将反馈码发送给对方。</p>
          <div className="bg-slate-50 rounded-xl p-3 font-mono text-xs break-all select-all border border-slate-200">
            {feedbackCode}
          </div>
          <button onClick={() => navigator.clipboard.writeText(feedbackCode)} className="w-full py-2 bg-amber-100 text-amber-700 rounded-lg text-sm">
            复制反馈码
          </button>
        </div>
      )}

      {/* 导入 B 方反馈码 */}
      {!canReMediate && currentResult.version < 3 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">导入对方反馈码</label>
          <textarea
            value={importFeedback}
            onChange={(e) => setImportFeedback(e.target.value)}
            placeholder="粘贴对方的反馈码..."
            rows={3}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-mono text-xs"
          />
          {importFeedbackStatus && (
            <p className={`text-sm ${importFeedbackStatus.success ? 'text-green-600' : 'text-red-500'}`}>
              {importFeedbackStatus.message}
            </p>
          )}
          <button onClick={handleImportFeedbackCode} className="w-full py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 font-medium">
            验证并导入
          </button>
        </div>
      )}

      {canReMediate && currentResult.version < 3 && (
        <button onClick={handleReMediate} className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium">
          基于反馈优化调解方案
        </button>
      )}
    </div>
  );
}

// ============================================================
// A 方共识组件
// ============================================================
function ConsensusSectionA({
  roomCode,
  currentResult,
}: {
  roomCode: string;
  currentResult: MediationResult;
}) {
  const session = getSession();
  const [consensusChoice, setConsensus] = useState<ConsensusChoice>('我愿意达成共识');
  const [localConfirmed, setLocalConfirmed] = useState(false);
  const [consensusCode, setConsensusCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showReconciliation, setShowReconciliation] = useState(false);

  const handleGenerateConsensusCode = async () => {
    try {
      const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const payload: ConsensusPayload = {
        schemaVersion: 1,
        roomCode,
        role: 'A',
        choice: consensusChoice,
        generatedAt: new Date().toISOString(),
        nonce,
      };

      const code = await serializeConsensusCode(payload, session!.roomSecret);
      setConsensusCode(code);
      setConsensusChoice(consensusChoice);
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const handleImportConsensus = async () => {
    try {
      const payload = await deserializeConsensusCode(importCode.trim(), session!.roomSecret);
      const validation = validateConsensusPayload(payload, roomCode);
      if (!validation.valid) {
        setImportStatus({ success: false, message: validation.error || '共识确认码无效' });
        return;
      }
      setImportedConsensus({ role: payload.role as 'A' | 'B', choice: payload.choice, verified: true });
      setImportStatus({ success: true, message: '对方共识已导入' });

      if (consensusChoice === '我愿意达成共识' && payload.choice === '我愿意达成共识') {
        setShowReconciliation(true);
      }
    } catch {
      setImportStatus({ success: false, message: '共识确认码无效或已损坏' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 space-y-4">
        <h3 className="text-lg font-semibold text-slate-700">达成共识</h3>

        {!localConfirmed && (
          <div className="flex gap-3">
            <button
              onClick={() => { setConsensus('我愿意达成共识'); setLocalConfirmed(true); }}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium"
            >
              我愿意达成共识
            </button>
            <button
              onClick={() => { setConsensus('我还需要调整'); setLocalConfirmed(true); }}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-medium"
            >
              我还需要调整
            </button>
          </div>
        )}

        {localConfirmed && !consensusCode && (
          <button onClick={handleGenerateConsensusCode} className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium">
            生成共识确认码
          </button>
        )}

        {consensusCode && (
          <div className="space-y-2">
            <p className="text-sm text-slate-500">请将共识确认码发送给对方。</p>
            <div className="bg-slate-50 rounded-xl p-3 font-mono text-xs break-all select-all border border-slate-200">
              {consensusCode}
            </div>
            <button onClick={() => navigator.clipboard.writeText(consensusCode)} className="w-full py-2 bg-green-100 text-green-700 rounded-lg text-sm">
              复制共识确认码
            </button>
          </div>
        )}

        {localConfirmed && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">导入对方共识确认码</label>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="粘贴对方的共识确认码..."
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-mono text-xs"
            />
            {importStatus && (
              <p className={`text-sm ${importStatus.success ? 'text-green-600' : 'text-red-500'}`}>
                {importStatus.message}
              </p>
            )}
            <button onClick={handleImportConsensus} className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium">
              验证并导入
            </button>
          </div>
        )}
      </div>

      {showReconciliation && (
        <ReconciliationMemo
          emotionalConsensus={currentResult.emotionalConsensus}
          potentialConsensus={currentResult.potentialConsensus}
          jointActions={currentResult.jointActions}
        />
      )}
    </div>
  );
}

// ============================================================
// 和解备忘
// ============================================================
function ReconciliationMemo({
  emotionalConsensus,
  potentialConsensus,
  jointActions,
}: {
  emotionalConsensus: string;
  potentialConsensus: string;
  jointActions: Array<{ title: string; description: string }>;
}) {
  const memoText = `息小吵 · 和解备忘

本次矛盾：
${emotionalConsensus}

我们共同希望：
${potentialConsensus}

接下来我们愿意尝试：
${jointActions.map((a, i) => `${i + 1}. ${a.title}：${a.description}`).join('\n')}

记录日期：
${new Date().toLocaleDateString('zh-CN')}

愿这次沟通不是争论的结束，而是彼此重新听见的开始。`;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-green-700">这次小吵，先在这里停下来</h2>
        <p className="text-sm text-slate-500 mt-2">
          你们不一定已经解决了所有分歧，但已经共同确认了下一步可以尝试的行动。
        </p>
      </div>

      <div className="bg-green-50 rounded-xl p-5 border border-green-200 whitespace-pre-line text-slate-700 leading-relaxed">
        {memoText}
      </div>

      <button
        onClick={() => navigator.clipboard.writeText(memoText)}
        className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium"
      >
        复制和解备忘
      </button>
    </div>
  );
}

// ============================================================
// 调解终止页面
// ============================================================
export function TerminatedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-red-100 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-red-700">调解已终止</h2>
        <p className="text-sm text-red-500">
          由于连续多次输入辱骂或人身攻击内容，系统暂时无法形成有效的调解方案。
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('xixiao_chao_session');
            navigate('/');
          }}
          className="px-6 py-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}

// ============================================================
// B 方追问页
// ============================================================
export function BFollowUpPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const [requestCode, setRequestCode] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [submissionCode, setSubmissionCode] = useState('');

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

  const handleImportRequest = async () => {
    try {
      const payload = await deserializeFollowUpRequestCode(requestCode.trim(), session.roomSecret);
      const validation = validateFollowUpRequestPayload(payload, roomCode!);
      if (!validation.valid) {
        alert('追问请求码无效');
        return;
      }
      setFollowUpQuestion(payload.followUpQuestion);
    } catch {
      alert('追问请求码无效或已损坏');
    }
  };

  const handleGenerateSubmission = async () => {
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const payload: FollowUpSubmissionPayload = {
      schemaVersion: 1,
      roomCode: roomCode!,
      role: 'B',
      followUpAnswer: answer,
      generatedAt: new Date().toISOString(),
      nonce,
    };

    const code = await serializeFollowUpSubmissionCode(payload, session.roomSecret);
    setSubmissionCode(code);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <div className="max-w-lg w-full mx-auto space-y-6">
        {!followUpQuestion && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 space-y-4">
            <h2 className="text-lg font-semibold text-slate-700">导入追问请求码</h2>
            <p className="text-sm text-slate-500">请粘贴 A 方发送的追问请求码</p>
            <textarea
              value={requestCode}
              onChange={(e) => setRequestCode(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-mono text-xs"
            />
            <button
              onClick={handleImportRequest}
              className="w-full py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-medium"
            >
              导入并查看追问
            </button>
          </div>
        )}

        {followUpQuestion && !submissionCode && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 space-y-4">
            <h2 className="text-lg font-semibold text-amber-700">AI 追问</h2>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-slate-700">{followUpQuestion}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">你的回答</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl mt-1"
              />
            </div>
            <button
              onClick={handleGenerateSubmission}
              disabled={!answer.trim()}
              className={`w-full py-3 rounded-xl font-medium ${
                answer.trim()
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              生成追问提交码
            </button>
          </div>
        )}

        {submissionCode && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 space-y-3">
            <h3 className="font-semibold text-slate-700">追问提交码</h3>
            <p className="text-sm text-slate-500">请将此提交码发送给 A 方</p>
            <div className="bg-slate-50 rounded-xl p-3 font-mono text-xs break-all select-all border border-slate-200">
              {submissionCode}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(submissionCode)}
              className="w-full py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm"
            >
              复制追问提交码
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// B 方结果查看页
// ============================================================
export function BResultPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const [importCode, setImportCode] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [result, setResult] = useState<MediationResult | null>(session?.mediationResult || null);

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

  const handleImport = async () => {
    const res = await importResultCode(importCode.trim(), roomCode!);
    if (res.success && res.result) {
      setMediationResult(res.result);
      setResult(res.result);
      setImportStatus({ success: true, message: '调解结果已成功导入' });
    } else {
      setImportStatus({ success: false, message: res.error || '结果码无效' });
    }
  };

  // B 方反馈和共识
  const [feedbackChoice, setFeedbackChoice] = useState<FeedbackChoice>('接受');
  const [inconsistentPoint, setInconsistentPoint] = useState('');
  const [missingInfo, setMissingInfo] = useState('');
  const [feedbackCode, setFeedbackCode] = useState('');
  const [consensusChoice, setConsensusChoice] = useState<ConsensusChoice>('我愿意达成共识');
  const [consensusCode, setConsensusCode] = useState('');
  const [consensusConfirmed, setConsensusConfirmed] = useState(false);

  const handleGenerateFeedbackCode = async () => {
    try {
      const code = await generateFeedbackCode(
        'B',
        result!.version,
        feedbackChoice,
        inconsistentPoint || undefined,
        missingInfo || undefined
      );
      setFeedbackCode(code);
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const handleGenerateConsensusCode = async () => {
    try {
      const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const payload: ConsensusPayload = {
        schemaVersion: 1,
        roomCode: roomCode!,
        role: 'B',
        choice: consensusChoice,
        generatedAt: new Date().toISOString(),
        nonce,
      };
      const code = await serializeConsensusCode(payload, session.roomSecret);
      setConsensusCode(code);
      setConsensusChoice(consensusChoice);
      setConsensusConfirmed(true);
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <div className="max-w-lg w-full mx-auto space-y-6">
        {/* 导入结果码 */}
        {!result && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-pink-100 space-y-4">
            <h2 className="text-lg font-semibold text-slate-700">导入调解结果码</h2>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="粘贴 A 方生成的调解结果码..."
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-mono text-xs"
            />
            {importStatus && (
              <p className={`text-sm ${importStatus.success ? 'text-green-600' : 'text-red-500'}`}>
                {importStatus.message}
              </p>
            )}
            <button
              onClick={handleImport}
              className="w-full py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 font-medium"
            >
              导入调解结果码
            </button>
          </div>
        )}

        {/* 结果展示 */}
        {result && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 space-y-5">
              <h2 className="text-xl font-semibold text-indigo-700 text-center">调解结果</h2>

              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <h3 className="text-sm font-medium text-indigo-600 mb-2">你们现在可能都在经历什么</h3>
                <p className="text-slate-700 leading-relaxed">{result.emotionalConsensus}</p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h3 className="text-sm font-medium text-purple-600 mb-2">想对 B 方说的话</h3>
                <p className="text-slate-700 leading-relaxed">{result.messageToPartyB}</p>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h3 className="text-sm font-medium text-green-600 mb-2">你们其实已经存在的共识</h3>
                <p className="text-slate-700 leading-relaxed">{result.potentialConsensus}</p>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h3 className="text-sm font-medium text-amber-600 mb-2">现在可以一起做什么</h3>
                <div className="space-y-3">
                  {result.jointActions.map((action, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-amber-100">
                      <p className="font-medium text-slate-700">{i + 1}. {action.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{action.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 反馈 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 space-y-4">
              <h3 className="text-lg font-semibold text-slate-700">反馈</h3>
              <div className="flex gap-2">
                {(['接受', '部分接受', '不接受'] as FeedbackChoice[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setFeedbackChoice(opt)}
                    className={`flex-1 py-2 rounded-xl text-sm ${
                      feedbackChoice === opt ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {feedbackChoice !== '接受' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-600">哪一点与你的真实想法不一致？</label>
                    <textarea value={inconsistentPoint} onChange={(e) => setInconsistentPoint(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">还有什么重要信息没有被考虑到？</label>
                    <textarea value={missingInfo} onChange={(e) => setMissingInfo(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl mt-1" />
                  </div>
                </>
              )}

              {!feedbackCode && (
                <button onClick={handleGenerateFeedbackCode} className="w-full py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-medium">
                  生成反馈码
                </button>
              )}

              {feedbackCode && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">请将反馈码发送给 A 方。</p>
                  <div className="bg-slate-50 rounded-xl p-3 font-mono text-xs break-all select-all border border-slate-200">
                    {feedbackCode}
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(feedbackCode)} className="w-full py-2 bg-amber-100 text-amber-700 rounded-lg text-sm">
                    复制反馈码
                  </button>
                </div>
              )}
            </div>

            {/* 共识 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 space-y-4">
              <h3 className="text-lg font-semibold text-slate-700">达成共识</h3>

              {!consensusConfirmed && (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setConsensusChoice('我愿意达成共识'); }}
                    className={`flex-1 py-3 rounded-xl font-medium ${
                      consensusChoice === '我愿意达成共识'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    我愿意达成共识
                  </button>
                  <button
                    onClick={() => { setConsensusChoice('我还需要调整'); }}
                    className={`flex-1 py-3 rounded-xl font-medium ${
                      consensusChoice === '我还需要调整'
                        ? 'bg-slate-400 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    我还需要调整
                  </button>
                </div>
              )}

              {!consensusCode && consensusConfirmed && (
                <button onClick={handleGenerateConsensusCode} className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium">
                  生成共识确认码
                </button>
              )}

              {!consensusCode && !consensusConfirmed && (
                <button onClick={() => { setConsensusConfirmed(true); }} className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium">
                  确认并生成共识确认码
                </button>
              )}

              {consensusCode && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">请将共识确认码发送给 A 方。</p>
                  <div className="bg-slate-50 rounded-xl p-3 font-mono text-xs break-all select-all border border-slate-200">
                    {consensusCode}
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(consensusCode)} className="w-full py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                    复制共识确认码
                  </button>
                </div>
              )}

              {consensusChoice === '我愿意达成共识' && consensusCode && (
                <div className="bg-slate-50 rounded-xl p-4 text-center text-sm text-slate-500">
                  <p>当 A 方也确认愿意达成共识后，A 方会生成和解备忘并分享给你。</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}