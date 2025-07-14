# Thoughts API

This is the backend API for the Thoughts application, a platform for sharing your thoughts with the world.

## Features

*   User authentication (signup, login, logout)
*   Create, read, update, and delete posts
*   Follow and unfollow other users
*   Like and unlike posts
*   Reply to posts

## Technologies Used

*   **Node.js:** JavaScript runtime environment
*   **Express:** Web framework for Node.js
*   **MongoDB:** NoSQL database
*   **Mongoose:** Object Data Modeling (ODM) library for MongoDB
*   **JWT:** JSON Web Tokens for authentication
*   **Cloudinary:** Cloud-based image and video management
*   **Multer:** Middleware for handling `multipart/form-data`
*   **Bcrypt:** Library for hashing passwords
*   **Cookie-parser:** Middleware for parsing cookies
*   **Cors:** Middleware for enabling Cross-Origin Resource Sharing
*   **Dotenv:** Module for loading environment variables from a `.env` file

## Getting Started

### Prerequisites

*   Node.js (v18.x or higher)
*   pnpm (or your preferred package manager)
*   MongoDB instance (local or cloud-based)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/thoughts.git
    ```

2.  Navigate to the backend directory:

    ```bash
    cd thoughts/backend
    ```

3.  Install the dependencies:

    ```bash
    pnpm install
    ```

4.  Create a `.env` file in the root of the `backend` directory and add the following environment variables:

    ```env
    PORT=10000
    CORS=http://localhost:11000
    MONGO_URI=<your_mongodb_uri>
    DB_NAME=<your_database_name>
    ACCESS_TOKEN_SECRATE=<your_access_token_secret>
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
    REFRESH_TOKEN_EXPIRY=10d
    CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
    CLOUDINARY_API_KEY=<your_cloudinary_api_key>
    CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
    ```

### Running the Server

*   **Development:**

    ```bash
    pnpm run dev
    ```

*   **Production:**

    ```bash
    pnpm start
    ```

The server will start on `http://localhost:10000`.

## API Endpoints

The following are the available API endpoints:

*   **Users:** `/api/v1/users`
*   **Posts:** `/api/v1/posts`
*   **Followers:** `/api/v1/followers`
*   **Likes:** `/api/v1/likes`
*   **Replies:** `/api/v1/replies`

For detailed information about the available routes for each endpoint, please refer to the `src/routes` directory.

## Project Structure

```
.
├── src
│   ├── app.js
│   ├── controllers
│   │   ├── follower.controller.js
│   │   ├── like.controller.js
│   │   ├── post.controller.js
│   │   ├── reply.controller.js
│   │   └── user.controller.js
│   ├── db
│   │   └── index.js
│   ├── index.js
│   ├── middleware
│   │   ├── auth.middleware.js
│   │   └── multer.middleware.js
│   ├── models
│   │   ├── follower.model.js
│   │   ├── like.model.js
│   │   ├── post.model.js
│   │   ├── reply.model.js
│   │   └── user.model.js
│   ├── routes
│   │   ├── follower.routes.js
│   │   ├── like.routes.js
│   │   ├── post.routes.js
│   │   ├── reply.routes.js
│   │   └── user.routes.js
│   └── utils
│       ├── ApiError.js
│       ├── ApiResponse.js
│       ├── asyncHandler.js
│       ├── cloudinary.js
│       └── genrateTokens.js
├── .env.example
├── .gitignore
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
