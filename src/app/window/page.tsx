import Image from "next/image";
import Link from "next/link";
import Window from "@/app/components/window";

export default function WindowPage() {
  return (
    <main className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <Window title="Profile" className="max-w-md mx-auto">
          <div className="flex flex-col items-center space-y-6">
            {/* Profile Image */}
            <div className="relative w-48 h-48 overflow-hidden">
              <Image
                src="/nick-cutout.png"
                alt="Nick Michau"
                fill
                className="object-cover"
              />
            </div>
            
            {/* Contact Information */}
            <div className="text-center space-y-3">
              <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Email: 
                <Link 
                  href="mailto:nick@michau.uk" 
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  nick@michau.uk
                </Link>
              </div>
              
              <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                GitHub: 
                <Link 
                  href="https://github.com/NOM1989" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  github.com/NOM1989
                </Link>
              </div>
            </div>
          </div>
        </Window>
      </div>
    </main>
  );
}
