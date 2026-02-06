export default function Footer() {
  return (
    <footer className="bg-white dark:bg-dark-secondary border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Taskorium
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A powerful project management tool to help teams collaborate and
              achieve their goals efficiently.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/projects"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  href="/timeline"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Timeline
                </a>
              </li>
              <li>
                <a
                  href="/teams"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Teams
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Contact
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Have questions? Reach out to us.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              support@taskorium.com
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Taskorium. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
