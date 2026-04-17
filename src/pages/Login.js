import React, { useEffect, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearStatus, loginAdmin } from '../redux/AuthSlice';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        return () => dispatch(clearStatus());
    }, [isAuthenticated, navigate, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const resultAction = await dispatch(loginAdmin({ email, password }));
        if (loginAdmin.fulfilled.match(resultAction)) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo / Icon */}
                <div className="flex justify-center">
                    <div className="bg-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-200">
                        <ShieldCheck size={40} color="white" strokeWidth={2.5} />
                    </div>
                </div>

                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    EWS Admin Portal
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Secure access for healthcare administrators
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>

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
                                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition duration-200 text-slate-900"
                                    placeholder="admin@healthcare.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700">
                                Password
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-12 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition duration-200 text-slate-900"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-purple-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                {/* <input
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
                />
                <label className="ml-2 block text-sm text-slate-600">
                  Remember me
                </label> */}
                            </div>

                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-purple-600 hover:text-purple-500">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin mr-2" size={20} />
                            ) : (
                                "Sign In to Dashboard"
                            )}
                        </button>
                    </form>

                    {/* Footer Petty Info */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-xs text-center text-slate-400">
                            Authorized Personnel Only. All activities are logged and monitored for security purposes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;