// ============================================================
// 本地存储服务
// ============================================================

import type {
  LocalSession,
  Role,
  PartyAnswers,
  BasicInfo,
  MediationResult,
  MediationStyle,
  AISettings,
  ImportedFollowUp,
  ImportedConsensus,
  ConsensusChoice,
} from '../types';

const STORAGE_KEY = 'xixiao_chao_session';

/**
 * 获取当前会话数据
 */
export function getSession(): LocalSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalSession;
  } catch {
    return null;
  }
}

/**
 * 保存当前会话数据
 */
export function saveSession(session: LocalSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

/**
 * 清除当前会话数据
 */
export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * 创建新会话（创建房间时）
 */
export function createSession(roomCode: string, roomSecret: string, localRole: Role): LocalSession {
  const session: LocalSession = {
    roomCode,
    roomSecret,
    localRole,
    answers: {
      emotionIntensity: 5,
      emotionWords: [],
      preConflictMood: '',
      firstUncomfortableMoment: '',
      eventDescription: '',
      inappropriateBehaviors: '',
      objectiveVsSubjective: '',
      bottomLine: '',
      originalExpectation: '',
      guessOtherPartyCore: '',
      conceptualDifferences: '',
      specificActions: '',
      compromiseLine: '',
      preferredCommunicationMode: '',
      deepNeeds: '',
      repeatedConflict: '',
      emotionalTrigger: '',
    },
    finalSubmitted: false,
    createdAt: new Date().toISOString(),
    warningCount: 0,
    mediationTerminated: false,
  };
  saveSession(session);
  return session;
}

/**
 * 更新回答
 */
export function updateAnswers(answers: Partial<PartyAnswers>): LocalSession | null {
  const session = getSession();
  if (!session) return null;
  session.answers = { ...session.answers, ...answers };
  saveSession(session);
  return session;
}

/**
 * 更新基础信息
 */
export function updateBasicInfo(basicInfo: BasicInfo): LocalSession | null {
  const session = getSession();
  if (!session) return null;
  session.basicInfo = basicInfo;
  saveSession(session);
  return session;
}

/**
 * 标记最终提交
 */
export function markFinalSubmitted(): LocalSession | null {
  const session = getSession();
  if (!session) return null;
  session.finalSubmitted = true;
  saveSession(session);
  return session;
}

/**
 * 导入对方提交码验证信息
 */
export function setImportedSubmission(imported: { role: Role; submittedAt: string; verified: boolean }): LocalSession | null {
  const session = getSession();
  if (!session) return null;
  session.importedSubmission = imported;
  saveSession(session);
  return session;
}

/**
 * 保存调解结果
 */
export function setMediationResult(result: MediationResult): LocalSession | null {
  const session = getSession();
  if (!session) return null;
  session.mediationResult = result;
  saveSession(session);
  return session;
}

/**
 * 设置调解风格
 */
export function setMediationStyle(style: MediationStyle): LocalSession | null {
  const session = getSession();
  if (!session) return null;
  session.mediationStyle = style;
  saveSession(session);
  return session;
}

/**
 * 增加警告次数
 */
export function incrementWarningCount(): LocalSession | null {
  const session = getSession();
  if (!session) return null;
  session.warningCount += 1;
  if (session.warningCount >= 3) {
    session.mediationTerminated = true;
  }
  saveSession(session);
  return session;
}

/**
 * 设置追问问题
 */
export function setFollowUpQuestion(question: string): LocalSession | null {
  const session = getSession();
  if (!session) return null;
  session.followUpQuestion = question;
  saveSession(session);
  return session;
}

/**
 * 设置追问回答
 */
export function setFollowUpAnswer(role: Role, answer: string): LocalSession | null {
  const session = getSession();
  if (!session) return null;
  if (!session.followUpAnswers) session.followUpAnswers = {};
  session.followUpAnswers[role] = answer;
  saveSession(session);
  return session;
}

/**
 * 导入对方追问提交验证信息
 */
export function setImportedFollowUp(imported: ImportedFollowUp): LocalSession | null {
  const session = getSession();
  if (!session) return null;
  session.importedFollowUpSubmission = imported;
  saveSession(session);
  return session;
}

/**
 * 设置共识选择
 */
export function setConsensusChoice(choice: ConsensusChoice): LocalSession | null {
  const session = getSession();
  if (!session) return null;
  session.consensusChoice = choice;
  saveSession(session);
  return session;
}

/**
 * 导入对方共识确认码
 */
export function setImportedConsensus(imported: ImportedConsensus): LocalSession | null {
  const session = getSession();
  if (!session) return null;
  session.importedConsensusCode = imported;
  saveSession(session);
  return session;
}

/**
 * 保存 AI 设置到 sessionStorage
 */
export function saveAISettingsToSession(settings: AISettings): void {
  sessionStorage.setItem('xixiao_ai_settings', JSON.stringify(settings));
}

/**
 * 从 sessionStorage 获取 AI 设置
 */
export function getAISettingsFromSession(): AISettings | null {
  try {
    const raw = sessionStorage.getItem('xixiao_ai_settings');
    if (!raw) return null;
    return JSON.parse(raw) as AISettings;
  } catch {
    return null;
  }
}

/**
 * 清除 sessionStorage 中的 AI 设置
 */
export function clearAISettingsFromSession(): void {
  sessionStorage.removeItem('xixiao_ai_settings');
}