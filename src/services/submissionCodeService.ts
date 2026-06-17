// ============================================================
// 提交码服务
// ============================================================

import type { SubmissionPayload, Role } from '../types';
import { serializeSubmissionCode, deserializeSubmissionCode } from './payloadSerializer';
import { validateSubmissionPayload } from './payloadValidator';
import { getSession } from './storageService';

/**
 * 生成提交码
 */
export async function generateSubmissionCode(): Promise<string> {
  const session = getSession();
  if (!session || !session.finalSubmitted) {
    throw new Error('尚未完成最终提交');
  }

  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const payload: SubmissionPayload = {
    schemaVersion: 1,
    roomCode: session.roomCode,
    role: session.localRole,
    submittedAt: new Date().toISOString(),
    basicInfo: session.basicInfo ? {
      relationshipDuration: session.basicInfo.relationshipDuration,
      conflictScene: session.basicInfo.conflictScene,
      isFirstConflictOnTopic: session.basicInfo.isFirstConflictOnTopic,
    } : undefined,
    answers: {
      emotionIntensity: session.answers.emotionIntensity,
      emotionWords: session.answers.emotionWords,
      preConflictMood: session.answers.preConflictMood,
      firstUncomfortableMoment: session.answers.firstUncomfortableMoment,
      eventDescription: session.answers.eventDescription,
      inappropriateBehaviors: session.answers.inappropriateBehaviors,
      objectiveVsSubjective: session.answers.objectiveVsSubjective,
      bottomLine: session.answers.bottomLine,
      originalExpectation: session.answers.originalExpectation,
      guessOtherPartyCore: session.answers.guessOtherPartyCore,
      conceptualDifferences: session.answers.conceptualDifferences,
      specificActions: session.answers.specificActions,
      compromiseLine: session.answers.compromiseLine,
      preferredCommunicationMode: session.answers.preferredCommunicationMode,
      deepNeeds: session.answers.deepNeeds,
      repeatedConflict: session.answers.repeatedConflict,
      emotionalTrigger: session.answers.emotionalTrigger,
    },
    nonce,
  };

  // 同时保存自己的数据到 sessionStorage
  sessionStorage.setItem(`xixiao_party_${session.localRole.toLowerCase()}_data`, JSON.stringify(payload));

  return serializeSubmissionCode(payload, session.roomSecret);
}

/**
 * 导入并验证提交码
 */
export async function importSubmissionCode(
  code: string,
  expectedRoomCode: string,
  expectedRole: Role
): Promise<{ success: boolean; submittedAt?: string; error?: string }> {
  try {
    const session = getSession();
    if (!session) return { success: false, error: '当前没有活跃会话' };

    const payload = await deserializeSubmissionCode(code, session.roomSecret);

    // 验证载荷
    const validation = validateSubmissionPayload(payload, expectedRoomCode);
    if (!validation.valid) return { success: false, error: validation.error };

    // 导入角色必须为对方
    if (payload.role !== expectedRole) {
      if (payload.role === session.localRole) {
        return { success: false, error: '不允许导入自己的提交码作为对方数据' };
      }
      return { success: false, error: '提交码角色与期望不符' };
    }

    // 将解密后的数据存储到 sessionStorage 以供 AI 调用时使用
    sessionStorage.setItem(`xixiao_party_${expectedRole.toLowerCase()}_data`, JSON.stringify(payload));

    return {
      success: true,
      submittedAt: payload.submittedAt,
    };
  } catch {
    return { success: false, error: '提交码无效、已损坏，或不属于当前调解房间。' };
  }
}