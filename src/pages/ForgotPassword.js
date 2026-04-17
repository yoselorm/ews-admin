import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Mail, KeyRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clearStatus, forgotPassword } from '../redux/AuthSlice';

const AdminForgotPassword = () => {
  const dispatch = useDispatch();
  
  const { loading, error, message } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');

  useEffect(() => {
    return () => dispatch(clearStatus());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await dispatch(forgotPassword(email));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <KeyRound size={32} className="text-purple-600" strokeWidth={2} />
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          {message ? "Check your email" : "Forgot password?"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 px-8">
          {message 
            ? `A recovery link has been sent to ${email}` 
            : "Enter your work email and we'll send you a link to reset your password."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          
          {/* Error Alert Box */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-center rounded-r-xl">
              <AlertCircle size={20} className="text-red-500 mr-3" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {!message ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Work Email Address
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
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition duration-200"
                    placeholder="admin@healthcare.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-emerald-50 p-4 rounded-full">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                Didn't receive the email? Check your spam folder or try another email address.
              </p>
              <button
                onClick={() => dispatch(clearStatus())}
                className="w-full py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition duration-200"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm font-semibold text-purple-600 hover:text-purple-500 transition duration-200"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;