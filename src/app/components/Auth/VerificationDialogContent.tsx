// 验证码输入弹窗内容组件
// 包含 6 位验证码输入框和验证按钮
import React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../ui/input-otp";
import { Button } from '../Common/Button';

interface VerificationDialogContentProps {
  otpValue: string;
  setOtpValue: (value: string) => void;
  onVerify: () => void;
  buttonText?: string;
  title?: string;
  description?: string;
  isVerifying?: boolean;
}

export const VerificationDialogContent = ({
  otpValue,
  setOtpValue,
  onVerify,
  buttonText = "Verify",
  title = "Enter Verification Code",
  description = "We've sent a code to your email.",
  isVerifying = false
}: VerificationDialogContentProps) => {
  return (
    <DialogContent className="bg-app-dark border-white/10 text-white w-[90%] rounded-[20px]">
      <DialogHeader>
        <DialogTitle className="text-center text-[20px] font-semibold mb-2">{title}</DialogTitle>
        <DialogDescription className="text-center text-text-muted">
          {description}
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex flex-col items-center justify-center py-6 gap-6">
        <InputOTP
          maxLength={6}
          value={otpValue}
          onChange={setOtpValue}
        >
          <InputOTPGroup className="gap-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <InputOTPSlot 
                key={index} 
                index={index} 
                className="border border-white/20 rounded-md h-[50px] w-[40px] text-[20px] text-white bg-transparent caret-brand-primary transition-all duration-200 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary" 
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <Button 
          variant="primary" 
          onClick={onVerify}
          disabled={otpValue.length < 6 || isVerifying}
          className="w-full"
        >
          {buttonText}
        </Button>
      </div>
    </DialogContent>
  );
};
