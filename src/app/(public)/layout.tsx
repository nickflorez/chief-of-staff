import Link from "next/link";

function PublicNavigation() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Chief of Staff
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/docs" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Docs
            </Link>
            <Link href="/changelog" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Changelog
            </Link>
            <div className="w-px h-6 bg-gray-200" />
            <Link href="/sign-in" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
          {/* Mobile menu button - simplified version */}
          <div className="md:hidden">
            <Link
              href="/sign-up"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Chief of Staff
            </Link>
            <p className="mt-4 text-gray-600 max-w-md">
              Your personal AI executive assistant that connects to your Calendar, Gmail, and Asana to help you stay productive.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/sign-in" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Chief of Staff. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm">
            <Link href="/docs" className="text-gray-500 hover:text-gray-700 transition-colors">
              Privacy
            </Link>
            <Link href="/docs" className="text-gray-500 hover:text-gray-700 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNavigation />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
