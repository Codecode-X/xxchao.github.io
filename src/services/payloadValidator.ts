// ============================================================
// 载荷验证器
// ============================================================

import type { DiagnosisResult, MediationResult, RiskLevel } from '../types';

function toRecord(data: unknown): Record<string, unknown> {
  if (typeof data === 'object' && data !== null) {
    return data as Record<string, unknown>;
  }
  return {};
}

/**
 * 验证提交码载荷
 */
export function validateSubmissionPayload(
  payload: unknown,
  expectedRoomCode: string
): { valid: boolean; error?: string } {
  const p = toRecord(payload);
  if (!p) return { valid: false, error: '载荷为空' };
  if (p.schemaVersion !== 1) return { valid: false, error: '数据版本不受支持' };
  if (p.roomCode !== expectedRoomCode) return { valid: false, error: '房间代码不一致' };
  if (p.role !== 'A' && p.role !== 'B') return { valid: false, error: '参与者身份无效' };
  if (!p.submittedAt) return { valid: false, error: '缺少提交时间' };
  if (!p.answers) return { valid: false, error: '缺少回答数据' };

  const answers = toRecord(p.answers);
  if (typeof answers.emotionIntensity !== 'number' || answers.emotionIntensity < 1 || answers.emotionIntensity > 10)
    return { valid: false, error: '情绪强度范围无效' };
  if (!Array.isArray(answers.emotionWords) || answers.emotionWords.length === 0)
    return { valid: false, error: '情绪词缺失' };
  if (typeof answers.preConflictMood !== 'string' || (answers.preConflictMood as string).trim().length === 0)
    return { valid: false, error: '矛盾前心情缺失' };
  if (typeof answers.firstUncomfortableMoment !== 'string' || (answers.firstUncomfortableMoment as string).trim().length === 0)
    return { valid: false, error: '首个不舒服瞬间缺失' };
  if (typeof answers.eventDescription !== 'string' || (answers.eventDescription as string).trim().length === 0)
    return { valid: false, error: '事件描述缺失' };
  if (typeof answers.bottomLine !== 'string' || (answers.bottomLine as string).trim().length === 0)
    return { valid: false, error: '底线缺失' };
  if (typeof answers.specificActions !== 'string' || (answers.specificActions as string).trim().length === 0)
    return { valid: false, error: '具体诉求缺失' };
  if (typeof answers.deepNeeds !== 'string' || (answers.deepNeeds as string).trim().length === 0)
    return { valid: false, error: '深层需求缺失' };
  if (!p.nonce) return { valid: false, error: '缺少校验信息' };

  return { valid: true };
}

/**
 * 验证结果码载荷
 */
export function validateResultPayload(
  payload: unknown,
  expectedRoomCode: string
): { valid: boolean; error?: string } {
  const p = toRecord(payload);
  if (!p) return { valid: false, error: '载荷为空' };
  if (p.schemaVersion !== 1) return { valid: false, error: '数据版本不受支持' };
  if (p.roomCode !== expectedRoomCode) return { valid: false, error: '房间代码不一致' };
  if (!p.generatedAt) return { valid: false, error: '缺少生成时间' };
  if (typeof p.emotionalConsensus !== 'string' || (p.emotionalConsensus as string).trim().length === 0)
    return { valid: false, error: '情绪共识缺失' };
  if (typeof p.messageToPartyA !== 'string') return { valid: false, error: 'A方内容缺失' };
  if (typeof p.messageToPartyB !== 'string') return { valid: false, error: 'B方内容缺失' };
  if (typeof p.potentialConsensus !== 'string') return { valid: false, error: '潜在共识缺失' };
  if (!Array.isArray(p.jointActions) || p.jointActions.length < 2 || p.jointActions.length > 3)
    return { valid: false, error: '共同建议数量无效' };

  for (const action of p.jointActions as Array<Record<string, unknown>>) {
    if (!action.title || !action.description) return { valid: false, error: '建议内容不完整' };
  }

  return { valid: true };
}

/**
 * 验证反馈码载荷
 */
export function validateFeedbackPayload(
  payload: unknown,
  expectedRoomCode: string
): { valid: boolean; error?: string } {
  const p = toRecord(payload);
  if (!p) return { valid: false, error: '载荷为空' };
  if (p.schemaVersion !== 1) return { valid: false, error: '数据版本不受支持' };
  if (p.roomCode !== expectedRoomCode) return { valid: false, error: '房间代码不一致' };
  if (!p.role || (p.role !== 'A' && p.role !== 'B')) return { valid: false, error: '参与者身份无效' };
  if (!['接受', '部分接受', '不接受'].includes(p.choice as string)) return { valid: false, error: '反馈选择无效' };
  if (!p.nonce) return { valid: false, error: '缺少校验信息' };

  return { valid: true };
}

/**
 * 验证追问请求码载荷
 */
export function validateFollowUpRequestPayload(
  payload: unknown,
  expectedRoomCode: string
): { valid: boolean; error?: string } {
  const p = toRecord(payload);
  if (!p) return { valid: false, error: '载荷为空' };
  if (p.schemaVersion !== 1) return { valid: false, error: '数据版本不受支持' };
  if (p.roomCode !== expectedRoomCode) return { valid: false, error: '房间代码不一致' };
  if (typeof p.followUpQuestion !== 'string' || (p.followUpQuestion as string).trim().length === 0)
    return { valid: false, error: '追问问题缺失' };
  return { valid: true };
}

