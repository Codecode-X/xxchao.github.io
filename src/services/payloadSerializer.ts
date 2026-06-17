// ============================================================
// 载荷序列化与反序列化
// ============================================================

import { encryptAESGCM, decryptAESGCM, deriveKeyFromRoomSecret } from './cryptoService';
import type {
  SubmissionPayload,
  ResultPayload,
  FeedbackPayload,
  FollowUpRequestPayload,
  FollowUpSubmissionPayload,
  ConsensusPayload,
} from '../types';
import { CODE_PREFIXES } from '../types';

/**
 * 序列化并加密提交码
 */
export async function serializeSubmissionCode(
  payload: SubmissionPayload,
  roomSecret: string
): Promise<string> {
  const json = JSON.stringify(payload);
  const { key, salt } = await deriveKeyFromRoomSecret(roomSecret);
  const encrypted = await encryptAESGCM(json, key, salt);
  return `${CODE_PREFIXES.SUBMISSION}.${encrypted}`;
}

/**
 * 反序列化并解密提交码
 */
export async function deserializeSubmissionCode(
  code: string,
  roomSecret: string
): Promise<SubmissionPayload> {
  const prefix = CODE_PREFIXES.SUBMISSION + '.';
  if (!code.startsWith(prefix)) {
    throw new Error('提交码前缀无效');
  }
  const encrypted = code.slice(prefix.length);
  const decrypted = await decryptAESGCM(encrypted, roomSecret);
  return JSON.parse(decrypted) as SubmissionPayload;
}

/**
 * 序列化并加密结果码
 */
export async function serializeResultCode(
  payload: ResultPayload,
  roomSecret: string
): Promise<string> {
  const json = JSON.stringify(payload);
  const { key, salt } = await deriveKeyFromRoomSecret(roomSecret);
  const encrypted = await encryptAESGCM(json, key, salt);
  return `${CODE_PREFIXES.RESULT}.${encrypted}`;
}

/**
 * 反序列化并解密结果码
 */
export async function deserializeResultCode(
  code: string,
  roomSecret: string
): Promise<ResultPayload> {
  const prefix = CODE_PREFIXES.RESULT + '.';
  if (!code.startsWith(prefix)) {
    throw new Error('结果码前缀无效');
  }
  const encrypted = code.slice(prefix.length);
  const decrypted = await decryptAESGCM(encrypted, roomSecret);
  return JSON.parse(decrypted) as ResultPayload;
}

/**
 * 序列化并加密反馈码
 */
export async function serializeFeedbackCode(
  payload: FeedbackPayload,
  roomSecret: string
): Promise<string> {
  const json = JSON.stringify(payload);
  const { key, salt } = await deriveKeyFromRoomSecret(roomSecret);
  const encrypted = await encryptAESGCM(json, key, salt);
  return `${CODE_PREFIXES.FEEDBACK}.${encrypted}`;
}

/**
 * 反序列化并解密反馈码
 */
export async function deserializeFeedbackCode(
  code: string,
  roomSecret: string
): Promise<FeedbackPayload> {
  const prefix = CODE_PREFIXES.FEEDBACK + '.';
  if (!code.startsWith(prefix)) {
    throw new Error('反馈码前缀无效');
  }
  const encrypted = code.slice(prefix.length);
  const decrypted = await decryptAESGCM(encrypted, roomSecret);
  return JSON.parse(decrypted) as FeedbackPayload;
}

/**
 * 序列化并加密追问请求码
 */
export async function serializeFollowUpRequestCode(
  payload: FollowUpRequestPayload,
  roomSecret: string
): Promise<string> {
  const json = JSON.stringify(payload);
  const { key, salt } = await deriveKeyFromRoomSecret(roomSecret);
  const encrypted = await encryptAESGCM(json, key, salt);
  return `${CODE_PREFIXES.FOLLOWUP_REQUEST}.${encrypted}`;
}

/**
 * 反序列化并解密追问请求码
 */
export async function deserializeFollowUpRequestCode(
  code: string,
  roomSecret: string
): Promise<FollowUpRequestPayload> {
  const prefix = CODE_PREFIXES.FOLLOWUP_REQUEST + '.';
  if (!code.startsWith(prefix)) {
    throw new Error('追问请求码前缀无效');
  }
  const encrypted = code.slice(prefix.length);
  const decrypted = await decryptAESGCM(encrypted, roomSecret);
  return JSON.parse(decrypted) as FollowUpRequestPayload;
}

/**
 * 序列化并加密追问提交码
 */
export async function serializeFollowUpSubmissionCode(
  payload: FollowUpSubmissionPayload,
  roomSecret: string
): Promise<string> {
  const json = JSON.stringify(payload);
  const { key, salt } = await deriveKeyFromRoomSecret(roomSecret);
  const encrypted = await encryptAESGCM(json, key, salt);
  return `${CODE_PREFIXES.FOLLOWUP_SUBMISSION}.${encrypted}`;
}

/**
 * 反序列化并解密追问提交码
 */
export async function deserializeFollowUpSubmissionCode(
  code: string,
  roomSecret: string
): Promise<FollowUpSubmissionPayload> {
  const prefix = CODE_PREFIXES.FOLLOWUP_SUBMISSION + '.';
  if (!code.startsWith(prefix)) {
    throw new Error('追问提交码前缀无效');
  }
  const encrypted = code.slice(prefix.length);
  const decrypted = await decryptAESGCM(encrypted, roomSecret);
  return JSON.parse(decrypted) as FollowUpSubmissionPayload;
}

/**
 * 序列化并加密共识确认码
 */
export async function serializeConsensusCode(
  payload: ConsensusPayload,
  roomSecret: string
): Promise<string> {
  const json = JSON.stringify(payload);
  const { key, salt } = await deriveKeyFromRoomSecret(roomSecret);
  const encrypted = await encryptAESGCM(json, key, salt);
  return `${CODE_PREFIXES.CONSENSUS}.${encrypted}`;
}

/**
 * 反序列化并解密共识确认码
 */
export async function deserializeConsensusCode(
  code: string,
  roomSecret: string
): Promise<ConsensusPayload> {
  const prefix = CODE_PREFIXES.CONSENSUS + '.';
  if (!code.startsWith(prefix)) {
    throw new Error('共识确认码前缀无效');
  }
  const encrypted = code.slice(prefix.length);
  const decrypted = await decryptAESGCM(encrypted, roomSecret);
  return JSON.parse(decrypted) as ConsensusPayload;
}