// 消息输入组件：包含文本输入框和发送按钮
import React from "react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  className?: string;
  placeholder?: string;
}

export function MessageInput({ 
  value, 
  onChange, 
  onSend, 
  className = "",
  placeholder = "Write a message..." 
}: MessageInputProps) {
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div className={`h-[96px] bg-[#3b3b3b] rounded-t-[32px] shrink-0 flex items-center px-5 gap-3 ${className}`}>
      {/* Input Box */}
      <div className="flex-1 h-[48px] bg-[#222] rounded-[20px] flex items-center px-[14px]">
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-transparent border-none outline-none text-white text-[14px] w-full placeholder:text-[#888]"
        />
      </div>

      {/* Send Button */}
      <button 
        onClick={onSend}
        className="w-[96px] h-[48px] bg-[#b2dabb] rounded-[21px] flex items-center justify-center shrink-0 transition-transform"
      >
        <span className="text-black font-medium text-[16px]">Send</span>
      </button>
    </div>
  );
}
