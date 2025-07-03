import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import config from '../config';

interface Url {
  id: string;
  slug: string;
  originalUrl: string;
  visits: number;
  createdAt: string;
}

interface VisitData {
  date: string;
  count: number;
}

interface BrowserStats {
  name: string;
  count: number;
}

interface DeviceStats {
  type: string;
  count: number;
}

interface OsStats {
  name: string;
  count: number;
}

interface UrlAnalyticsModalProps {
  url: Url;
  isOpen: boolean;
  onClose: () => void;
}

const UrlAnalyticsModal: React.FC<UrlAnalyticsModalProps> = ({ url, isOpen, onClose }) => {
  const [visitData, setVisitData] = useState<VisitData[]>([]);
  const [browserStats, setBrowserStats] = useState<BrowserStats[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([]);
  const [osStats, setOsStats] = useState<OsStats[]>([]);
  const [timeFilter, setTimeFilter] = useState<string>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/urls/${url.slug}/analytics`, {
        params: { timeFilter },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVisitData(response.data.visitData);
      setBrowserStats(response.data.browserStats || []);
      setDeviceStats(response.data.deviceStats || []);
      setOsStats(response.data.osStats || []);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [url.slug, timeFilter, token]);

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen, url.slug, timeFilter, token, fetchAnalytics]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Analytics for:{' '}
              <span className="text-blue-600">
                {config.apiBaseUrl}/{url.slug}
              </span>
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500 truncate">
              Original URL:{' '}
              <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {url.originalUrl}
              </a>
            </p>
            <p className="text-sm text-gray-500">
              Short URL:{' '}
              <a href={`${config.shortUrlBase}/${url.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {new URL('/', config.shortUrlBase).host}/{url.slug}
              </a>
            </p>
            <p className="text-sm text-gray-500">
              Total visits: <span className="font-medium">{url.visits}</span>
            </p>
          </div>

          {/* Time filter selector */}
          <div className="mb-6">
            <label htmlFor="timeFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              id="timeFilter"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="day">Last 24 hours</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="year">Last 365 days</option>
            </select>
          </div>

          {error && (
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-yellow-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Visit History Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4">Visit History</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={visitData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [`${value} visits`, 'Visits']}
                        labelFormatter={(label) => {
                          const date = new Date(label);
                          return date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          });
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="count" name="Visits" stroke="#3B82F6" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Browser and Device Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Browser Stats */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Browser Distribution</h4>
                  <div className="h-64">
                    {browserStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={browserStats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                            label={({ name, percent }) => (percent ? `${name}: ${(percent * 100).toFixed(0)}%` : '')}
                          >
                            {browserStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} visits`, 'Visits']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No browser data available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Device Stats */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Device Distribution</h4>
                  <div className="h-64">
                    {deviceStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={deviceStats}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} visits`, 'Visits']} />
                          <Legend />
                          <Bar dataKey="count" name="Visits" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No device data available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* OS Stats */}
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Operating System Distribution</h4>
                  <div className="h-64">
                    {osStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={osStats}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip formatter={(value) => [`${value} visits`, 'Visits']} />
                          <Legend />
                          <Bar dataKey="count" name="Visits" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No OS data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlAnalyticsModal;
