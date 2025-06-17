import React from 'react';

export default function Footer() {
  const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center -mx-5 -my-2">
          {footerLinks.map((link) => (
            <div key={link.name} className="px-5 py-2">
              <a href={link.href} className="text-sm text-gray-500 hover:text-gray-900">
                {link.name}
              </a>
            </div>
          ))}
        </nav>
        <p className="mt-6 text-center text-xs text-gray-400">
          &copy; 2025 CortexCart v0.9.1 Beta Pre-Release 1. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
