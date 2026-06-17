// ============================================================
// 四轮结构化问题页面
// ============================================================

import { useNavigate, useParams } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { getSession, updateAnswers, incrementWarningCount } from '../services/storageService';
import { detectAggressiveContent } from '../services/moderationService';
import { RoundProgress } from '../components/RoundProgress';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { ContentWarningDialog } from '../components/ContentWarningDialog';

const ROUND_LABELS = ['情绪锚定', '事件还原', '诉求表达', '深层需求'];
const DEEP_NEED_REF_WORDS = ['被重视', '被理解', '安全感', '尊重', '信任', '陪伴', '公平', '边界感', '确定感', '被认可'];

export function QuestionsPage() {
  const { roomCode, round } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const currentRound = parseInt(round || '1');

  const [emotionIntensity, setEmotionIntensity] = useState(session?.answers.emotionIntensity || 5);
  const [emotionWords, setEmotionWords] = useState(session?.answers.emotionWords.join(', ') || '');
  const [eventDescription, setEventDescription] = useState(session?.answers.eventDescription || '');
  const [explicitRequests, setExplicitRequests] = useState(session?.answers.explicitRequests || '');
  const [deepNeeds, setDeepNeeds] = useState(session?.answers.deepNeeds || '');

  const [showWarning, setShowWarning] = useState(false);

  const currentSession = getSession();

  useEffect(() => {
    if (currentSession?.mediationTerminated) {
      navigate(`/room/${roomCode}/terminated`);
    }
  }, [currentSession, navigate, roomCode]);

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

  const checkContent = useCallback((text: string) => {
    const result = detectAggressiveContent(text);
    if (result.detected) {
      incrementWarningCount();
      setShowWarning(true);
    }
  }, []);

  const handleVoiceInput = useCallback((text: string) => {
    if (currentRound === 2) {
      setEventDescription(prev => prev ? prev + ' ' + text : text);
      checkContent(text);
    } else if (currentRound === 3) {
      setExplicitRequests(prev => prev ? prev + ' ' + text : text);
      checkContent(text);
    } else if (currentRound === 4) {
      setDeepNeeds(prev => prev ? prev + ' ' + text : text);
      checkContent(text);
    }
  }, [currentRound, checkContent]);

  const handleNext = () => {
    const latestSession = getSession();
    if (currentRound === 1) {
      if (!emotionWords.trim()) return;
      updateAnswers({
        emotionIntensity,
        emotionWords: emotionWords.split(/[,，\s]+/).filter(w => w.trim()),
      });
    } else if (currentRound === 2) {
      if (!eventDescription.trim()) return;
      checkContent(eventDescription);
      if (latestSession?.mediationTerminated) return;
      updateAnswers({ eventDescription });
    } else if (currentRound === 3) {
      if (!explicitRequests.trim()) return;
      checkContent(explicitRequests);
      if (latestSession?.mediationTerminated) return;
      updateAnswers({ explicitRequests });
    } else if (currentRound === 4) {
      if (!deepNeeds.trim()) return;
      checkContent(deepNeeds);
      if (latestSession?.mediationTerminated) return;
      updateAnswers({ deepNeeds });
    }

    if (currentRound < 4) {
      navigate(`/room/${session.roomCode}/questions/${currentRound + 1}`);
    } else {
      navigate(`/room/${session.roomCode}/submit`);
    }
  };

  const handleWarningAcknowledge = () => {
    setShowWarning(false);
    const s = getSession();
    if (s?.mediationTerminated) {
      navigate(`/room/${roomCode}/terminated`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <div className="max-w-lg w-full mx-auto space-y-6">
        {/* 进度条 */}
        <RoundProgress currentRound={currentRound} totalRounds={4} labels={ROUND_LABELS} />

        {/* 问题卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100">
          {/* 第一轮：情绪锚定 */}
          {currentRound === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-700">先感受一下你现在的情绪</h3>
              <p className="text-sm text-slate-500">
                请用 1-10 分标注你现在的情绪激烈程度，并用 1-2 个词描述你当下最强烈的情绪。
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400">平静</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={emotionIntensity}
                    onChange={(e) => setEmotionIntensity(parseInt(e.target.value))}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="text-sm text-slate-400">激烈</span>
                  <span className="text-lg font-bold text-indigo-600 w-8 text-center">{emotionIntensity}</span>
                </div>
                <p className="text-xs text-slate-400">1 表示已经比较平静，10 表示情绪非常激烈。</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">情绪词</label>
                <input
                  type="text"
                  value={emotionWords}
                  onChange={(e) => setEmotionWords(e.target.value)}
                  placeholder="如：委屈、愤怒、失望、心寒"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none mt-1"
                />
              </div>
            </div>
          )}

          {/* 第二轮：事件还原 */}
          {currentRound === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-700">只说发生了什么</h3>
              <p className="text-sm text-slate-500">
                请客观描述这次争吵的起因和经过，只说你看到的事实，不要评价对方的行为和动机。
              </p>
              <p className="text-xs text-slate-400 italic">
                尽量使用"发生了什么""对方说了什么""我做了什么"这样的表达，避免使用"对方就是故意的"等动机判断。
              </p>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-600">事件描述</label>
                <VoiceInputButton onTranscript={handleVoiceInput} />
              </div>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                rows={5}
                placeholder="描述这次争吵的起因和经过..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none"
              />
            </div>
          )}

          {/* 第三轮：诉求表达 */}
          {currentRound === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-700">你希望这件事怎么解决</h3>
              <p className="text-sm text-slate-500">
                你觉得对方怎么做，这件事你才能接受？请说出你最核心的 1-2 个具体要求。
              </p>
              <p className="text-xs text-slate-400 italic">
                请尽量表达具体行为，不要只写"对我好一点"或"改变态度"。
              </p>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-600">诉求</label>
                <VoiceInputButton onTranscript={handleVoiceInput} />
              </div>
              <textarea
                value={explicitRequests}
                onChange={(e) => setExplicitRequests(e.target.value)}
                rows={5}
                placeholder="你最核心的1-2个具体要求..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none"
              />
            </div>
          )}

          {/* 第四轮：深层需求 */}
          {currentRound === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-700">这件事背后，你真正需要什么</h3>
              <p className="text-sm text-slate-500">
                你之所以在意这件事，本质上是希望得到什么？
              </p>
              <div className="flex flex-wrap gap-2">
                {DEEP_NEED_REF_WORDS.map((word) => (
                  <button
                    key={word}
                    onClick={() => setDeepNeeds(prev => prev.includes(word) ? prev : prev ? prev + '、' + word : word)}
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition-colors"
                  >
                    {word}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-600">深层需求</label>
                <VoiceInputButton onTranscript={handleVoiceInput} />
              </div>
              <textarea
                value={deepNeeds}
                onChange={(e) => setDeepNeeds(e.target.value)}
                rows={4}
                placeholder="你真正需要什么..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none"
              />
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          {currentRound > 1 && (
            <button
              onClick={() => navigate(`/room/${session.roomCode}/questions/${currentRound - 1}`)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors font-medium"
            >
              上一轮
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            {currentRound === 4 ? '完成并查看摘要' : '下一轮'}
          </button>
        </div>

        {/* 清除数据 */}
        <div className="text-center">
          <button
            onClick={() => {
              if (window.confirm('确定要清除本次调解数据吗？此操作不可恢复。')) {
                localStorage.removeItem('xixiao_chao_session');
                navigate('/');
              }
            }}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            清除本次调解数据
          </button>
        </div>
      </div>

      {/* 警告对话框 */}
      <ContentWarningDialog
        isOpen={showWarning}
        warningCount={currentSession?.warningCount || 0}
        terminated={currentSession?.mediationTerminated || false}
        onAcknowledge={handleWarningAcknowledge}
      />
    </div>
  );
}