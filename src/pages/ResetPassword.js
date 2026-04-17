import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { clearStatus, resetPassword } from '../redux/AuthSlice';

const AdminResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { loading, error, message } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    token: searchParams.get('token') || '',
    email: searchParams.get('email') || '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    return () => dispatch(clearStatus());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      // You could dispatch a local error here if you want
      return; 
    }
    
    await dispatch(resetPassword(formData));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-200">
            <ShieldCheck size={40} color="white" strokeWidth={2.5} />
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 px-8">
          Your new password must be different from previously used passwords.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-center rounded-r-xl">
              <AlertCircle size={20} className="text-red-500 mr-3" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {!message ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">New Password</label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="block w-full pl-11 pr-12 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple-600 outline-none transition duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Confirm New Password</label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple-600 outline-none transition duration-200"
                    placeholder="••••••••"
                  />
                </div>
                {formData.password_confirmation && formData.password !== formData.password_confirmation && (
                  <p className="mt-2 text-xs text-red-500 font-medium italic">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || formData.password !== formData.password_confirmation}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none transition duration-200 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : "Reset Password"}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-emerald-50 p-4 rounded-full">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Password reset successful</h3>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                Your password has been updated. You can now log in with your new credentials.
              </p>
              <Link
                to="/login"
                className="block w-full py-3.5 px-4 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition duration-200 text-center shadow-md shadow-purple-100"
              >
                Continue to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminResetPassword;