# URL Shortener API

A robust and scalable URL shortening API built with NestJS, TypeScript, Prisma, and PostgreSQL. This backend service provides all the necessary endpoints for creating, managing, and tracking shortened URLs with detailed analytics.

## Features

- **URL Shortening**: Create short URLs with automatic or custom slugs
- **User Authentication**: JWT-based authentication for secure access
- **URL Management**: Create, read, update, and delete shortened URLs
- **Visit Tracking**: Track each visit to shortened URLs
- **Detailed Analytics**: Collect and analyze visit data including:
  - Visit counts over time (day, week, month, year)
  - Browser statistics
  - Device information
  - Operating system data
- **Rate Limiting**: Prevent abuse with built-in rate limiting
- **API Documentation**: Comprehensive Swagger documentation
- **Input Validation**: Robust validation for all API inputs

## Tech Stack

- **NestJS**: Progressive Node.js framework
- **TypeScript**: Type-safe JavaScript
- **Prisma**: Next-generation ORM
- **PostgreSQL**: Relational database
- **JWT**: JSON Web Tokens for authentication
- **Swagger**: API documentation
- **Jest**: Testing framework
- **ua-parser-js**: User agent parsing for analytics

## Prerequisites

- Node.js (v22 or higher)
- npm or yarn
- PostgreSQL database

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables by creating a `.env` file in the root directory:

```
DATABASE_URL="postgresql://username:password@localhost:5432/url_shortener?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="1d"
PORT=8080
```

4. Run Prisma migrations to set up your database:

```bash
npx prisma migrate dev
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:8080` by default.

## API Documentation

Swagger documentation is available at `/swagger` when the application is running. This provides a comprehensive and interactive way to explore and test all available endpoints.

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/users/register` - User registration

### URL Management

- `POST /api/urls` - Create a shortened URL
- `GET /api/urls` - List all URLs for authenticated user
- `GET /api/urls/:slug` - Get details of a specific URL
- `PUT /api/urls/:slug` - Update a URL
- `DELETE /api/urls/:slug` - Delete a URL

### URL Redirection

- `GET /:slug` - Redirect to the original URL

### Analytics

- `GET /api/urls/:slug/analytics` - Get analytics for a specific URL
  - Query parameters:
    - `timeFilter`: day, week, month, year, or custom
    - `startDate` & `endDate`: For custom time range

## Database Schema

The application uses the following main entities:

- **User**: Stores user information and authentication details
- **Url**: Stores shortened URLs with their original URLs and slugs
- **UrlVisit**: Tracks visits to shortened URLs with analytics data

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation for all endpoints
- CORS configuration for frontend integration

## Deployment

This API can be deployed to any Node.js hosting platform. Make sure to set the appropriate environment variables for your production environment.

Recommended deployment options:

- Docker containers
- AWS Elastic Beanstalk
- Heroku
- Digital Ocean App Platform

## License

MIT
