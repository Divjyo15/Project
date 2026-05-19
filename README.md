# ⚡ SyncUp - Realtime Coaching Feed

## 🏗️ Project Structure

```txt
syncup/
├── backend/          ← Node.js + Express + Socket.IO
│   ├── server.js
│   ├── config/
│   │   ├── db.js     ← MongoDB connection
│   │   └── redis.js  ← Redis connection
│   ├── models/
│   │   └── Feed.js   ← Mongoose schema
│   ├── routes/
│   │   └── feed.js   ← GET + POST /feed
│   └── socket/
│       └── index.js  ← Socket.IO events
└── frontend/         ← Next.js
    ├── pages/
    │   ├── index.js  ← Home (feed list)
    │   └── admin.js  ← Admin (add feed)
    └── styles/
        └── globals.css
```

---

# ✅ STEP 1: MongoDB Atlas Setup (Free)

1. Go to https://cloud.mongodb.com
2. Sign up for a free account
3. Click **Create a Cluster** → Select **M0 Free Tier**
4. Go to **Database Access** → Add a new user → Set username and password
5. Go to **Network Access** → Add IP Address → Select **Allow Access from Anywhere (0.0.0.0/0)**
6. Click **Connect** → Choose **Connect your application** → Copy the connection string

The connection string will look like this:

```txt
mongodb+srv://username:password@cluster0.abcde.mongodb.net/syncup?retryWrites=true&w=majority
```

---

# ✅ STEP 2: Redis Setup (Upstash - Free, No Installation Needed)

> Redis installation on Windows can be difficult, so we’ll use Upstash cloud Redis instead.

1. Go to https://upstash.com
2. Sign up for free
3. Click **Create Database**
   - Name: `syncup`
   - Select the nearest region
4. Copy the **Redis URL** from the dashboard

It will look something like this:

```txt
redis://default:password123@us1-abc-123.upstash.io:12345
```

---

# ✅ STEP 3: Backend Setup

```bash
# Go to backend folder
cd syncup/backend

# Create .env file
copy .env.example .env
```

Open the `.env` file and add your credentials:

```env
PORT=5000
MONGODB_URI=<your mongodb connection string>
REDIS_URL=<your upstash redis url>
CLIENT_URL=http://localhost:3000
```

Now install dependencies and start the server:

```bash
npm install
npm run dev
```

You should see these messages:

```txt
🚀 Server running on http://localhost:5000
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
✅ Redis Connected
```

---

# ✅ STEP 4: Frontend Setup

Open a new terminal:

```bash
cd syncup/frontend

npm install
npm run dev
```

Now open:

```txt
http://localhost:3000
```

---

# ✅ STEP 5: Test the Application

1. Open Admin page:

```txt
http://localhost:3000/admin
```

2. Open the home page in two browser tabs/windows:

```txt
http://localhost:3000
```

3. Add a new feed from the admin page

4. Watch both home pages update in real time automatically 🔴

---

# 🔑 Key Features

| Feature | Implementation |
|---------|---------------|
| REST APIs | GET /feed, POST /feed |
| MongoDB | Mongoose ODM with indexed queries |
| Redis Cache | 60-second TTL with auto invalidation |
| WebSocket | Socket.IO realtime broadcasting |
| Reconnection | Auto reconnect with backoff |
| Duplicate Prevention | `newFeedIds` Set tracking |
| Error Handling | Try-catch in routes and frontend |
| Loading States | Spinner during fetch and submit |

---

# 📡 API Reference

## GET /feed

```json
Response (from cache):
{
  "success": true,
  "source": "cache",
  "data": [...]
}
```

```json
Response (from database):
{
  "success": true,
  "source": "database",
  "data": [...]
}
```

---

## POST /feed

### Request

```json
{
  "title": "Today's Tip",
  "content": "Stay consistent!",
  "author": "Coach Rahul",
  "category": "tip"
}
```

### Response

```json
{
  "success": true,
  "message": "Feed added successfully!",
  "data": {
    "_id": "..."
  }
}
```

---

# 🚀 Caching Logic

```txt
GET /feed request received
    ↓
Check Redis cache
    ↓
If found → Return cached data (fast ⚡)
    ↓
If not found
    ↓
Fetch data from MongoDB
    ↓
Store in Redis for 60 seconds
    ↓
Return response to client

POST /feed request received
    ↓
Save data to MongoDB
    ↓
Delete Redis cache (remove stale data)
    ↓
Broadcast update using Socket.IO
    ↓
All connected clients receive realtime updates
```

---

# ⚡ Realtime Updates

After adding a feed, the home page updates automatically in real time — without needing a refresh. The Redis cache is also cleared so users always receive fresh data.