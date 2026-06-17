// ============================================================
// 攻击性内容检测服务（本地辅助性规则）
// ============================================================

/**
 * 合理的情绪表达词汇 - 不应被误判
 */
const EMOTIONAL_EXPRESSIONS = [
  '我很生气', '我很愤怒', '我很委屈', '我感到失望',
  '我感觉不被尊重', '我很伤心', '我很难过', '我很烦',
  '我很焦虑', '我很不安', '我很无助', '我很失落',
  '我感到被忽视', '我感到被冷落', '我很心寒',
];

/**
 * 明确辱骂模式（正则表达式）
 */
const ABUSE_PATTERNS = [
  /[你他她].*是.*(傻|蠢|贱|渣|废物|垃圾|恶心)/i,
  /[你他她].*去死/i,
  /滚[蛋开]/i,
  /王八蛋/i,
  /狗[男女东西]/i,
  /畜生/i,
  /不要脸/i,
  /脑[残疾]/i,
  /废柴/i,
  /贱人/i,
  /烂[人货]/i,
  /婊[子]/i,
  /操[你]/i,
  /日[你]/i,
  /TMD|NMD|SB|JIAN/i,
];

/**
 * 人身攻击标签模式
 */
const LABELING_PATTERNS = [
  /你.*就是.*(自私|虚伪|自私自利|虚伪的人)/i,
  /你.*这种人/i,
  /你.*永远.*不会/i,
  /你.*总是.*(这样|那样)/i,
];

/**
 * 检测文本中的攻击性内容
 * 返回检测结果和级别
 */
export function detectAggressiveContent(text: string): {
  detected: boolean;
  level: 'none' | 'warning' | 'critical';
  reason?: string;
} {
  if (!text || text.trim().length === 0) {
    return { detected: false, level: 'none' };
  }

  // 先检查是否属于合理的情绪表达
  const normalizedText = text.trim();
  for (const expr of EMOTIONAL_EXPRESSIONS) {
    if (normalizedText.includes(expr)) {
      // 如果仅仅是情绪表达，继续检查是否有其他攻击性内容
      const textWithoutExpr = normalizedText.replace(expr, '');
      const remainingCheck = checkPatterns(textWithoutExpr);
      if (!remainingCheck) {
        return { detected: false, level: 'none' };
      }
    }
  }

  // 检查辱骂和标签模式
  if (checkPatterns(normalizedText)) {
    return {
      detected: true,
      level: 'warning',
      reason: '请尽量客观描述，否则无法生成有效调解方案。',
    };
  }

  return { detected: false, level: 'none' };
}

/**
 * 检查文本是否匹配攻击模式
 */
function checkPatterns(text: string): boolean {
  for (const pattern of ABUSE_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  for (const pattern of LABELING_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  return false;
}

/**
 * 根据警告次数返回对应的提示信息
 */
export function getWarningMessage(warningCount: number): string | null {
  if (warningCount === 0) return null;
  if (warningCount < 3) {
    return '请尽量客观描述，否则无法生成有效调解方案。\n\n你可以描述对方说了什么、做了什么，以及这件事给你带来的感受，但请避免辱骂或给对方贴标签。';
  }
  return '本次调解已终止\n\n由于连续多次输入辱骂或人身攻击内容，系统暂时无法形成有效的调解方案。';
}