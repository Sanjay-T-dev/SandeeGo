# FoodieGo – Food Delivery App

**Customer Ordering Flow:** Browse restaurants → View menu → Cart → Checkout → Live order tracking.

**Tech Stack:** React (Vite) + Node/Express + SQLite (Node's built-in `node:sqlite`).

## Setup and Running Instructions

Node.js 22.13+ is required (Node.js 24 is also supported). Since the project uses built-in SQLite, there is no need to install any additional native packages.

```bash
# Terminal 1 - Backend (port 3001)
cd server
npm install
npm run seed     # Adds sample restaurants and menu items to the database
npm start

# Terminal 2 - Frontend (port 5173)
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The Vite development server automatically proxies `/api` requests to the backend running on port 3001.

## Folder Structure

```text
server/
  index.js        Express app + routes
  queries.js      Restaurant search / filter / sort
  data/           restaurants.csv + menu_items.csv (dataset)
  db.js           SQLite connection + tables
  auth.js         Signup/login/logout, password hashing, sessions
  seed.js         Sample data

client/
  src/
    main.jsx, App.jsx, api.js, CartContext.jsx, AuthContext.jsx, styles.css
    components/   Header, Footer, RequireAuth
    pages/        Home, Restaurant, Cart, Checkout, OrderTracking, Orders, Login, Signup
```

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/restaurants?search=&cuisine= | Restaurant list |
| GET | /api/restaurants/:id | Restaurant details + menu |
| POST | /api/orders | Place an order (login required; prices are calculated server-side) |
| GET | /api/orders/:id | Order details + status (login required; only the order owner can access it) |
| GET | /api/orders | List of orders belonging to the logged-in user |

Order statuses automatically progress in this demo:

- Placed → Preparing (20 seconds)
- Preparing → Out for Delivery (60 seconds)
- Out for Delivery → Delivered (120 seconds)

## Dataset (47 Restaurants, 600+ Dishes)

The dataset is available in `server/data/*.csv`. All restaurant names are **fictional** (not real brands). The dataset uses Chennai-style locations and prices in INR.

- Edit the CSV files using Excel and run `npm run seed` (**seeding resets existing orders**).
- To generate a new dataset, run `python tools/generate_dataset.py` (Python is required).
- To use another dataset (such as a Kaggle Zomato dataset), make sure the CSV columns match the following structure:

**restaurants.csv:**
`id,name,cuisine,cuisine_tags,area,rating,rating_count,delivery_time,delivery_fee,price_for_two,offer,is_pure_veg,emoji,description`

**menu_items.csv:**
`restaurant_id,name,description,price,category,is_veg,is_bestseller`

- The `offer` field is for display purposes only. Discounts are not applied to the bill.

## Login / Signup

- Signup requires name, email, phone number, and password (minimum 8 characters).
- After login, a token is generated and remains valid for 7 days.
- **Login is required to place orders, view My Orders, and access order tracking.** Browsing restaurants and adding items to the cart are allowed without logging in.
- Passwords are hashed using **scrypt** with a salt (Node's built-in `crypto` module; no additional package required). Plain-text passwords are never stored.
- Session tokens are generated using 32 random bytes. Only their **SHA-256 hashes** are stored in the database. The original token is stored in the browser's localStorage and sent through the `Authorization: Bearer <token>` header.
- Login rate limiting: After 5 failed attempts, the user is blocked for 15 minutes (in-memory).
- Users can only access their own orders. Attempting to access another user's order ID returns a 404 response.

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Create an account + automatic login |
| POST | /api/auth/login | Login and return a token |
| GET | /api/auth/me | Get the current user (token required) |
| POST | /api/auth/logout | Delete the session |

For existing databases, the `users` and `sessions` tables and the `orders.user_id` column are added automatically.

Running `npm run seed` does not delete user accounts (only orders are reset).

## Search / Filter API

Example:

`GET /api/restaurants?search=biryani&cuisine=Chinese&veg=1&minRating=4&sort=rating`

Supported sorting options:

- `relevance`
- `rating`
- `time`
- `price_low`
- `price_high`

Search covers restaurant names, cuisines, areas, and **dish names**.

## Next Steps (Future Improvements)

- Real payment gateway integration
- Restaurant admin panel
- WebSocket-based live order tracking
- Email verification
- Password reset functionality
- HTTP-only cookie-based sessions