// ============================================================
// 五轮结构化问题页面（16题）
// ============================================================

import { useNavigate, useParams } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { getSession, updateAnswers, incrementWarningCount } from '../services/storageService';
import { detectAggressiveContent } from '../services/moderationService';
import { RoundProgress } from '../components/RoundProgress';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { ContentWarningDialog } from '../components/ContentWarningDialog';

const ROUND_LABELS = ['情绪锚定', '客观事件还原', '分歧认知', '表层诉求', '深层需求'];

const DEEP_NEED_REF_WORDS = [
  '陪伴感', '安全感', '被重视', '被理解', '偏爱',
  '边界尊重', '及时回应', '情绪被包容', '计划被看重', '遇事被商量',
];

export function QuestionsPage() {
  const { roomCode, round } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const currentRound = parseInt(round || '1');

  // 一、情绪锚定（Q1-Q3）
  const [emotionIntensity, setEmotionIntensity] = useState(session?.answers.emotionIntensity || 5);
  const [emotionWords, setEmotionWords] = useState(session?.answers.emotionWords.join(', ') || '');
  const [preConflictMood, setPreConflictMood] = useState(session?.answers.preConflictMood || '');
  const [firstUncomfortableMoment, setFirstUncomfortableMoment] = useState(session?.answers.firstUncomfortableMoment || '');

  // 二、客观事件还原（Q4-Q6）
  const [eventDescription, setEventDescription] = useState(session?.answers.eventDescription || '');
  const [inappropriateBehaviors, setInappropriateBehaviors] = useState(session?.answers.inappropriateBehaviors || '');
  const [objectiveVsSubjective, setObjectiveVsSubjective] = useState(session?.answers.objectiveVsSubjective || '');

  // 三、分歧认知（Q7-Q10）
  const [bottomLine, setBottomLine] = useState(session?.answers.bottomLine || '');
  const [originalExpectation, setOriginalExpectation] = useState(session?.answers.originalExpectation || '');
  const [guessOtherPartyCore, setGuessOtherPartyCore] = useState(session?.answers.guessOtherPartyCore || '');
  const [conceptualDifferences, setConceptualDifferences] = useState(session?.answers.conceptualDifferences || '');

  // 四、表层诉求（Q11-Q13）
  const [specificActions, setSpecificActions] = useState(session?.answers.specificActions || '');
  const [compromiseLine, setCompromiseLine] = useState(session?.answers.compromiseLine || '');
  const [preferredCommunicationMode, setPreferredCommunicationMode] = useState(session?.answers.preferredCommunicationMode || '');

  // 五、深层需求（Q14-Q16）
  const [deepNeeds, setDeepNeeds] = useState(session?.answers.deepNeeds || '');
  const [repeatedConflict, setRepeatedConflict] = useState(session?.answers.repeatedConflict || '');
  const [emotionalTrigger, setEmotionalTrigger] = useState(session?.answers.emotionalTrigger || '');

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
      setBottomLine(prev => prev ? prev + ' ' + text : text);
      checkContent(text);
    } else if (currentRound === 4) {
      setSpecificActions(prev => prev ? prev + ' ' + text : text);
      checkContent(text);
    } else if (currentRound === 5) {
      setDeepNeeds(prev => prev ? prev + ' ' + text : text);
      checkContent(text);
    }
  }, [currentRound, checkContent]);

  const handleNext = () => {
    const latestSession = getSession();
    if (latestSession?.mediationTerminated) return;

    if (currentRound === 1) {
      if (!emotionWords.trim()) return;
      updateAnswers({
        emotionIntensity,
        emotionWords: emotionWords.split(/[,，\s]+/).filter(w => w.trim()),
        preConflictMood,
        firstUncomfortableMoment,
      });
    } else if (currentRound === 2) {
      if (!eventDescription.trim()) return;
      checkContent(eventDescription);
      const s = getSession();
      if (s?.mediationTerminated) return;
      updateAnswers({ eventDescription, inappropriateBehaviors, objectiveVsSubjective });
    } else if (currentRound === 3) {
      if (!bottomLine.trim()) return;
      updateAnswers({ bottomLine, originalExpectation, guessOtherPartyCore, conceptualDifferences });
    } else if (currentRound === 4) {
      if (!specificActions.trim()) return;
      checkContent(specificActions);
      const s = getSession();
      if (s?.mediationTerminated) return;
      updateAnswers({ specificActions, compromiseLine, preferredCommunicationMode });
    } else if (currentRound === 5) {
      if (!deepNeeds.trim()) return;
      updateAnswers({ deepNeeds, repeatedConflict, emotionalTrigger });
    }

    if (currentRound < 5) {
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
        <RoundProgress currentRound={currentRound} totalRounds={5} labels={ROUND_LABELS} />

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100">

          {/* ====== 第一轮：情绪锚定 ====== */}
          {currentRound === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-indigo-700">先感受一下你现在的情绪</h3>

              {/* Q1 */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">
                  Q1 此刻你的情绪激烈程度（1-10分），并用1-2个精准词汇标注情绪
                </label>
                <p className="text-xs text-slate-400">
                  如：委屈、烦躁、落空、疲惫、吃醋、生气、难过、焦虑。禁止写"生气他不讲理"这类带指责的话。
                </p>
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
                  <span className="text-sm text-slate-400">暴怒</span>
                  <span className="text-lg font-bold text-indigo-600 w-8 text-center">{emotionIntensity}</span>
                </div>
                <input
                  type="text"
                  value={emotionWords}
                  onChange={(e) => setEmotionWords(e.target.value)}
                  placeholder="如：委屈、烦躁"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>

              {/* Q2 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Q2 本次矛盾爆发前，你原本处于怎样的心情状态？
                </label>
                <p className="text-xs text-slate-400">
                  如：放松/忙碌疲惫/心烦/期待见面/疲惫赶路/烦躁熬夜等客观状态
                </p>
                <input
                  type="text"
                  value={preConflictMood}
                  onChange={(e) => setPreConflictMood(e.target.value)}
                  placeholder="如：忙碌疲惫、期待见面"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>

              {/* Q3 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Q3 矛盾刚发生时，最先让你心里不舒服的第一个瞬间是什么？
                </label>
                <p className="text-xs text-slate-400">
                  只写对方的哪一句话/哪一个动作，不加评价
                </p>
                <input
                  type="text"
                  value={firstUncomfortableMoment}
                  onChange={(e) => setFirstUncomfortableMoment(e.target.value)}
                  placeholder="如：对方说了'你先回去吧'"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>
            </div>
          )}

          {/* ====== 第二轮：客观事件还原 ====== */}
          {currentRound === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-indigo-700">只说发生了什么</h3>
              <p className="text-xs text-amber-500 font-medium">
                以下三题请尽量客观，避免脑补动机、吐槽或指责。这是调解有效的前提。
              </p>

              {/* Q4 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Q4 矛盾完整起因：按时间顺序简写整件事经过
                  </label>
                  <VoiceInputButton onTranscript={handleVoiceInput} />
                </div>
                <p className="text-xs text-slate-400">
                  只写发生了什么、对方说了什么、对方做了什么、你说了什么、你做了什么。全程不添加评价、脑补动机、吐槽、指责。
                </p>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows={5}
                  placeholder="按时间顺序描述..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>

              {/* Q5 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Q5 整件事里，「双方各自做出的不妥行为」分别是什么？
                </label>
                <p className="text-xs text-slate-400">
                  只罗列行为，不扣帽子。例：对方临时改动见面时间；我说话语气急躁
                </p>
                <textarea
                  value={inappropriateBehaviors}
                  onChange={(e) => setInappropriateBehaviors(e.target.value)}
                  rows={3}
                  placeholder="对方：... 我：..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>

              {/* Q6 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Q6 哪些环节属于客观现实限制，哪些属于人为选择问题？
                </label>
                <p className="text-xs text-slate-400">
                  分开写明。例：客观限制——距离远、工作安排；人为选择——对方选择先忙工作再回复
                </p>
                <textarea
                  value={objectiveVsSubjective}
                  onChange={(e) => setObjectiveVsSubjective(e.target.value)}
                  rows={3}
                  placeholder="客观限制：... 人为选择：..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>
            </div>
          )}

          {/* ====== 第三轮：分歧认知 ====== */}
          {currentRound === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-indigo-700">挖出吵架核心分歧点</h3>
              <p className="text-xs text-slate-400">
                本轮帮助你厘清：你到底在意什么，对方可能在意什么，双方分歧到底在哪。
              </p>

              {/* Q7 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Q7 这件事上，你当下的底线/在意的原则是什么？
                  </label>
                  <VoiceInputButton onTranscript={handleVoiceInput} />
                </div>
                <textarea
                  value={bottomLine}
                  onChange={(e) => setBottomLine(e.target.value)}
                  rows={2}
                  placeholder="你最不能让步的核心点..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>

              {/* Q8 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Q8 你原本对这件事的期待是什么？
                </label>
                <p className="text-xs text-slate-400">
                  如：见面时间、沟通频率、做事方式、回应态度、相处分寸等具体期待
                </p>
                <textarea
                  value={originalExpectation}
                  onChange={(e) => setOriginalExpectation(e.target.value)}
                  rows={2}
                  placeholder="你原本希望怎样..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>

              {/* Q9 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Q9 你猜测对方当下的核心在意点是什么？
                </label>
                <p className="text-xs text-slate-400">
                  站在对方视角换位思考预判
                </p>
                <textarea
                  value={guessOtherPartyCore}
                  onChange={(e) => setGuessOtherPartyCore(e.target.value)}
                  rows={2}
                  placeholder="你觉得对方真正在意什么..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>

              {/* Q10 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Q10 你认为双方观念差异点在哪？
                </label>
                <p className="text-xs text-slate-400">
                  如：见面优先级、相处节奏、遇事沟通习惯、情绪处理方式、需求表达习惯
                </p>
                <textarea
                  value={conceptualDifferences}
                  onChange={(e) => setConceptualDifferences(e.target.value)}
                  rows={2}
                  placeholder="双方观念差异..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>
            </div>
          )}

          {/* ====== 第四轮：表层诉求 ====== */}
          {currentRound === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-indigo-700">具象化你的要求</h3>
              <p className="text-xs text-slate-400">
                告别模糊的"你多在乎我"，说出具体可落地的诉求。
              </p>

              {/* Q11 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Q11 当下这件事，你希望对方做出哪2条可落地的具体行为？
                  </label>
                  <VoiceInputButton onTranscript={handleVoiceInput} />
                </div>
                <p className="text-xs text-red-400 font-medium">
                  必须具象，禁止"对我好点、改脾气"这类空话
                </p>
                <textarea
                  value={specificActions}
                  onChange={(e) => setSpecificActions(e.target.value)}
                  rows={3}
                  placeholder="1. ... 2. ..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>

              {/* Q12 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Q12 你能接受的让步底线是什么？哪些部分你无法妥协？
                </label>
                <textarea
                  value={compromiseLine}
                  onChange={(e) => setCompromiseLine(e.target.value)}
                  rows={2}
                  placeholder="可以妥协：... 无法妥协：..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>

              {/* Q13 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Q13 吵架过程中，你希望对方当下用什么样的沟通方式和你对话？
                </label>
                <div className="flex flex-wrap gap-2">
                  {['先安抚情绪', '先讲道理', '先暂停冷静', '先核对事实'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPreferredCommunicationMode(opt)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        preferredCommunicationMode === opt
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={preferredCommunicationMode}
                  onChange={(e) => setPreferredCommunicationMode(e.target.value)}
                  placeholder="或自行填写其他方式"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>
            </div>
          )}

          {/* ====== 第五轮：深层需求 ====== */}
          {currentRound === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-indigo-700">看透吵架本质</h3>
              <p className="text-xs text-slate-400">
                分清表层矛盾与内在刚需，这是调解的关键。
              </p>

              {/* Q14 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Q14 抛开吵架这件小事，你因这件事感到不舒服，背后真正的内在需求是？
                  </label>
                  <VoiceInputButton onTranscript={handleVoiceInput} />
                </div>
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
                <textarea
                  value={deepNeeds}
                  onChange={(e) => setDeepNeeds(e.target.value)}
                  rows={2}
                  placeholder="你真正的内在需求..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>

              {/* Q15 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Q15 过往同类矛盾是否重复发生过？若重复，上一次未解决的遗留问题是什么？
                </label>
                <textarea
                  value={repeatedConflict}
                  onChange={(e) => setRepeatedConflict(e.target.value)}
                  rows={2}
                  placeholder="若无重复写'无'，若有则描述遗留问题..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>

              {/* Q16 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Q16 这件矛盾里，容易触发你敏感、不安的过往相处心结是什么？
                </label>
                <p className="text-xs text-slate-400">无则填"无"</p>
                <textarea
                  value={emotionalTrigger}
                  onChange={(e) => setEmotionalTrigger(e.target.value)}
                  rows={2}
                  placeholder="如无过往心结请填'无'..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>
            </div>
          )}
        </div>

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
            {currentRound === 5 ? '完成并查看摘要' : '下一轮'}
          </button>
        </div>

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

      <ContentWarningDialog
        isOpen={showWarning}
        warningCount={currentSession?.warningCount || 0}
        terminated={currentSession?.mediationTerminated || false}
        onAcknowledge={handleWarningAcknowledge}
      />
    </div>
  );
}