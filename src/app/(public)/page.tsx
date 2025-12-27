import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Powered by Claude AI
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Your Personal AI
              <br />
              <span className="text-blue-600">Executive Assistant</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Chief of Staff connects to your Calendar, Gmail, and Asana to help you
              manage your day, stay on top of tasks, and communicate effectively.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/sign-up"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
              >
                Start Free Trial
              </Link>
              <Link
                href="/docs"
                className="border border-gray-300 bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Productive
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect your favorite tools and let AI handle the coordination
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Calendar Management</h3>
              <p className="text-gray-600 leading-relaxed">
                View your schedule, create events, and get intelligent meeting suggestions. Never miss an important appointment.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Email Handling</h3>
              <p className="text-gray-600 leading-relaxed">
                Search emails, get summaries, and draft responses with AI assistance. Save hours every week on email management.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Task Coordination</h3>
              <p className="text-gray-600 leading-relaxed">
                Manage Asana tasks, track projects, and stay organized. Your assistant prioritizes what matters most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes with a simple setup process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Create Account</h3>
              </div>
              <p className="text-gray-600 ml-14">
                Sign up with your email in seconds. No credit card required to start your free trial.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-5 left-[60%] w-[80%] h-0.5 bg-gray-200" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Connect Tools</h3>
              </div>
              <p className="text-gray-600 ml-14">
                Link your Google account for Calendar and Gmail, plus connect Asana for task management.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-5 left-[60%] w-[80%] h-0.5 bg-gray-200" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Start Chatting</h3>
              </div>
              <p className="text-gray-600 ml-14">
                Ask your assistant anything about your schedule, emails, or tasks. It learns and adapts to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Commands Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Natural Conversation, Powerful Results
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Just ask in plain English - no special commands needed
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "What meetings do I have today?",
              "Schedule a call with Sarah tomorrow at 3pm",
              "Show me my overdue tasks",
              "Search emails from Acme Corp this week",
              "Create a task to review the quarterly report",
              "What's my next free slot for a 30-minute meeting?",
            ].map((command, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-gray-700">&quot;{command}&quot;</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Boost Your Productivity?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who use Chief of Staff to manage their day more effectively.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors shadow-lg"
          >
            Get Started Free
          </Link>
          <p className="mt-4 text-blue-100 text-sm">
            No credit card required. Start your free trial today.
          </p>
        </div>
      </section>
    </>
  );
}
