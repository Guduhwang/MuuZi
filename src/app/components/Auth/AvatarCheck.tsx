/**
 * AvatarCheck 组件
 * - 展示头像+勾选动效，完成后通过 onComplete 通知父级。
 * - 支持 reduceMotion 开关，尊重系统“减少动态效果”偏好。
 * - 颜色使用设计 token（CSS 变量）并提供 fallback。
 */
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from "motion/react";
import svgPaths from "../../../assets/svgs/svg-qffcviygir";
import imgAvatarCheck from "figma:asset/001e4ac02244cdc9e81e71c715f2fe7772b4783c.png";

const COLOR_PRIMARY = 'var(--color-brand-primary)';
const COLOR_STROKE = 'var(--color-app-dark)';
const ANIM_DURATION = 0.8;
const ANIM_DELAY = 0.8;

function Tick() {
  return (
    <div className="absolute inset-[26.19%_21.19%_26.26%_21.25%]" data-name="Tick">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.4859 14.4425">
        <g id="Tick">
          <path clipRule="evenodd" d={svgPaths.p32398b00} fill="var(--color-jet)" fillRule="evenodd" id="Path" />
        </g>
      </svg>
    </div>
  );
}

function Icon24PxCheck() {
  return (
    <div className="absolute inset-[17.86%]" data-name="Icon / 24px / Check">
      <Tick />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-0" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47.25 47.25">
        <circle 
          cx="23.625" 
          cy="23.625" 
          fill={COLOR_PRIMARY} 
          id="Oval" 
          r="22.625" 
          stroke={COLOR_STROKE} 
          strokeWidth="2" 
        />
      </svg>
      <Icon24PxCheck />
    </div>
  );
}

function Icon28PxCheckBorder({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <div className="absolute top-[68%] left-[68%] w-[35%] h-[35%] z-20" data-name="Icon / 28px / Check Border">
      {shouldReduceMotion ? (
        <div className="w-full h-full relative">
          <Group />
        </div>
      ) : (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20, 
            delay: ANIM_DELAY // Wait for circle animation to finish
          }}
          className="w-full h-full relative"
        >
          <Group />
        </motion.div>
      )}
    </div>
  );
}

interface AvatarCheckProps {
  onComplete?: () => void;
  className?: string;
  reduceMotion?: boolean;
}

export default function AvatarCheck({ onComplete, className = "", reduceMotion }: AvatarCheckProps) {
  const [checked, setChecked] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = reduceMotion ?? prefersReducedMotion ?? false;

  useEffect(() => {
    // Start animation automatically on mount
    setChecked(true);
    
    // Wait for animation to finish before enabling button (0.8s circle + some buffer)
    const timer = setTimeout(() => {
      onComplete?.();
    }, shouldReduceMotion ? 300 : 1000);

    return () => clearTimeout(timer);
  }, [onComplete, shouldReduceMotion]);

  return (
    <div 
      className={`relative ${className}`} 
      data-name="Avatar / Check"
    >
      {/* Avatar Image - Ensure it's circular */}
      <div className="relative w-full h-full rounded-full overflow-hidden border-[2px] border-[color:var(--color-app-dark)]">
         <img 
           alt="Avatar" 
           className="block w-full h-full object-cover" 
           src={imgAvatarCheck} 
           loading="lazy"
           decoding="async"
         />
      </div>

      {/* Animated Green Circle Stroke */}
      <svg 
        className="absolute inset-0 w-full h-full rotate-45 pointer-events-none z-10" 
        viewBox="0 0 100 100"
        style={{ overflow: 'visible' }}
      >
        <motion.circle
          cx="50"
          cy="50"
          r="53"
          fill="none"
          stroke={COLOR_PRIMARY}
          strokeWidth="4"
          strokeLinecap="round"
          initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: ANIM_DURATION, ease: "easeInOut" }
          }
        />
      </svg>

      {checked && <Icon28PxCheckBorder shouldReduceMotion={shouldReduceMotion} />}
    </div>
  );
}
