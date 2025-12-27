import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/chat" className="text-xl font-semibold text-gray-900">
                Chief of Staff
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/chat" className="text-sm text-gray-600 hover:text-gray-900">
                  Chat
                </Link>
                <Link href="/history" className="text-sm text-gray-600 hover:text-gray-900">
                  History
                </Link>
                <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">
                  Settings
                </Link>
              </nav>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
