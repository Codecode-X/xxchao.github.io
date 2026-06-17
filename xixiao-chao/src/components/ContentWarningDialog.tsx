// ============================================================
// 攻击性内容警告对话框
// ============================================================

interface ContentWarningDialogProps {
  isOpen: boolean;
  warningCount: number;
  terminated: boolean;
  onAcknowledge: () => void;
}

export function ContentWarningDialog({
  isOpen,
  warningCount,
  terminated,
  onAcknowledge,
}: ContentWarningDialogProps) {
  if (!isOpen) return null;

  if (terminated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-700">本次调解已终止</h3>
          </div>
          <p className="text-slate-600 text-center">
            由于连续多次输入辱骂或人身攻击内容，系统暂时无法形成有效的调解方案。
          </p>
          <button
            onClick={onAcknowledge}
            className="w-full py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            我知道了
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-amber-700">温馨提示</h3>
        </div>
        <p className="text-slate-600">
          请尽量客观描述，否则无法生成有效调解方案。
        </p>
        <p className="text-slate-500 text-sm">
          你可以描述对方说了什么、做了什么，以及这件事给你带来的感受，但请避免辱骂或给对方贴标签。
        </p>
        {warningCount < 3 && (
          <p className="text-amber-600 text-xs text-center">
            剩余提醒次数：{3 - warningCount - 1}
          </p>
        )}
        <button
          onClick={onAcknowledge}
          className="w-full py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium"
        >
          我知道了，继续填写
        </button>
      </div>
    </div>
  );
}