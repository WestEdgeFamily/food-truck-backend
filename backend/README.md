# Food Truck App Backend

This is the backend server for the Utah Food Truck Finder application. It provides RESTful APIs for managing food trucks, users, reviews, and recommendations.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/food-truck-app
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```
5. Start MongoDB service
6. Seed the database with sample data:
   ```bash
   npm run seed
   ```
7. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Users
- GET /api/users - Get all users (admin only)
- GET /api/users/:id - Get user by ID
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

### Trucks
- GET /api/trucks - Get all trucks
- GET /api/trucks/:id - Get truck by ID
- POST /api/trucks - Create new truck
- PUT /api/trucks/:id - Update truck
- DELETE /api/trucks/:id - Delete truck
- GET /api/trucks/owner/trucks - Get owner's trucks
- PUT /api/trucks/:id/location - Update truck location
- PUT /api/trucks/:id/schedule - Update truck schedule

### Reviews
- GET /api/reviews/truck/:truckId - Get reviews for a truck
- GET /api/reviews/user - Get user's reviews
- POST /api/reviews - Create review
- PUT /api/reviews/:id - Update review
- DELETE /api/reviews/:id - Delete review
- POST /api/reviews/:id/like - Like/Unlike review

### Recommendations
- GET /api/recommendations - Get personalized recommendations
- GET /api/recommendations/nearby - Get nearby trucks
- GET /api/recommendations/trending - Get trending trucks
- GET /api/recommendations/new - Get new trucks

## Development

- Run tests:
  ```bash
  npm test
  ```
- Run in development mode with hot reload:
  ```bash
  npm run dev
  ```

## Production

- Build and start the server:
  ```bash
  npm start
  ```

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:
```json
{
  "message": "Error message here"
}
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 