import Link from "next/link";

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              Chief of Staff
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">
                Docs
              </Link>
              <Link href="/changelog" className="text-blue-600 font-medium">
                Changelog
              </Link>
              <Link href="/sign-in" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Changelog</h1>
        
        <div className="space-y-12">
          <article>
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                v0.1.0
              </span>
              <time className="text-gray-500">December 27, 2025</time>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Initial Release</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Clerk authentication for secure sign-in</li>
              <li>Chat interface with Claude AI</li>
              <li>Google Calendar integration</li>
              <li>Gmail integration</li>
              <li>Asana task management integration</li>
              <li>Customizable assistant name and personality</li>
              <li>Conversation history</li>
            </ul>
          </article>
        </div>
      </main>
    </div>
  );
}
