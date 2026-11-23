# FoodieGo – Food Delivery App

Customer ordering flow: browse restaurants → view menu → cart → checkout → live order tracking.

**Stack:** React (Vite) + Node/Express + SQLite (Node-oda built-in `node:sqlite`)

## Run panna (setup)

Node 22.13+ venum (Node 24 um OK). Built-in SQLite use pannurathala vera native package install pannanum-nu illa.

```bash
# Terminal 1 - backend (port 3001)
cd server
npm install
npm run seed     # sample restaurants + menu DB-la podum
npm start

# Terminal 2 - frontend (port 5173)
cd client
npm install
npm run dev
```

Browser-la http://localhost:5173 open pannunga. Vite dev server `/api` calls-ah automatically backend (3001) ku proxy pannum.

## Folder structure

```
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
| GET | /api/restaurants/:id | Restaurant + menu |
| POST | /api/orders | Order place (login venum, prices server-side calculate aagum) |
| GET | /api/orders/:id | Order details + status (login, owner mattum) |
| GET | /api/orders | Login panna user-oda orders list |

Order status auto-progress aagum (demo): placed → preparing (20s) → out_for_delivery (60s) → delivered (120s).

## Dataset (47 restaurants, 600+ dishes)

`server/data/*.csv` la irukku. Restaurant names ellam **fictional** (real brands illa), Chennai-style areas, prices INR.

- Excel-la CSV edit panni, `npm run seed` run pannunga (**seed pannina orders reset aagum**).
- Pudhusa generate panna: `python tools/generate_dataset.py` (Python venum).
- Vera dataset (Kaggle Zomato maari) use panna, CSV columns match pannunga:
  - restaurants.csv: id,name,cuisine,cuisine_tags,area,rating,rating_count,delivery_time,delivery_fee,price_for_two,offer,is_pure_veg,emoji,description
  - menu_items.csv: restaurant_id,name,description,price,category,is_veg,is_bestseller
- `offer` text display mattum dhaan, bill-la discount apply aagaadhu.

## Login / Signup

- Signup: name, email, phone, password (min 8). Login panna token kidaikkum, 7 days valid.
- **Order place panna, My Orders, tracking paarkka login venum.** Restaurants browse + cart login illama-um pannalaam.
- Password **scrypt**-la salt-oda hash aagum (Node built-in `crypto`, extra package illa). Plain password store aagaadhu.
- Session token random 32 bytes. DB-la **SHA-256 hash** mattum store aagum. Browser localStorage-la irukkum, `Authorization: Bearer <token>` header-la pogum.
- Login-ku rate limit: 5 thappu attempts-ku apram 15 nimisham block (in-memory).
- User oda orders mattum paakka mudiyum (vera user order id kudutha 404).

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Account create + auto login |
| POST | /api/auth/login | Login, token return |
| GET | /api/auth/me | Current user (token venum) |
| POST | /api/auth/logout | Session delete |

Pazhaya DB-la `users`, `sessions` tables and `orders.user_id` column auto add aagum. `npm run seed` pannina accounts delete aagaadhu (orders mattum reset).

## Search / filter API

`GET /api/restaurants?search=biryani&cuisine=Chinese&veg=1&minRating=4&sort=rating`
sort = relevance | rating | time | price_low | price_high. Search restaurant name, cuisine, area, **dish name** ellathayum paakum.

## Deploy (Render free web service)

Express built React app-ah (`client/dist`) serve pannum, so **oru service-la frontend + backend rendum** odum.

- Build Command: `npm run build`
- Start Command: `npm start`
- Environment variable: `NODE_VERSION` = `24.19.0` (Node 22.13+ venum, `node:sqlite`-ku)
- Instance type: Free

Pudhu (empty) database-la restaurants data first start-la automatic-ah load aagum.

**Gavanam:** Render free plan-la filesystem ephemeral. Service sleep / restart / redeploy aana **users and orders reset aagum** (restaurants thirumba load aagum). Demo-ku OK, real data-ku Postgres venum.

Local-la production mode test: `cd client && npm run build`, apram `cd ../server && npm start`, http://localhost:3001 open pannunga.

## Next steps (ideas)
Real payment gateway, restaurant admin panel, WebSocket live tracking, email verification / password reset, httpOnly cookie sessions.
