import { cn } from "@/lib/utils";

interface WindowProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function Window({ children, className, title }: WindowProps) {
  return (
    <div className={cn(
      "bg-black/30 backdrop-blur-sm rounded-lg border border-green-500/30 overflow-hidden relative",
      className
    )}>
      {/* Window header with traffic lights */}
      <div className="px-4 py-3 flex items-center gap-2 bg-black/40 border-b border-green-500/30">
        {/* Traffic light buttons */}
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400/60 border border-red-300/30"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400/60 border border-yellow-300/30"></div>
          <div className="w-3 h-3 rounded-full bg-green-400/60 border border-green-300/30"></div>
        </div>
        {/* Window title */}
        {title && (
          <div className="flex-1 text-center text-3xl font-medium text-green-300 font-inconsolata tracking-wide">
            {title}
          </div>
        )}
      </div>
      
      {/* Window content */}
      <div className="">
        {children}
      </div>
    </div>
  );
}
