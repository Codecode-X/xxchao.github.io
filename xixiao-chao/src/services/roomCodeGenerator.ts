// ============================================================
// 房间代码生成器
// ============================================================

const ALLOWED_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 排除 0/O, 1/I/L
const CODE_LENGTH = 6;

/**
 * 使用浏览器安全随机数生成房间代码
 * 6位，大写字母+数字，排除混淆字符
 */
export function generateRoomCode(): string {
  const array = new Uint32Array(CODE_LENGTH);
  crypto.getRandomValues(array);
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALLOWED_CHARS[array[i] % ALLOWED_CHARS.length];
  }
  return code;
}

/**
 * 使用 Web Crypto API 生成房间密钥
 * 返回 Base64 编码的随机字节
 */
export function generateRoomSecret(): string {
  const bytes = new Uint8Array(32); // 256 bits
  crypto.getRandomValues(bytes);
  return arrayBufferToBase64(bytes);
}

function arrayBufferToBase64(buffer: Uint8Array): string {
  const binary = Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return binary;
}

/**
 * 从 hex 字符串还原为 Uint8Array
 */
export function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * 验证房间代码格式
 */
export function validateRoomCode(code: string): boolean {
  if (code.length !== CODE_LENGTH) return false;
  for (const char of code) {
    if (!ALLOWED_CHARS.includes(char)) return false;
  }
  return true;
}