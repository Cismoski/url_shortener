import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Header from '../components/Header';
import config from '../config';

const HomePage: React.FC = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);

  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { originalUrl?: string; customSlug?: string };

  // Pre-fill form with data from state if available (after login/register redirect)
  useEffect(() => {
    console.log('HomePage received state:', state);
    if (state?.originalUrl) {
      setOriginalUrl(state.originalUrl);
      console.log('Setting originalUrl to:', state.originalUrl);
    }
    if (state?.customSlug) {
      setCustomSlug(state.customSlug);
      console.log('Setting customSlug to:', state.customSlug);
    }

    // Clear the location state after using it to prevent re-filling on refresh
    if (state?.originalUrl || state?.customSlug) {
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        navigate('/login', { state: { redirectAfter: true, originalUrl, customSlug } });
        return;
      }

      const response = await axios.post(
        `${config.apiUrl}/urls`,
        {
          originalUrl,
          customSlug: customSlug || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setShortenedUrl(`${config.shortUrlBase}/${response.data.slug}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to shorten URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shorten Your Long URLs</h1>
          <p className="text-xl text-gray-600">Create memorable, short links that redirect to your long URLs</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-1">
                URL to Shorten
              </label>
              <input
                type="url"
                id="originalUrl"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="customSlug" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Slug (Optional)
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">{config.shortUrlBase}/</span>
                <input
                  type="text"
                  id="customSlug"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="my-custom-slug"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">Leave empty for an auto-generated slug</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !originalUrl}
              className={`w-full py-3 px-6 text-white rounded-md ${
                loading || !originalUrl ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </form>

          {shortenedUrl && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 font-medium mb-2">Your shortened URL:</p>
              <div className="flex items-center">
                <input type="text" value={shortenedUrl} readOnly className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none" />
                <button
                  onClick={handleCopyToClipboard}
                  className="ml-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800">
                <a href="/login" className="font-medium underline">
                  Log in
                </a>{' '}
                or{' '}
                <a href="/register" className="font-medium underline">
                  register
                </a>{' '}
                to track and manage your shortened URLs.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
