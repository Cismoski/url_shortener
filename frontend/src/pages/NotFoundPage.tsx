import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
              Page not found
            </h1>
            <p className="mt-4 text-base text-gray-500">
              Sorry, we couldn't find the page you're looking for.
            </p>
            <div className="mt-10">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
