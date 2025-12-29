import { MoreHorizontal } from "lucide-react";

interface ImagePreviewCardProps {
  image: string;
  title: string;
  tag?: string;
  // 新增 footerClassName 属性，允许外部覆盖底部背景色
  footerClassName?: string;
  onEdit?: () => void;
  onClick?: () => void;
}

export function ImagePreviewCard({ image, title, tag = "PREVIEW", footerClassName, onEdit, onClick }: ImagePreviewCardProps) {
  return (
    <div className="w-full bg-card rounded-[32px] overflow-hidden shadow-lg shadow-black/20 relative group">
      {onEdit && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20 backdrop-blur-sm transition-all"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      )}
      
      <div 
        className="aspect-video w-full bg-black relative cursor-pointer"
        onClick={onClick}
      >
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        {/* Overlay gradient for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <div className={`p-4 flex items-center justify-between ${footerClassName || 'bg-charcoal-g'}`}>
         <h3 className="text-white text-[15px] font-medium line-clamp-1">{title}</h3>
         <div className="bg-brand-primary px-2 py-0.5 rounded text-[10px] font-bold text-black tracking-wide uppercase">
           {tag}
         </div>
      </div>
    </div>
  );
}
