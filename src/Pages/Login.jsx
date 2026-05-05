import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import AuthInput from '../Components/AuthInput';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern p-4">
      <div className="bg-white/30 backdrop-blur-sm rounded-3xl shadow-xl w-full max-w-md p-8 sm:p-10 border border-white/20">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-wide mb-2">CHAT APP</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button 
            onClick={() => navigate('/signup')}
            className="flex-1 pb-2 text-sm font-medium text-gray-500 hover:text-gray-700 pt-2 transition-colors cursor-pointer"
          >
            Sign up
          </button>
          <button className="flex-1 pb-2 text-sm font-medium border-b-2 border-brand-primary text-gray-900 bg-gray-100 rounded-t-lg pt-2 cursor-pointer">
            Login
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="mb-4 text-sm text-red-500 text-center">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <AuthInput 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthInput 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-brand-primary hover:bg-[#6853e0] text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-70 cursor-pointer"
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
