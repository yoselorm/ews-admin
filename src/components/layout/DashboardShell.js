import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, Settings,
    Bell, LogOut, Menu, X, ShieldCheck, ChevronRight,
    Loader2, CloudSun, Gauge, Globe,
    Languages,
    Music,
    UserStar
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAdmin } from '../../redux/AuthSlice';

const DashboardShell = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { admin, loading } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        try {
            await dispatch(logoutAdmin()).unwrap();
            navigate('/');
        } catch (error) {
            console.error("Logout failed:", error);
            navigate('/');
        }
    };

    const menuItems = [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Weather Data', path: '/dashboard/weather-data', icon: CloudSun },
        { name: 'Thresholds', path: '/dashboard/thresholds', icon: Gauge },
        { name: 'Precautions', path: '/dashboard/precautions', icon: ShieldCheck }, 
        { name: 'Safety Guides', path: '/dashboard/safety-guides', icon: ClipboardList },
        { name: 'Geography', path: '/dashboard/geography', icon: Globe },
        { name: 'Users', path: '/dashboard/users', icon: Users },
        { name: 'Alerts', path: '/dashboard/alerts', icon: Bell },
        { name: 'Languages', path: '/dashboard/languages', icon: Languages },
        { name: 'Audio Translations', path: '/dashboard/audio-translations', icon: Music },
        { name: 'Admin Management', path: '/dashboard/admin', icon: UserStar }
    ];

    return (
        /* FIX 1: Set h-screen and overflow-hidden on the wrapper */
        <div className="h-screen bg-slate-50 flex overflow-hidden">
            
            {/* --- SIDEBAR --- */}
            {/* FIX 2: Ensure h-full is set so the sidebar occupies the full locked height */}
            <aside
                className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col h-full ${
                    isSidebarOpen ? 'w-64' : 'w-20'
                }`}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-purple-600 p-2 rounded-xl">
                        <ShieldCheck size={24} color="white" />
                    </div>
                    {isSidebarOpen && (
                        <span className="text-xl font-bold text-slate-900 truncate">AdminHQ</span>
                    )}
                </div>

                {/* Sidebar links now scroll internally if they are too many, but don't move the sidebar itself */}
                <nav className="flex-1 px-4 mt-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center p-3 rounded-xl transition-all group ${
                                    isActive
                                        ? 'bg-purple-50 text-purple-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <Icon size={22} className={isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-900'} />
                                {isSidebarOpen && (
                                    <span className="ml-3 font-semibold text-sm">{item.name}</span>
                                )}
                                {isActive && isSidebarOpen && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-600" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className={`w-full flex items-center p-3 rounded-xl transition-all ${
                            loading
                                ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400'
                                : 'text-red-500 hover:bg-red-50'
                        }`}
                    >
                        {loading ? <Loader2 size={22} className="animate-spin" /> : <LogOut size={22} />}
                        {isSidebarOpen && (
                            <span className="ml-3 font-bold text-sm">
                                {loading ? "Logging out..." : "Logout"}
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            {/* FIX 3: flex-1 h-full overflow-hidden ensures the header stays at the top */}
            <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                
                {/* Header: Fixed at the top */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="text-right mr-2 hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">{admin?.first_name} {admin?.last_name}</p>
                            <p className="text-xs text-slate-400 capitalize">{admin?.roles?.[0] || 'Administrator'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 items-center justify-center flex">
                            <span className="text-purple-700 font-bold">{admin?.first_name?.[0]}</span>
                        </div>
                    </div>
                </header>

                {/* FIX 4: Only the Outlet container is allowed to scroll */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardShell;