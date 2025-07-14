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

### User API

**Register a new user**

*   **URL:** `/api/v1/users/register`
*   **Method:** `POST`
*   **Body:**

```json
{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "password123",
    "fullName": "Test User"
}
```

*   **Response:**

```json
{
    "statusCode": 200,
    "data": {
        "username": "testuser",
        "email": "testuser@example.com",
        "fullName": "Test User",
        "avatar": "http://res.cloudinary.com/...",
        "coverImage": "http://res.cloudinary.com/...",
        "_id": "...",
        "createdAt": "...",
        "updatedAt": "..."
    },
    "message": "User created successfully",
    "success": true
}
```

**Login a user**

*   **URL:** `/api/v1/users/login`
*   **Method:** `POST`
*   **Body:**

```json
{
    "email": "testuser@example.com",
    "password": "password123"
}
```

*   **Response:**

```json
{
    "statusCode": 200,
    "data": {
        "username": "testuser",
        "email": "testuser@example.com",
        "fullName": "Test User",
        "avatar": "http://res.cloudinary.com/...",
        "coverImage": "http://res.cloudinary.com/...",
        "_id": "...",
        "createdAt": "...",
        "updatedAt": "..."
    },
    "message": "Logged in successfully",
    "success": true
}
```

**Logout a user**

*   **URL:** `/api/v1/users/logout`
*   **Method:** `POST`
*   **Response:**

```json
{
    "statusCode": 200,
    "data": {},
    "message": "Logged out successfully",
    "success": true
}
```

**Change user password**

*   **URL:** `/api/v1/users/change-password`
*   **Method:** `POST`
*   **Body:**

```json
{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
}
```

*   **Response:**

```json
{
    "statusCode": 200,
    "data": {},
    "message": "Password updated successfully",
    "success": true
}
```

**Refresh access token**

*   **URL:** `/api/v1/users/refreshtokens`
*   **Method:** `POST`
*   **Response:**

```json
{
    "statusCode": 200,
    "data": {
        "username": "testuser",
        "email": "testuser@example.com",
        "fullName": "Test User",
        "avatar": "http://res.cloudinary.com/...",
        "coverImage": "http://res.cloudinary.com/...",
        "_id": "...",
        "createdAt": "...",
        "updatedAt": "..."
    },
    "message": "Tokens refreshed",
    "success": true
}
```

**Get user details**

*   **URL:** `/api/v1/users/:username`
*   **Method:** `GET`
*   **Response:**

```json
{
    "statusCode": 200,
    "data": [
        {
            "_id": "...",
            "username": "testuser",
            "fullName": "Test User",
            "bio": "This is a test user.",
            "avatar": "http://res.cloudinary.com/...",
            "coverImage": "http://res.cloudinary.com/...",
            "followers": 0,
            "following": 0,
            "isFollowing": false
        }
    ],
    "message": "User details fetched successfully.",
    "success": true
}
```

**Update user avatar**

*   **URL:** `/api/v1/users/update-avatar`
*   **Method:** `PATCH`
*   **Body:** `multipart/form-data` with a single field `avatar` containing the image file.
*   **Response:**

```json
{
    "statusCode": 200,
    "data": {
        "username": "testuser",
        "email": "testuser@example.com",
        "fullName": "Test User",
        "avatar": "http://res.cloudinary.com/...",
        "coverImage": "http://res.cloudinary.com/...",
        "_id": "...",
        "createdAt": "...",
        "updatedAt": "..."
    },
    "message": "Avatar changed",
    "success": true
}
```

**Update user cover image**

*   **URL:** `/api/v1/users/update-coverImage`
*   **Method:** `PATCH`
*   **Body:** `multipart/form-data` with a single field `coverImage` containing the image file.
*   **Response:**

```json
{
    "statusCode": 200,
    "data": {
        "username": "testuser",
        "email": "testuser@example.com",
        "fullName": "Test User",
        "avatar": "http://res.cloudinary.com/...",
        "coverImage": "http://res.cloudinary.com/...",
        "_id": "...",
        "createdAt": "...",
        "updatedAt": "..."
    },
    "message": "cover Image changed",
    "success": true
}
```

**Update user details**

*   **URL:** `/api/v1/users/update-user`
*   **Method:** `PATCH`
*   **Body:**

```json
{
    "username": "newtestuser",
    "fullName": "New Test User",
    "bio": "This is the new bio."
}
```

*   **Response:**

```json
{
    "statusCode": 200,
    "data": {
        "username": "newtestuser",
        "email": "testuser@example.com",
        "fullName": "New Test User",
        "avatar": "http://res.cloudinary.com/...",
        "coverImage": "http://res.cloudinary.com/...",
        "_id": "...",
        "createdAt": "...",
        "updatedAt": "..."
    },
    "message": "User data updated.",
    "success": true
}
```

### Post API

**Add a new post**

*   **URL:** `/api/v1/posts/add`
*   **Method:** `POST`
*   **Body:** `multipart/form-data` with fields `content` (text) and `media` (up to 5 files).

*   **Response:**

```json
{
    "statusCode": 201,
    "data": {
        "content": "This is a new post.",
        "media": [
            {
                "mediaUrl": "http://res.cloudinary.com/..."
            }
        ],
        "owner": "...",
        "_id": "...",
        "createdAt": "...",
        "updatedAt": "..."
    },
    "message": "Post created successfully",
    "success": true
}
```

**Delete a post**

*   **URL:** `/api/v1/posts/delete`
*   **Method:** `DELETE`
*   **Body:**

```json
{
    "postId": "..."
}
```

*   **Response:**

