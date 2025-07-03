# URL Shortener Project

A full-stack URL shortening application with analytics tracking, built with modern web technologies.

## Project Overview

This URL shortener application allows users to create shortened URLs with optional custom slugs, track visit analytics, and manage their shortened links through a user-friendly dashboard. The project is split into two main components:

1. **Frontend**: A React-based web application
2. **Backend**: A NestJS-based RESTful API

## Key Features

- **URL Shortening**: Create short, memorable links for any URL
- **Custom Slugs**: Optionally specify your own custom short URL slug
- **User Authentication**: Register and login to manage your shortened URLs
- **Analytics Dashboard**: Track visits with detailed statistics including:
  - Visit counts over time (day, week, month, year)
  - Browser usage
  - Device information
  - Operating system data
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend

- React with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API requests
- Recharts for data visualization

### Backend

- NestJS framework
- TypeScript
- Prisma ORM
- PostgreSQL database
- JWT authentication
- Swagger API documentation

## Project Structure

```
url-shortener/
├── frontend/               # React frontend application
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (e.g., AuthContext)
│   │   ├── pages/          # Page components
│   │   └── config.ts       # Environment configuration
│   └── README.md           # Frontend documentation
│
├── backend/                # NestJS backend API
│   ├── src/                # Source code
│   │   ├── auth/           # Authentication module
│   │   ├── urls/           # URL shortening module
│   │   └── users/          # User management module
│   ├── prisma/             # Database schema and migrations
│   └── README.md           # Backend documentation
│
└── README.md               # This file
```

## Getting Started

For detailed setup instructions, please refer to the README files in the respective frontend and backend directories:

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

## Development Workflow

1. Start the backend API server
2. Start the frontend development server
3. Access the application at http://localhost:3000

## Environment Configuration

Both the frontend and backend use environment variables for configuration:

- Frontend: `.env` file with `REACT_APP_API_BASE_URL`
- Backend: `.env` file with database connection, JWT settings, etc.

## License

MIT
