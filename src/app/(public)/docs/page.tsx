export default function DocsPage() {
  return (
    <div className="py-12">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
        <p className="text-xl text-gray-600">
          Everything you need to get started with Chief of Staff
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Getting Started */}
          <section className="scroll-mt-20" id="getting-started">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Getting Started
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <p className="text-gray-700 mb-4">
                Chief of Staff is your personal AI executive assistant that connects to your
                productivity tools to help you manage your day more effectively.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Create an account or sign in</li>
                <li>Connect your integrations (Google, Asana)</li>
                <li>Start chatting with your assistant</li>
              </ol>
            </div>
          </section>

          {/* Setting Up Integrations */}
          <section className="scroll-mt-20" id="integrations">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              Setting Up Integrations
            </h2>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google (Calendar & Gmail)
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Go to <span className="font-medium">Settings &gt; Integrations</span></li>
                  <li>Click &quot;Connect Google Account&quot;</li>
                  <li>Grant the requested permissions for Calendar and Gmail</li>
                  <li>Your assistant can now access your calendar and email</li>
                </ol>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Asana
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Go to <span className="font-medium">Settings &gt; Integrations</span></li>
                  <li>Click &quot;Connect Asana&quot;</li>
                  <li>Authorize the connection in Asana</li>
                  <li>Your assistant can now manage your tasks and projects</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Customizing Your Assistant */}
          <section className="scroll-mt-20" id="customization">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              Customizing Your Assistant
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <p className="text-gray-700 mb-4">
                You can customize your assistant&apos;s name and personality in the Settings page.
                Give your assistant a name that feels right for you.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><span className="font-medium">Name:</span> Choose a custom name for your assistant</li>
                <li><span className="font-medium">Personality:</span> Adjust how formal or casual your assistant responds</li>
              </ul>
            </div>
          </section>

          {/* Example Commands */}
          <section className="scroll-mt-20" id="commands">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              Example Commands
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { category: "Calendar", commands: ["What's on my calendar today?", "Schedule a meeting with John tomorrow at 2pm", "When is my next meeting?"] },
                { category: "Email", commands: ["Search my emails for the contract from Acme Corp", "Do I have any unread emails?", "Show me emails from this week"] },
                { category: "Tasks", commands: ["Show me my overdue tasks", "Create a task to review the quarterly report", "What are my tasks for today?"] },
                { category: "General", commands: ["What's my schedule looking like this week?", "When am I free for a 30-minute call?", "Help me plan my day"] },
              ].map((section, index) => (
                <div key={index} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-3">{section.category}</h4>
                  <ul className="space-y-2">
                    {section.commands.map((cmd, cmdIndex) => (
                      <li key={cmdIndex} className="text-gray-600 text-sm flex items-start gap-2">
                        <span className="text-blue-500 mt-1">&bull;</span>
                        &quot;{cmd}&quot;
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="scroll-mt-20" id="faq">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  question: "Is my data secure?",
                  answer: "Yes, your data is encrypted and we follow industry-standard security practices. We only access the data you explicitly grant permission for through integrations."
                },
                {
                  question: "Which Google permissions are required?",
                  answer: "We request access to Google Calendar (to view and create events) and Gmail (to search and read emails). You can revoke these permissions at any time."
                },
                {
                  question: "Can I use Chief of Staff without connecting integrations?",
                  answer: "Yes, you can chat with your assistant without any integrations. However, connecting integrations enables the full power of the assistant to help manage your day."
                },
                {
                  question: "How do I disconnect an integration?",
                  answer: "Go to Settings > Integrations and click the 'Disconnect' button next to any connected integration. You can reconnect at any time."
                },
                {
                  question: "Is there a mobile app?",
                  answer: "Currently, Chief of Staff is a web application optimized for both desktop and mobile browsers. A native mobile app is on our roadmap."
                },
                {
                  question: "Can I change my assistant's name?",
                  answer: "Yes! Go to Settings and you can customize your assistant's name to whatever you prefer."
                },
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
