import React, { useEffect, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearStatus, loginAdmin } from '../redux/AuthSlice';
import toast from '../components/Toast';
import logo from '../assets/logo.png';
import logoWhite from '../assets/logo-white.png';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        return () => dispatch(clearStatus());
    }, [isAuthenticated, navigate, dispatch]);

const handleSubmit = async (e) => {
    e.preventDefault();
        if (!email || !password) {
        toast.warning("Please enter both email and password");
        return;
    }

    const resultAction = await dispatch(loginAdmin({ email, password }));

    if (loginAdmin.fulfilled.match(resultAction)) {
        toast.success("Welcome back! Login successful.");
        navigate('/dashboard');
    } else {
        const errorMessage = resultAction.payload || "Invalid credentials. Please try again.";
        toast.error(errorMessage);
    }
};
    return (
        <div className="min-h-screen flex bg-white">
            {/* Form half */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 xl:px-24">
                <div className="w-full max-w-md mx-auto">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="EWS logo" className="w-11 h-11" />
                        <span className="text-lg font-bold text-brand-700">EWS Admin</span>
                    </div>

                    <h2 className="mt-10 text-3xl font-extrabold text-slate-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Sign in to manage alerts, thresholds and health guidance.
                    </p>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700">
                                Email Address
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition duration-200 text-slate-900"
                                    placeholder="admin@healthcare.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Password
                                </label>
                                <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-500">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-12 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition duration-200 text-slate-900"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-brand-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-brand-200 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition duration-200 disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin mr-2" size={20} />
                            ) : (
                                "Sign In to Dashboard"
                            )}
                        </button>
                    </form>

                    <p className="mt-10 text-xs text-slate-400">
                        Authorized Personnel Only. All activities are logged and monitored for security purposes.
                    </p>
                </div>
            </div>

            {/* Brand half */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-950 items-center justify-center p-12">
                {/* Decorative rings echoing the logo's circle */}
                <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full border-[3rem] border-white/5" />
                <div className="absolute -bottom-40 -left-24 w-[34rem] h-[34rem] rounded-full border border-white/10" />
                <div className="absolute bottom-16 right-20 w-40 h-40 rounded-full bg-brand-400/20 blur-3xl" />

                <div className="relative max-w-md text-center">
                    <div className="mx-auto w-56 h-56 rounded-full bg-white/5 ring-1 ring-white/15 flex items-center justify-center backdrop-blur-sm">
                        <img src={logoWhite} alt="" className="w-40 h-40" />
                    </div>
                    <h1 className="mt-10 text-3xl font-extrabold text-white tracking-tight">
                        Early Warning System
                    </h1>
                    <p className="mt-4 text-brand-100/80 leading-relaxed">
                        Timely climate alerts and health guidance that keep mothers and their babies safe.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;