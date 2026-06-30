# 🏏 StrikeZone Auctions — Cricket Tournament Auction System

## ⚡ Quick Start (5 minutes)

### Step 1 — Get a free MongoDB database (one-time setup)

> You need a database. The easiest option is MongoDB Atlas (free, no install).

1. Go to **https://cloud.mongodb.com** and sign up free
2. Click **"Create"** → choose **M0 Free** tier → any region → **Create Deployment**
3. Create a database user — remember the **username** and **password**
4. Under **"Network Access"** → **Add IP Address** → click **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Go to **Database** → **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/
   ```

### Step 2 — Configure the backend

```powershell
cd cricket-auction\backend
copy .env.example .env
```

Open `backend\.env` in any text editor and set:
```
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/cricket_auction?retryWrites=true&w=majority
JWT_SECRET=any_long_random_string_at_least_32_chars
```

> ⚠️  Replace `youruser`, `yourpassword`, and `cluster0.xxxxx` with your actual Atlas values.

### Step 3 — Verify setup

```powershell
cd cricket-auction\backend
npm install
npm run check      ← tests your .env and MongoDB connection
```

You should see:
```
✅  MONGO_URI is set
✅  JWT_SECRET is set
✅  MongoDB connected successfully!
🚀  You're good to go. Run: npm run seed && npm run dev
```

### Step 4 — Seed admin & start servers

```powershell
# Terminal 1 — Backend (keep this open)
cd cricket-auction\backend
npm run seed       ← creates admin@auction.com / Admin@123
npm run dev        ← starts on http://localhost:5000

# Terminal 2 — Frontend (keep this open)
cd cricket-auction\frontend
npm install
npm run dev        ← starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Login Details (after seeding)

| Role | URL | Email | Password |
|------|-----|-------|----------|
| Super Admin | /admin/login | admin@auction.com | Admin@123 |
| Team Owner | /login | (register at /register) | — |
| Player | /player-registration | (no login needed) | — |

---

## 📋 First-time Admin Workflow

1. **Admin Login** → `/admin/login`
2. **Tournament Management** → Create a tournament, set dates, open registration
3. **Settings** → Set default player base price, team purse, auction mode (random/serial)
4. **Team Management** → Add teams (purse auto-fills from Settings default)
5. **Player Management** → Approve players, mark them "Eligible for Auction"
6. **Auction Room** → Set optional starting price → "Next Player" → bid!
7. **📺 TV Display** → Click "Open TV Display" → show on projector/LED screen

---

## 🗂️ Project Structure

```
cricket-auction/
├── backend/
│   ├── .env.example          ← copy to .env and fill in
│   ├── server.js             ← Express + Socket.io entry point
│   ├── config/db.js          ← MongoDB connection with retry
│   ├── models/               ← User, Tournament, Team, Player, Bid, AuctionState
│   ├── controllers/          ← auth, tournament, team, player, report
│   ├── routes/               ← REST API routes
│   ├── sockets/auctionSocket.js  ← live auction engine
│   ├── middleware/           ← JWT auth, file upload
│   └── utils/
│       ├── seedAdmin.js      ← npm run seed
│       └── checkSetup.js     ← npm run check
│
└── frontend/
    └── src/
        ├── pages/            ← Landing, Login, Register, PlayerRegistration
        │   └── admin/        ← Dashboard, AuctionRoom, Settings, etc.
        ├── layouts/          ← AdminLayout (sidebar wrapper)
        ├── components/       ← UI atoms, Sidebar, CountdownTimer
        ├── context/          ← AuthContext (JWT state)
        ├── api/axios.js      ← REST client
        └── socket/socket.js  ← Socket.io client
```

---

## 🔧 Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `buffering timed out` | MongoDB not connected | Check Step 1-3 above |
| `EADDRINUSE :5000` | Port already in use | Run `netstat -ano \| findstr :5000` then `taskkill /PID xxxx /F` |
| `Failed to resolve import` | Wrong folder structure | Make sure files are in `src/pages/` not `src/layouts/pages/` |
| `Invalid email or password` | Admin not seeded | Run `npm run seed` in backend folder |
