import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

interface LocationState {
  redirectAfter?: boolean;
  originalUrl?: string;
  customSlug?: string;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);

      // Redirect based on state if available
      if (state?.redirectAfter && state.originalUrl) {
        // Store the values in variables to ensure they're not lost
        const originalUrlToPass = state.originalUrl;
        const customSlugToPass = state.customSlug;
        
        // Use a slight delay to ensure the navigation happens after the login state is fully updated
        setTimeout(() => {
          navigate('/', { 
            state: {
              originalUrl: originalUrlToPass,
              customSlug: customSlugToPass,
              fromLogin: true // Add a flag to indicate this is coming from login
            },
            replace: true // Replace the current entry in the history stack
          });
        }, 100);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white shadow rounded-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Log in to your account</h1>
            <p className="mt-2 text-gray-600">
              Or{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-500">
                create a new account
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 text-white rounded-md ${
                  loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
