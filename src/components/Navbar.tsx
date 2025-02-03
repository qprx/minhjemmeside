import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface NavbarProps {
    user: any;
    isAdmin: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, isAdmin }) => {
    const handleLogout = async () => {
        // Simpel logud-funktionalitet
        window.location.href = '/api/auth/logout';
    };


   

    return (
        <nav className="bg-black bg-opacity-50 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold">
                            <Image src="/logoer/logo.png" alt="Logo" width={60} height={60} />
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link href="/regler" className="hover:text-gray-300">Regler</Link>
                            <Link href="https://discord.gg/Es8GCRGcvV" className="hover:text-gray-300">Discord</Link>
                            {user && (
                                <Link href="/ansogninger" className="hover:text-gray-300">Ansøgninger</Link>
                            )}
                            {isAdmin && (
                                <Link href="/admin" className="hover:text-gray-300">Admin</Link>
                            )}
                            {user ? (
                                // Hvis brugeren er logget ind, vis en Log ud-knap
                                <Button
                                    onClick={handleLogout}
                                    className="bg-gray-700 text-white hover:bg-red-500"
                                >
                                    Log ud
                                </Button>
                            ) : (
                                // Hvis brugeren ikke er logget ind, vis Log på-knap
                                <Link href="/api/auth/login">
                                    <Button className="bg-red-500 text-white hover:bg-red-600">
                                        Log på
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;
