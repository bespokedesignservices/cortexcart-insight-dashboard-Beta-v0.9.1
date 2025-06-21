import Link from 'next/link';
import {
    HomeIcon,
    UsersIcon,
    DocumentTextIcon,
    PencilSquareIcon, // Already here, perfect for the blog
    ChartBarIcon,
    CreditCardIcon,
    ArrowRightEndOnRectangleIcon,
} from '@heroicons/react/24/outline';

const adminNavLinks = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'User Management', href: '/admin/users', icon: UsersIcon },
    { name: 'CMS', href: '/admin/cms', icon: DocumentTextIcon },
    { name: 'Blog', href: '/admin/blog', icon: PencilSquareIcon }, // This line is correct
    { name: 'User Stats', href: '/admin/stats', icon: ChartBarIcon },
    { name: 'Subscription Plans', href: '/admin/plans', icon: CreditCardIcon },
];

export default function AdminLayout({ children }) {
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex-shrink-0 bg-gray-800 p-4 flex flex-col text-white">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">CortexCart</h1>
                    <span className="text-sm text-gray-400">Super Admin Panel</span>
                </div>
                <nav className="flex-grow">
                    <ul className="space-y-2">
                        {adminNavLinks.map((link) => (
                            <li key={link.name}>
                                <Link href={link.href}>
                                    <div className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors">
                                        <link.icon className="h-6 w-6 mr-3" />
                                        <span>{link.name}</span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="mt-auto">
                     <Link href="/api/auth/signout">
                        <div className="w-full flex items-center justify-center p-2 bg-gray-700 rounded-lg hover:bg-red-600 transition-colors">
                            <ArrowRightEndOnRectangleIcon className="h-6 w-6 mr-3" />
                            <span>Sign Out</span>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
