export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-white dark:bg-gray-900 dark:border-gray-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-blue-600">JobFinder</span>
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">Beta</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              A smart job search tracker that helps you organise applications,
              match with the right roles, and land your dream job faster.
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="text-gray-500 dark:text-gray-400">Built with</span>
              <span className="text-red-500">♥</span>
              <span>by</span>
              <span className="font-semibold text-gray-700 dark:text-gray-200">Sagar Haldar</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Product
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Dashboard",    href: "/dashboard" },
                { label: "Job Board",    href: "/jobs" },
                { label: "Applications", href: "/applications" },
                { label: "Resume",       href: "/resume" },
                { label: "Profile",      href: "/profile" },
              ].map((link) => (
                <a key={link.label} href={link.href}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Built With
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Next.js 14",    href: "https://nextjs.org" },
                { label: "Tailwind CSS",  href: "https://tailwindcss.com" },
                { label: "MongoDB Atlas", href: "https://www.mongodb.com/atlas" },
                { label: "shadcn/ui",     href: "https://ui.shadcn.com" },
                { label: "Cloudinary",    href: "https://cloudinary.com" },
              ].map((link) => (
                <a key={link.label} href={link.href}
                  target="_blank" rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors w-fit">
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t dark:border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-1 text-xs text-gray-400 dark:text-gray-500 text-center md:text-left">
            <span>© {currentYear} Sagar Haldar. All rights reserved.</span>
            <span className="hidden md:block">·</span>
            <span>JobFinder is a personal project. Not affiliated with any job board.</span>
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="hover:text-gray-600 cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span>·</span>
            <span className="hover:text-gray-600 cursor-pointer transition-colors">
              Terms of Use
            </span>
            <span>·</span>
            <a href="https://github.com/sagarhaldar" target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>

        </div>
      </div>
    </footer>
  )
}