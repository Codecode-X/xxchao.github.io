// ============================================================
// 息小吵 - 全局类型定义
// ============================================================

/** 参与者身份 */
export type Role = 'A' | 'B';

/** 调解风格 */
export type MediationStyle = '理性分析型' | '温柔共情型' | '直接高效型';

/** 风险等级 */
export type RiskLevel = 'light' | 'moderate';

/** 反馈选择 */
export type FeedbackChoice = '接受' | '部分接受' | '不接受';

/** 共识选择 */
export type ConsensusChoice = '我愿意达成共识' | '我还需要调整';

/** 关系时长选项 */
export type RelationshipDuration = '不足3个月' | '3个月至1年' | '1年至3年' | '3年以上' | '暂不填写';

/** 争吵场景选项 */
export type ConflictScene = '居家' | '线上' | '外出' | '其他' | '暂不填写';

/** 是否首次争吵选项 */
export type FirstConflictOption = '是' | '否' | '不确定' | '暂不填写';

/** 基础信息 */
export interface BasicInfo {
  relationshipDuration?: RelationshipDuration;
  conflictScene?: ConflictScene;
  isFirstConflictOnTopic?: FirstConflictOption;
}

/** 四轮回答 */
export interface PartyAnswers {
  emotionIntensity: number;
  emotionWords: string[];
  eventDescription: string;
  explicitRequests: string;
  deepNeeds: string;
}

/** 本地会话数据 */
export interface LocalSession {
  roomCode: string;
  roomSecret: string;
  localRole: Role;
  basicInfo?: BasicInfo;
  answers: PartyAnswers;
  finalSubmitted: boolean;
  importedSubmission?: ImportedSubmission;
  mediationResult?: MediationResult;
  mediationStyle?: MediationStyle;
  followUpQuestion?: string;
  followUpAnswers?: { A?: string; B?: string };
  followUpSubmitted?: boolean;
  importedFollowUpSubmission?: ImportedFollowUp;
  feedbackHistory?: FeedbackRound[];
  feedbackCode?: string;
  importedFeedbackCode?: ImportedFeedback;
  consensusChoice?: ConsensusChoice;
  importedConsensusCode?: ImportedConsensus;
  createdAt: string;
  warningCount: number;
  mediationTerminated: boolean;
}

/** 导入的对方提交数据 */
export interface ImportedSubmission {
  role: Role;
  submittedAt: string;
  verified: boolean;
}

/** 提交码载荷 */
export interface SubmissionPayload {
  schemaVersion: 1;
  roomCode: string;
  role: Role;
  submittedAt: string;
  basicInfo?: {
    relationshipDuration?: string;
    conflictScene?: string;
    isFirstConflictOnTopic?: string;
  };
  answers: {
    emotionIntensity: number;
    emotionWords: string[];
    eventDescription: string;
    explicitRequests: string;
    deepNeeds: string;
  };
  nonce: string;
}

/** 结果码载荷 */
export interface ResultPayload {
  schemaVersion: 1;
  roomCode: string;
  generatedAt: string;
  emotionalConsensus: string;
  messageToPartyA: string;
  messageToPartyB: string;
  potentialConsensus: string;
  jointActions: Array<{
    title: string;
    description: string;
  }>;
}

/** 反馈码载荷 */
export interface FeedbackPayload {
  schemaVersion: 1;
  roomCode: string;
  role: Role;
  mediationVersion: number;
  choice: FeedbackChoice;
  inconsistentPoint?: string;
  missingInfo?: string;
  generatedAt: string;
  nonce: string;
}

/** 追问请求码载荷 */
export interface FollowUpRequestPayload {
  schemaVersion: 1;
  roomCode: string;
  followUpQuestion: string;
  generatedAt: string;
  nonce: string;
}

/** 追问提交码载荷 */
export interface FollowUpSubmissionPayload {
  schemaVersion: 1;
  roomCode: string;
  role: Role;
  followUpAnswer: string;
  generatedAt: string;
  nonce: string;
}

/** 共识确认码载荷 */
export interface ConsensusPayload {
  schemaVersion: 1;
  roomCode: string;
  role: Role;
  choice: ConsensusChoice;
  generatedAt: string;
  nonce: string;
}

/** 导入的追问提交 */
export interface ImportedFollowUp {
  role: Role;
  submittedAt: string;
  verified: boolean;
}

/** 导入的反馈码 */
export interface ImportedFeedback {
  role: Role;
  choice: FeedbackChoice;
  inconsistentPoint?: string;
  missingInfo?: string;
  verified: boolean;
}

/** 导入的共识确认码 */
export interface ImportedConsensus {
  role: Role;
  choice: ConsensusChoice;
  verified: boolean;
}

/** 反馈轮次 */
export interface FeedbackRound {
  version: number;
  role: Role;
  choice: FeedbackChoice;
  inconsistentPoint?: string;
  missingInfo?: string;
}

/** AI 诊断结果 */
export interface DiagnosisResult {
  needFollowUp: boolean;
  followUpQuestion: string | null;
  riskLevel: RiskLevel;
  diagnosis: {
    coreConflict: string;
    partyAEmotionalPain: string;
    partyBEmotionalPain: string;
    partyARequestAndNeed: string;
    partyBRequestAndNeed: string;
    commonGround: string;
    conflictPoints: string;
    potentialConsensus: string;
  };
}

/** AI 调解结果 */
export interface MediationResult {
  version: number;
  emotionalConsensus: string;
  messageToPartyA: string;
  messageToPartyB: string;
  potentialConsensus: string;
  jointActions: Array<{
    title: string;
    description: string;
  }>;
}

/** AI 服务配置 */
export interface AISettings {
  apiEndpoint: string;
  modelName: string;
  apiKey: string;
  saveToSession: boolean;
}

/** 房间创建信息 */
export interface RoomCreationInfo {
  roomCode: string;
  roomSecret: string;
  createdAt: string;
  localRole: 'A';
}

/** 代码类型前缀 */
export const CODE_PREFIXES = {
  SUBMISSION: 'XXC1',
  RESULT: 'XXR1',
  FEEDBACK: 'XXF1',
  FOLLOWUP_REQUEST: 'XXQ1',
  FOLLOWUP_SUBMISSION: 'XXS1',
  CONSENSUS: 'XXA1',
} as const;

/** Schema 版本 */
export const SCHEMA_VERSIONS = {
  SUBMISSION: 1,
  RESULT: 1,
  FEEDBACK: 1,
  FOLLOWUP_REQUEST: 1,
  FOLLOWUP_SUBMISSION: 1,
  CONSENSUS: 1,
} as const;