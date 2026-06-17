// ============================================================
// 反馈码服务
// ============================================================

import type { FeedbackPayload, Role, FeedbackChoice } from '../types';
import { serializeFeedbackCode, deserializeFeedbackCode } from './payloadSerializer';
import { validateFeedbackPayload } from './payloadValidator';
import { getSession } from './storageService';

/**
 * 生成反馈码
 */
export async function generateFeedbackCode(
  role: Role,
  mediationVersion: number,
  choice: FeedbackChoice,
  inconsistentPoint?: string,
  missingInfo?: string
): Promise<string> {
  const session = getSession();
  if (!session) throw new Error('当前没有活跃会话');

  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const payload: FeedbackPayload = {
    schemaVersion: 1,
    roomCode: session.roomCode,
    role,
    mediationVersion,
    choice,
    inconsistentPoint,
    missingInfo,
    generatedAt: new Date().toISOString(),
    nonce,
  };

  return serializeFeedbackCode(payload, session.roomSecret);
}

/**
 * 导入并验证反馈码
 */
export async function importFeedbackCode(
  code: string,
  expectedRoomCode: string
): Promise<{ success: boolean; choice?: FeedbackChoice; inconsistentPoint?: string; missingInfo?: string; error?: string }> {
  try {
    const session = getSession();
    if (!session) return { success: false, error: '当前没有活跃会话' };

    const payload = await deserializeFeedbackCode(code, session.roomSecret);

    const validation = validateFeedbackPayload(payload, expectedRoomCode);
    if (!validation.valid) return { success: false, error: validation.error };

    return {
      success: true,
      choice: payload.choice,
      inconsistentPoint: payload.inconsistentPoint,
      missingInfo: payload.missingInfo,
    };
  } catch {
    return { success: false, error: '反馈码无效、已损坏，或不属于当前调解房间。' };
  }
}