/**
 * 验证追问提交码载荷
 */
export function validateFollowUpSubmissionPayload(
  payload: unknown,
  expectedRoomCode: string
): { valid: boolean; error?: string } {
  const p = toRecord(payload);
  if (!p) return { valid: false, error: '载荷为空' };
  if (p.schemaVersion !== 1) return { valid: false, error: '数据版本不受支持' };
  if (p.roomCode !== expectedRoomCode) return { valid: false, error: '房间代码不一致' };
  if (!p.role || (p.role !== 'A' && p.role !== 'B')) return { valid: false, error: '参与者身份无效' };
  if (typeof p.followUpAnswer !== 'string' || (p.followUpAnswer as string).trim().length === 0)
    return { valid: false, error: '追问回答缺失' };
  return { valid: true };
}

/**
 * 验证共识确认码载荷
 */
export function validateConsensusPayload(
  payload: unknown,
  expectedRoomCode: string
): { valid: boolean; error?: string } {
  const p = toRecord(payload);
  if (!p) return { valid: false, error: '载荷为空' };
  if (p.schemaVersion !== 1) return { valid: false, error: '数据版本不受支持' };
  if (p.roomCode !== expectedRoomCode) return { valid: false, error: '房间代码不一致' };
  if (!p.role || (p.role !== 'A' && p.role !== 'B')) return { valid: false, error: '参与者身份无效' };
  if (!['我愿意达成共识', '我还需要调整'].includes(p.choice as string))
    return { valid: false, error: '共识选择无效' };
  return { valid: true };
}

/**
 * 验证 AI 诊断结果
 */
export function validateDiagnosisResult(data: unknown): { valid: boolean; result?: DiagnosisResult; error?: string } {
  try {
    const d = toRecord(data);
    if (!d || typeof data !== 'object') return { valid: false, error: 'AI 返回数据格式错误' };

    if (typeof d.needFollowUp !== 'boolean') return { valid: false, error: 'needFollowUp 字段缺失' };
    if (d.needFollowUp && typeof d.followUpQuestion !== 'string') return { valid: false, error: '追问问题缺失' };
    if (!['light', 'moderate'].includes(d.riskLevel as string)) return { valid: false, error: '风险等级无效' };
    if (!d.diagnosis || typeof d.diagnosis !== 'object') return { valid: false, error: '诊断数据缺失' };

    const diag = toRecord(d.diagnosis);
    if (!diag.coreConflict || !diag.partyAEmotionalPain || !diag.partyBEmotionalPain ||
        !diag.partyARequestAndNeed || !diag.partyBRequestAndNeed || !diag.commonGround ||
        !diag.conflictPoints || !diag.potentialConsensus)
      return { valid: false, error: '诊断数据不完整' };

    return {
      valid: true,
      result: {
        needFollowUp: d.needFollowUp as boolean,
        followUpQuestion: (d.followUpQuestion as string) || null,
        riskLevel: d.riskLevel as RiskLevel,
        diagnosis: {
          coreConflict: diag.coreConflict as string,
          partyAEmotionalPain: diag.partyAEmotionalPain as string,
          partyBEmotionalPain: diag.partyBEmotionalPain as string,
          partyARequestAndNeed: diag.partyARequestAndNeed as string,
          partyBRequestAndNeed: diag.partyBRequestAndNeed as string,
          commonGround: diag.commonGround as string,
          conflictPoints: diag.conflictPoints as string,
          potentialConsensus: diag.potentialConsensus as string,
        },
      },
    };
  } catch {
    return { valid: false, error: 'AI 返回数据解析失败' };
  }
}

/**
 * 验证 AI 调解结果
 */
export function validateMediationResult(data: unknown): { valid: boolean; result?: MediationResult; error?: string } {
  try {
    const d = toRecord(data);
    if (!d || typeof data !== 'object') return { valid: false, error: 'AI 返回数据格式错误' };

    if (typeof d.emotionalConsensus !== 'string' || !d.emotionalConsensus)
      return { valid: false, error: '情绪共识缺失' };
    if (typeof d.messageToPartyA !== 'string') return { valid: false, error: 'A方内容缺失' };
    if (typeof d.messageToPartyB !== 'string') return { valid: false, error: 'B方内容缺失' };
    if (typeof d.potentialConsensus !== 'string') return { valid: false, error: '潜在共识缺失' };
    if (!Array.isArray(d.jointActions) || d.jointActions.length < 2 || d.jointActions.length > 3)
      return { valid: false, error: '共同建议数量无效(需2-3条)' };

    for (const action of d.jointActions as Array<Record<string, unknown>>) {
      if (!action.title || !action.description) return { valid: false, error: '建议内容不完整' };
    }

    return {
      valid: true,
      result: {
        version: 0,
        emotionalConsensus: d.emotionalConsensus as string,
        messageToPartyA: d.messageToPartyA as string,
        messageToPartyB: d.messageToPartyB as string,
        potentialConsensus: d.potentialConsensus as string,
        jointActions: d.jointActions as Array<{ title: string; description: string }>,
      },
    };
  } catch {
    return { valid: false, error: 'AI 返回数据解析失败' };
  }
}