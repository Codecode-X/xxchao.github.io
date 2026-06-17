// ============================================================
// 结果码服务
// ============================================================

import type { ResultPayload, MediationResult } from '../types';
import { serializeResultCode, deserializeResultCode } from './payloadSerializer';
import { validateResultPayload } from './payloadValidator';
import { getSession } from '../services/storageService';

/**
 * 生成结果码
 */
export async function generateResultCode(result: MediationResult): Promise<string> {
  const session = getSession();
  if (!session) throw new Error('当前没有活跃会话');

  const payload: ResultPayload = {
    schemaVersion: 1,
    roomCode: session.roomCode,
    generatedAt: new Date().toISOString(),
    emotionalConsensus: result.emotionalConsensus,
    messageToPartyA: result.messageToPartyA,
    messageToPartyB: result.messageToPartyB,
    potentialConsensus: result.potentialConsensus,
    jointActions: result.jointActions,
  };

  return serializeResultCode(payload, session.roomSecret);
}

/**
 * 导入并验证结果码
 */
export async function importResultCode(
  code: string,
  expectedRoomCode: string
): Promise<{ success: boolean; result?: MediationResult; error?: string }> {
  try {
    const session = getSession();
    if (!session) return { success: false, error: '当前没有活跃会话' };

    const payload = await deserializeResultCode(code, session.roomSecret);

    const validation = validateResultPayload(payload, expectedRoomCode);
    if (!validation.valid) return { success: false, error: validation.error };

    return {
      success: true,
      result: {
        version: 0,
        emotionalConsensus: payload.emotionalConsensus,
        messageToPartyA: payload.messageToPartyA,
        messageToPartyB: payload.messageToPartyB,
        potentialConsensus: payload.potentialConsensus,
        jointActions: payload.jointActions,
      },
    };
  } catch {
    return { success: false, error: '结果码无效、已损坏，或不属于当前调解房间。' };
  }
}