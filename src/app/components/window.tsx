import { cn } from "@/lib/utils";

interface WindowProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function Window({ children, className, title }: WindowProps) {
  return (
    <div className={cn(
      "bg-black/40 backdrop-blur-sm rounded-lg border border-green-500/30 shadow-lg shadow-green-500/10 overflow-hidden relative",
      className
    )}>
      {/* CRT scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 crt-scanlines opacity-30" />
      
      {/* Window header with traffic lights */}
      <div className="px-4 py-3 flex items-center gap-2 relative z-20 bg-black/60 border-b border-green-500/30 backdrop-blur-sm">
        {/* Traffic light buttons */}
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400/70 shadow-sm shadow-red-400/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400/70 shadow-sm shadow-yellow-400/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-400/70 shadow-sm shadow-green-400/50"></div>
        </div>
        {/* Window title */}
        {title && (
          <div className="flex-1 text-center text-sm font-medium text-green-400 font-inconsolata glow tracking-wide">
            {title}
          </div>
        )}
      </div>
      
      {/* Window content */}
      <div className="relative z-20 p-0">
        {children}
      </div>
      
      {/* CRT glow effect */}
      <div className="absolute inset-0 pointer-events-none bg-green-500/5 rounded-lg blur-sm" />
    </div>
  );
}
