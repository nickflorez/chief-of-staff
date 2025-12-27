export default function ChangelogPage() {
  return (
    <div className="py-12">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Changelog</h1>
        <p className="text-xl text-gray-600">
          Stay up to date with the latest updates and improvements
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Version 0.1.0 */}
          <article className="relative">
            {/* Timeline connector */}
            <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200 hidden md:block" style={{ left: '1.25rem' }} />

            <div className="md:pl-12 relative">
              {/* Timeline dot */}
              <div className="absolute left-0 top-1 w-10 h-10 bg-blue-600 rounded-full hidden md:flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    v0.1.0
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Latest
                  </span>
                  <time className="text-gray-500 text-sm">December 27, 2025</time>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Initial Release</h2>

                <p className="text-gray-600 mb-6">
                  We&apos;re excited to launch Chief of Staff, your personal AI executive assistant. This initial release includes all core features to help you manage your calendar, emails, and tasks.
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </span>
                      Features
                    </h3>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {[
                        "Clerk authentication for secure sign-in",
                        "Chat interface with Claude AI",
                        "Google Calendar integration",
                        "Gmail integration",
                        "Asana task management integration",
                        "Customizable assistant name",
                        "Customizable assistant personality",
                        "Conversation history",
                      ].map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600 text-sm">
                          <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </span>
                      Integrations
                    </h3>
                    <ul className="space-y-2">
                      {[
                        { name: "Google Calendar", desc: "View and create calendar events" },
                        { name: "Gmail", desc: "Search and read emails" },
                        { name: "Asana", desc: "Manage tasks and projects" },
                      ].map((integration, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600 text-sm">
                          <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                          </svg>
                          <span><strong>{integration.name}:</strong> {integration.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Coming Soon */}
        <div className="mt-12 bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">More Updates Coming Soon</h3>
          <p className="text-gray-600">
            We&apos;re working hard on new features and improvements. Stay tuned for more updates!
          </p>
        </div>
      </div>
    </div>
  );
}
