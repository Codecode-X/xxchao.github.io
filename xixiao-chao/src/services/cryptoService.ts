// ============================================================
// 加密服务 - 基于 Web Crypto API
// ============================================================

import { hexToUint8Array } from './roomCodeGenerator';

/**
 * 从房间密钥派生 AES-GCM 密钥
 * 使用 PBKDF2 标准密钥派生
 */
export async function deriveKeyFromRoomSecret(
  roomSecret: string,
  salt?: Uint8Array
): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  const actualSalt = salt || crypto.getRandomValues(new Uint8Array(16));

  // 将 hex 格式的密钥转换为 Uint8Array 作为密码材料
  const keyMaterial = hexToUint8Array(roomSecret);

  // 导入原始密钥材料
  const rawKey = new ArrayBuffer(keyMaterial.byteLength);
  new Uint8Array(rawKey).set(keyMaterial);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // 使用 PBKDF2 派生 AES-GCM 密钥
  const rawSalt = new ArrayBuffer(actualSalt.byteLength);
  new Uint8Array(rawSalt).set(actualSalt);
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: rawSalt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return { key: derivedKey, salt: actualSalt };
}

/**
 * AES-GCM 加密
 */
export async function encryptAESGCM(
  plaintext: string,
  key: CryptoKey,
  salt: Uint8Array
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  // 组合: salt(16) + iv(12) + ciphertext
  const combined = new Uint8Array(
    salt.length + iv.length + (ciphertext as ArrayBuffer).byteLength
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext as ArrayBuffer), salt.length + iv.length);

  return base64URLEncode(combined);
}

/**
 * AES-GCM 解密
 */
export async function decryptAESGCM(
  encoded: string,
  roomSecret: string
): Promise<string> {
  const combined = base64URLDecode(encoded);

  // 提取 salt(16) + iv(12) + ciphertext
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);

  const { key } = await deriveKeyFromRoomSecret(roomSecret, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Base64URL 编码
 */
export function base64URLEncode(buffer: Uint8Array): string {
  const binary = Array.from(buffer)
    .map((b) => String.fromCharCode(b))
    .join('');
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Base64URL 解码
 */
export function base64URLDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // 补齐 padding
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}