```json
{
    "statusCode": 200,
    "data": {},
    "message": "Post deleted successfully",
    "success": true
}
```

**Get user posts**

*   **URL:** `/api/v1/posts/:username`
*   **Method:** `GET`
*   **Response:**

```json
{
    "statusCode": 200,
    "data": [
        {
            "_id": "...",
            "content": "This is a post.",
            "owner": {
                "_id": "...",
                "username": "testuser",
                "avatar": "http://res.cloudinary.com/...",
                "fullName": "Test User"
            },
            "media": [],
            "likes": 0,
            "replies": 0
        }
    ],
    "message": "Posts fetched successfully",
    "success": true
}
```

**Update a post**

*   **URL:** `/api/v1/posts/update`
*   **Method:** `PATCH`
*   **Body:** `multipart/form-data` with fields `postId` (string), `content` (string), `removeMedia` (string or array of strings), and `media` (up to 5 files).

*   **Response:**

```json
{
    "statusCode": 200,
    "data": {
        "_id": "...",
        "content": "This is the updated post content.",
        "owner": "...",
        "media": [],
        "createdAt": "...",
        "updatedAt": "..."
    },
    "message": "Post updated successfully",
    "success": true
}
```

### Reply API

**Add a new reply**

*   **URL:** `/api/v1/replies/add`
*   **Method:** `POST`
*   **Body:** `multipart/form-data` with fields `content` (text), `postId` (string), and `media` (up to 5 files).

*   **Response:**

```json
{
    "statusCode": 201,
    "data": {
        "post": "...",
        "content": "This is a reply.",
        "media": [],
        "owner": "...",
        "_id": "...",
        "createdAt": "...",
        "updatedAt": "..."
    },
    "message": "Reply created successfully",
    "success": true
}
```

**Get post replies**

*   **URL:** `/api/v1/replies/:postId`
*   **Method:** `GET`
*   **Response:**

```json
{
    "statusCode": 200,
    "data": [
        {
            "_id": "...",
            "content": "This is a reply.",
            "owner": {
                "_id": "...",
                "username": "testuser",
                "avatar": "http://res.cloudinary.com/...",
                "fullName": "Test User"
            },
            "media": [],
            "likes": 0
        }
    ],
    "message": "Replies fetched successfully",
    "success": true
}
```

**Update a reply**

*   **URL:** `/api/v1/replies/update`
*   **Method:** `PATCH`
*   **Body:** `multipart/form-data` with fields `replyId` (string), `content` (string), `removeMedia` (string or array of strings), and `media` (up to 5 files).

*   **Response:**

```json
{
    "statusCode": 200,
    "data": {
        "_id": "...",
        "post": "...",
        "content": "This is the updated reply content.",
        "owner": "...",
        "media": [],
        "createdAt": "...",
        "updatedAt": "..."
    },
    "message": "Reply updated successfully",
    "success": true
}
```

**Delete a reply**

*   **URL:** `/api/v1/replies/delete`
*   **Method:** `DELETE`
*   **Body:**

```json
{
    "replyId": "..."
}
```

*   **Response:**

```json
{
    "statusCode": 200,
    "data": {},
    "message": "Reply deleted successfully",
    "success": true
}
```

### Like API

**Toggle a like on a post or reply**

*   **URL:** `/api/v1/likes/toggle-like`
*   **Method:** `POST`
*   **Body:**

```json
{
    "postId": "..." 
}
```

*   **Response:**

```json
{
    "statusCode": 200,
    "data": {},
    "message": "Liked successfully",
    "success": true
}
```

### Follower API

**Toggle a follow on a user**

*   **URL:** `/api/v1/followers/toggle-follow`
*   **Method:** `POST`
*   **Body:**

```json
{
    "userId": "...",
    "isFollowing": false
}
```

*   **Response:**

```json
{
    "statusCode": 200,
    "data": {
        "followedBy": "...",
        "followedTo": "...",
        "_id": "...",
        "createdAt": "...",
        "updatedAt": "..."
    },
    "message": "Followed user successfully",
    "success": true
}
```

**Get user followers**

*   **URL:** `/api/v1/followers/get-followers`
*   **Method:** `GET`
*   **Body:**

```json
{
    "requestedUserId": "..."
}
```

*   **Response:**

```json
{
    "statusCode": 200,
    "data": {
        "docs": [
            {
                "follower": {
                    "_id": "...",
                    "username": "testuser2",
                    "fullName": "Test User 2",
                    "avatar": "http://res.cloudinary.com/..."
                },
                "isFollowing": true
            }
        ],
        "totalDocs": 1,
        "limit": 15,
        "page": 1,
        "totalPages": 1,
        "pagingCounter": 1,
        "hasPrevPage": false,
        "hasNextPage": false,
        "prevPage": null,
        "nextPage": null
    },
    "message": "followers fetched",
    "success": true
}
```

**Get user following**

*   **URL:** `/api/v1/followers/get-following`
*   **Method:** `GET`
*   **Body:**

```json
{
    "requestedUserId": "..."
}
```

*   **Response:**

```json
{
    "statusCode": 200,
    "data": {
        "docs": [
            {
                "following": {
                    "_id": "...",
                    "username": "testuser3",
                    "fullName": "Test User 3",
                    "avatar": "http://res.cloudinary.com/..."
                },
                "isFollowing": false
            }
        ],
        "totalDocs": 1,
        "limit": 15,
        "page": 1,
        "totalPages": 1,
        "pagingCounter": 1,
        "hasPrevPage": false,
        "hasNextPage": false,
        "prevPage": null,
        "nextPage": null
    },
    "message": "followings fetched",
    "success": true
}
```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
