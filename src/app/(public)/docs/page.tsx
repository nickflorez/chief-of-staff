import Link from "next/link";

export default function DocsPage() {
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
              <Link href="/docs" className="text-blue-600 font-medium">
                Docs
              </Link>
              <Link href="/changelog" className="text-gray-600 hover:text-gray-900">
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Documentation</h1>
        
        <div className="prose prose-lg max-w-none">
          <h2>Getting Started</h2>
          <p>
            Chief of Staff is your personal AI executive assistant that connects to your
            productivity tools to help you manage your day more effectively.
          </p>

          <h2>Setting Up Integrations</h2>
          <h3>Google (Calendar & Gmail)</h3>
          <ol>
            <li>Go to Settings &gt; Integrations</li>
            <li>Click &quot;Connect Google Account&quot;</li>
            <li>Grant the requested permissions</li>
            <li>Your assistant can now access your calendar and email</li>
          </ol>

          <h3>Asana</h3>
          <ol>
            <li>Go to Settings &gt; Integrations</li>
            <li>Click &quot;Connect Asana&quot;</li>
            <li>Authorize the connection</li>
            <li>Your assistant can now manage your tasks</li>
          </ol>

          <h2>Customizing Your Assistant</h2>
          <p>
            You can customize your assistant&apos;s name and personality in the Settings page.
            Give your assistant a name that feels right for you.
          </p>

          <h2>Example Commands</h2>
          <ul>
            <li>&quot;What&apos;s on my calendar today?&quot;</li>
            <li>&quot;Create a meeting with John tomorrow at 2pm&quot;</li>
            <li>&quot;Show me my overdue tasks&quot;</li>
            <li>&quot;Search my emails for the contract from Acme Corp&quot;</li>
            <li>&quot;Create a task to review the quarterly report&quot;</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
