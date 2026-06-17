// ============================================================
// 隐私说明组件
// ============================================================

export function PrivacyNotice() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 space-y-2">
      <p className="font-medium text-slate-700">🔒 隐私说明</p>
      <p>息小吵不会将回答保存到自有服务器，因为本网站没有服务器。</p>
      <p>
        回答默认仅保存在当前设备中。只有当你主动复制并发送提交码时，加密后的信息才会被另一台设备导入。
      </p>
      <p>
        开始 AI 调解后，双方提交内容会由当前浏览器发送至用户配置的 AI 服务。具体数据处理方式取决于该 AI 服务提供方。
      </p>
    </div>
  );
}