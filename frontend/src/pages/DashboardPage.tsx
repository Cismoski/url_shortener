import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Header from '../components/Header';
import UrlTable from '../components/UrlTable';
import UrlAnalyticsModal from '../components/UrlAnalyticsModal';
import config from '../config';

interface Url {
  id: string;
  slug: string;
  originalUrl: string;
  visits: number;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<Url | null>(null);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const fetchUrls = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/urls`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUrls(response.data);
    } catch (err: any) {
      setError('Failed to fetch your URLs. Please try again.');
      console.error('Error fetching URLs:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchUrls();
  }, [isAuthenticated, navigate, fetchUrls]);

  const handleDeleteUrl = async (slug: string) => {
    try {
      await axios.delete(`${config.apiUrl}/urls/${slug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh the URL list
      fetchUrls();
    } catch (err: any) {
      console.error('Error deleting URL:', err);
      alert('Failed to delete URL. Please try again.');
    }
  };

  const handleViewAnalytics = (url: Url) => {
    setSelectedUrl(url);
    setIsAnalyticsModalOpen(true);
  };

  const closeAnalyticsModal = () => {
    setIsAnalyticsModalOpen(false);
    setSelectedUrl(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="flex">
        {/* Mobile sidebar */}
        <div className="md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="fixed z-20 bottom-4 right-4 p-2 rounded-full bg-blue-600 text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {sidebarOpen && (
            <>
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20" onClick={() => setSidebarOpen(false)} />
              <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white z-30">
                <div className="flex justify-end p-4">
                  <button onClick={() => setSidebarOpen(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Shortened URLs</h1>

            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <UrlTable urls={urls} onDelete={handleDeleteUrl} onViewAnalytics={handleViewAnalytics} />
            )}
          </div>
        </div>
      </div>

      {/* Analytics Modal */}
      {isAnalyticsModalOpen && selectedUrl && <UrlAnalyticsModal url={selectedUrl} isOpen={isAnalyticsModalOpen} onClose={closeAnalyticsModal} />}
    </div>
  );
};

export default DashboardPage;
