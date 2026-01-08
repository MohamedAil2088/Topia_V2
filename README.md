# Men's Ecommerce Backend API

This is the backend API for the Men's Ecommerce application, built with Node.js, Express, and MongoDB.

## Features

- **Authentication**: User registration, login, and JWT-based authentication.
- **Product Management**: CRUD operations for products, categories, and inventory management.
- **Order Management**: Order creation, tracking, and status updates.
- **Reviews**: Product reviews and ratings.
- **Coupons**: Discount coupon management.
- **User Profile**: Address management, wishlist, and profile updates.
- **Security**: Data validation, error handling, and secure headers.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: express-validator

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and add the following variables:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/mens-ecommerce
    JWT_SECRET=your_jwt_secret_key
    NODE_ENV=development
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user and get token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/wishlist` - Get user wishlist
- `POST /api/users/wishlist/:productId` - Add product to wishlist
- `DELETE /api/users/wishlist/:productId` - Remove product from wishlist
- `POST /api/users/address` - Add new address
- `PUT /api/users/address/:addressId` - Update address
- `DELETE /api/users/address/:addressId` - Delete address

### Products
- `GET /api/products` - Get all products (supports pagination & filtering)
- `GET /api/products/:id` - Get single product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/myorders` - Get logged-in user's orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered (Admin)

### Reviews
- `POST /api/products/:productId/reviews` - Add review
- `GET /api/products/:productId/reviews` - Get product reviews
- `DELETE /api/reviews/:id` - Delete review

### Coupons
- `POST /api/coupons` - Create coupon (Admin)
- `GET /api/coupons` - Get all coupons (Admin)
- `POST /api/coupons/validate` - Validate coupon
- `DELETE /api/coupons/:id` - Delete coupon (Admin)

## Error Handling

The API uses a centralized error handling middleware. Errors are returned in the following JSON format:

```json
{
  "success": false,
  "error": "Error message description"
}
```
