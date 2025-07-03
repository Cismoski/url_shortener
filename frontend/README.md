# URL Shortener Frontend

A modern, responsive URL shortening application built with React, TypeScript, and Tailwind CSS. This frontend application works in conjunction with the NestJS backend API to provide a complete URL shortening service with analytics tracking.

## Features

- **URL Shortening**: Create short, memorable links for any URL
- **Custom Slugs**: Optionally specify your own custom short URL slug
- **User Authentication**: Register and login to manage your shortened URLs
- **Dashboard**: View, manage, and analyze all your shortened URLs
- **Analytics**: Track visits to your shortened URLs with detailed analytics
  - Visit counts over time (day, week, month, year)
  - Browser and device statistics
  - Operating system usage data
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React**: UI library for building the user interface
- **TypeScript**: Type-safe JavaScript for better developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Router**: For client-side routing
- **Axios**: For API requests
- **Recharts**: For data visualization in analytics
- **Context API**: For state management (authentication)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see the backend README for setup instructions)

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

4. Create a `.env` file in the root directory with the following content:

```
REACT_APP_API_BASE_URL=http://localhost:8080
```

Adjust the URL if your backend is running on a different host/port.

### Running the Application

```bash
npm start
# or
yarn start
```

This will start the development server on [http://localhost:3000](http://localhost:3000).

## Environment Configuration

The application uses environment variables for configuration:

- `REACT_APP_API_BASE_URL`: The base URL of the backend API (default: http://localhost:8080)

These variables are used in `src/config.ts` to derive other URLs used throughout the application.

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # React contexts (e.g., AuthContext)
├── pages/            # Page components
├── types/            # TypeScript type definitions
├── config.ts         # Environment configuration
├── App.tsx           # Main application component
└── index.tsx         # Application entry point
```

## Authentication Flow

The application implements a complete authentication flow:

1. Users can register with email, password, and full name
2. Login with email and password
3. JWT tokens are stored in localStorage for persistent sessions
4. Protected routes redirect unauthenticated users to login
5. When redirected to login, the original URL and custom slug inputs are preserved

## Building for Production

```bash
npm run build
# or
yarn build
```

This creates an optimized production build in the `build` folder that can be deployed to any static hosting service.

## License

MIT