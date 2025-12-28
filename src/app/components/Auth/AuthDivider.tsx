// 认证流程分隔符组件：用于在登录/注册表单中分隔不同登录方式（默认文本 "or"）

export const AuthDivider = ({ text = "or" }: { text?: string }) => (
  <div className="relative w-full h-[32px] flex items-center justify-center mb-[15px]" role="separator">
      {/* 分隔线底层：半透明横线贯穿容器 */}
      <div className="w-full h-px bg-white/10 absolute" />

      {/* 文本容器：覆盖在线之上，使用背景色遮挡形成中断效果 */}
      <div className="bg-app-dark px-3 z-10 relative">
          <span className="text-tiny text-text-subtle tracking-[0.6px] uppercase">{text}</span>
      </div>
  </div>
);
