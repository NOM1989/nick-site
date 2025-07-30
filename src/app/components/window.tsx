import { cn } from "@/lib/utils";

interface WindowProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function Window({ children, className, title }: WindowProps) {
  return (
    <div className={cn(
      "bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-300 dark:border-gray-600",
      className
    )}>
      {/* Window header with traffic lights */}
      <div className="bg-gray-200 dark:bg-gray-700 px-4 py-3 flex items-center gap-2 border-b border-gray-300 dark:border-gray-600">
        {/* Traffic light buttons */}
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        {/* Window title */}
        {title && (
          <div className="flex-1 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </div>
        )}
      </div>
      
      {/* Window content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
