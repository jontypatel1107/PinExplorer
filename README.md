# 📍 PinExplorer — India Pincode Intelligence

A full-stack web application for exploring Indian pincodes, built with **React** (frontend) and **Express + MongoDB** (backend). Search by pincode or city name, browse all states and districts, compare pincodes side-by-side, do bulk lookups, and view rich analytics — all in a sleek dark UI.

---

## 📸 Features at a Glance

| Feature | Description |
|---|---|
| 📍 Pincode Lookup | Search any 6-digit pincode for city, district, state, offices |
| 🔍 Explore Pincodes | Browse and filter by state → district → taluk with paginated results |
| 📊 Dashboard | Overview with stat cards, state-wise bar chart, delivery pie chart |
| 🔍 City Search | Find pincodes by city, district or post office name |
| 📋 Bulk Lookup | Look up up to 50 pincodes at once |
| ⚖️ Compare | Side-by-side pincode comparison with match/mismatch highlight |
| 🗺️ Browse States | Explore all states → districts → cities |
| 📊 Analytics | Charts and stats — offices per state, office types, delivery status |
| ℹ️ About | Feature overview, tech stack, and API endpoint reference |
| 🔁 Autocomplete | Live suggestions as you type |
| 📍 Nearby Pincodes | Find pincodes in the same district |
| ⬇️ CSV Export | Export any result set as a CSV file |
| 🔗 Share Links | Copy a shareable URL for any pincode |
| 🌙 Dark / Light Mode | Toggle and persists across sessions |
| 🕓 Search History | Recent pincode searches saved locally |

---

## 🗂️ Project Structure

```
pinexplorer/
├── server.js              # Express backend (Node.js)
├── src/
│   └── PincodeApp.jsx     # Full React frontend (single file)
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or above
- [MongoDB](https://www.mongodb.com/) running locally on port `27017`
- A MongoDB database named `Pincode1` with a collection named `pincodes` populated with Indian pincode data

### MongoDB Document Schema

Each document in the `pincodes` collection should look like this:

```json
{
  "officeName": "Andheri S.O",
  "pincode": 400053,
  "officeType": "Sub Post Office",
  "deliveryStatus": "Delivery",
  "divisionName": "Mumbai City",
  "regionName": "Mumbai",
  "circleName": "Maharashtra",
  "taluk": "Andheri",
  "districtName": "Mumbai",
  "stateName": "MAHARASHTRA"
}
```

> You can find free Indian pincode datasets on [data.gov.in](https://data.gov.in) or [GitHub](https://github.com/search?q=india+pincode+dataset).

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/pinexplorer.git
cd pinexplorer
```

### 2. Install backend dependencies

```bash
npm install express mongoose cors
```

### 3. Start MongoDB

Make sure MongoDB is running locally:

```bash
mongod --dbpath /your/db/path
```

Or if you use the MongoDB service:

```bash
sudo systemctl start mongod   # Linux
brew services start mongodb-community  # macOS
```

### 4. Start the backend server

```bash
node server.js
```

You should see:

```
MongoDB Connected
Server running on http://localhost:5000
```

### 5. Set up the React frontend

```bash
npx create-react-app pinexplorer-ui
cd pinexplorer-ui
npm install recharts
```

Replace the contents of `src/App.jsx` with `PincodeApp.jsx`, then start the dev server:

```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 🌐 API Reference

Base URL: `http://localhost:5000`

---

### `GET /api/pincode`

Look up a single pincode.

**Query Parameters**

| Param | Type | Required | Description |
|---|---|---|---|
| `code` | number | ✅ | 6-digit Indian pincode |

**Example Request**

```
GET /api/pincode?code=400001
```

**Example Response**

```json
{
  "success": true,
  "cityDetails": {
    "pincode": 400001,
    "city": "Mumbai",
    "district": "Mumbai",
    "state": "MAHARASHTRA",
    "region": "Mumbai",
    "division": "Mumbai City",
    "circle": "Maharashtra",
    "totalOffices": 5,
    "offices": [
      { "name": "Fort S.O", "type": "Sub Post Office", "deliveryStatus": "Delivery" }
    ]
  }
}
```

---

### `GET /api/search`

Search for pincodes by city name, district, or post office name.

**Query Parameters**

| Param | Type | Required | Description |
|---|---|---|---|
| `q` | string | ✅ | Search query (min 2 characters) |
| `type` | string | ❌ | `all` (default), `city`, `district`, or `office` |

**Example Request**

```
GET /api/search?q=Bandra&type=city
```

**Example Response**

```json
{
  "success": true,
  "query": "Bandra",
  "total": 3,
  "results": [
    {
      "pincode": 400050,
      "city": "Bandra",
      "district": "Mumbai",
      "state": "MAHARASHTRA",
      "region": "Mumbai",
      "officeCount": 4
    }
  ]
}
```

---

### `GET /api/autocomplete`

Get live autocomplete suggestions for city and district names.

**Query Parameters**

| Param | Type | Required | Description |
|---|---|---|---|
| `q` | string | ✅ | Partial query (min 2 characters) |

**Example Request**

```
GET /api/autocomplete?q=Pune
```

**Example Response**

```json
{
  "success": true,
  "suggestions": [
    { "label": "Pune", "type": "city" },
    { "label": "Pune City", "type": "district" }
  ]
}
```

---

### `GET /api/nearby`

Find other pincodes in the same district as the given pincode.

**Query Parameters**

| Param | Type | Required | Description |
|---|---|---|---|
| `pincode` | number | ✅ | The base 6-digit pincode |

**Example Request**

```
GET /api/nearby?pincode=400001
```

**Example Response**

```json
{
  "success": true,
  "basePincode": 400001,
  "baseDistrict": "Mumbai",
  "total": 12,
  "nearby": [
    { "pincode": 400002, "city": "Kalbadevi", "district": "Mumbai", "state": "MAHARASHTRA", "officeCount": 3 }
  ]
}
```

---

### `POST /api/bulk`

Look up multiple pincodes in a single request.

**Request Body**

```json
{
  "pincodes": [400001, 110001, 600001]
}
```

> Maximum 50 pincodes per request.

**Example Response**

```json
{
  "success": true,
  "found": [
    {
      "pincode": 400001,
      "city": "Mumbai",
      "district": "Mumbai",
      "state": "MAHARASHTRA",
      "region": "Mumbai",
      "division": "Mumbai City",
      "officeCount": 5,
      "offices": ["Fort S.O", "GPO"]
    }
  ],
  "notFound": [999999]
}
```

---

### `GET /api/stats`

Get aggregated analytics across all pincodes in the database.

**Example Response**

```json
{
  "success": true,
  "summary": {
    "totalOffices": 154000,
    "totalPincodes": 19000,
    "totalStates": 36,
    "totalDistricts": 720
  },
  "stateStats": [
    { "state": "UTTAR PRADESH", "totalOffices": 18000, "uniquePincodes": 2200, "uniqueDistricts": 75 }
  ],
  "officeTypes": [
    { "type": "Sub Post Office", "count": 130000 },
    { "type": "Head Post Office", "count": 900 }
  ],
  "deliveryStatus": [
    { "status": "Delivery", "count": 90000 },
    { "status": "Non-Delivery", "count": 64000 }
  ]
}
```

---

### `GET /states`

Get a sorted list of all states in the database.

**Example Response**

```json
{
  "success": true,
  "totalStates": 36,
  "states": ["ANDHRA PRADESH", "ASSAM", "BIHAR", ...]
}
```

---

### `GET /states/:state_name`

Get all districts and cities for a given state.

**URL Parameters**

| Param | Type | Description |
|---|---|---|
| `state_name` | string | State name (case-insensitive) |

**Example Request**

```
GET /states/MAHARASHTRA
```

**Example Response**

```json
{
  "success": true,
  "state": "MAHARASHTRA",
  "totalDistricts": 36,
  "districts": [
    {
      "district": "Mumbai",
      "cities": ["Andheri", "Bandra", "Colaba", "Kurla"]
    }
  ]
}
```

---

### `GET /api/states`

Get a sorted array of all unique state names.

**Example Request**

```
GET /api/states
```

**Example Response**

```json
[
  "ANDHRA PRADESH",
  "GUJARAT",
  "MAHARASHTRA",
  "TAMIL NADU"
]
```

---

### `GET /api/states/:state/districts`

Get all districts for a given state.

**URL Parameters**

| Param | Type | Description |
|---|---|---|
| `state` | string | State name (case-insensitive) |

**Example Request**

```
GET /api/states/GUJARAT/districts
```

**Example Response**

```json
[
  "AHMEDABAD",
  "SURAT",
  "VADODARA"
]
```

---

### `GET /api/states/:state/districts/:district/taluks`

Get all taluks for a given state and district.

**URL Parameters**

| Param | Type | Description |
|---|---|---|
| `state` | string | State name |
| `district` | string | District name |

**Example Request**

```
GET /api/states/GUJARAT/districts/AHMEDABAD/taluks
```

**Example Response**

```json
[
  "AHMEDABAD CITY",
  "DASKROI",
  "SANAND"
]
```

---

### `GET /api/pincodes`

Get filtered and paginated pincode data.

**Query Parameters**

| Param | Type | Required | Description |
|---|---|---|---|
| `state` | string | ❌ | Filter by state |
| `district` | string | ❌ | Filter by district |
| `taluk` | string | ❌ | Filter by taluk |
| `page` | number | ❌ | Page number (default: 1) |
| `limit` | number | ❌ | Results per page (default: 20) |

**Example Request**

```
GET /api/pincodes?state=GUJARAT&district=AHMEDABAD&taluk=DASKROI&page=1&limit=20
```

**Example Response**

```json
{
  "data": [
    {
      "pincode": 382425,
      "officeName": "Daskroi S.O",
      "officeType": "Sub Post Office",
      "deliveryStatus": "Delivery",
      "taluk": "DASKROI",
      "district": "AHMEDABAD",
      "state": "GUJARAT",
      "division": "Ahmedabad",
      "region": "Rajkot",
      "circle": "Gujarat"
    }
  ],
  "total": 120,
  "page": 1,
  "limit": 20
}
```

---

### `GET /api/pincode/:pincode`

Look up a single pincode by path parameter.

**URL Parameters**

| Param | Type | Description |
|---|---|---|
| `pincode` | number | 6-digit Indian pincode |

**Example Request**

```
GET /api/pincode/400001
```

**Example Response**

```json
{
  "success": true,
  "cityDetails": {
    "pincode": 400001,
    "city": "Mumbai",
    "district": "Mumbai",
    "state": "MAHARASHTRA",
    "region": "Mumbai",
    "division": "Mumbai City",
    "circle": "Maharashtra",
    "totalOffices": 5,
    "offices": [
      { "name": "Fort S.O", "type": "Sub Post Office", "deliveryStatus": "Delivery" }
    ]
  }
}
```

---

### `GET /api/stats/state-distribution`

Get state-wise office count distribution for bar charts.

**Example Request**

```
GET /api/stats/state-distribution
```

**Example Response**

```json
[
  { "state": "GUJARAT", "count": 12000 },
  { "state": "MAHARASHTRA", "count": 20000 },
  { "state": "TAMIL NADU", "count": 15000 }
]
```

---

### `GET /api/stats/delivery-distribution`

Get delivery vs non-delivery office counts for pie charts.

**Example Request**

```
GET /api/stats/delivery-distribution
```

**Example Response**

```json
{
  "delivery": 120000,
  "nonDelivery": 34000
}
```

---

### `GET /api/export`

Export pincode data as a CSV file.

**Query Parameters**

| Param | Type | Required | Description |
|---|---|---|---|
| `state` | string | ❌ | Filter by state |
| `district` | string | ❌ | Filter by district |
| `taluk` | string | ❌ | Filter by taluk |

**Example Request**

```
GET /api/export?state=GUJARAT
```

Returns a CSV file download with columns: Pincode, Office Name, Office Type, Delivery Status, Taluk, District, State, Division, Region, Circle.

---

## 🧱 Tech Stack

### Backend
- **Node.js** — Runtime
- **Express.js** — Web framework
- **Mongoose** — MongoDB ODM
- **CORS** — Cross-origin requests

### Frontend
- **React** — UI framework
- **Recharts** — Charts and data visualizations
- **Google Fonts** — Clash Display + Cabinet Grotesk
- **CSS Variables** — Theming (dark/light mode)
- **localStorage** — Persistent search history and theme preference

---

## 📦 npm Dependencies

### Backend

```bash
npm install express mongoose cors
```

### Frontend

```bash
npm install recharts
```

No other third-party UI libraries are used — the entire UI is hand-crafted with CSS.

---

## 🗄️ Database Indexes

The backend creates the following MongoDB indexes automatically on startup for fast queries:

```js
pincodeSchema.index({ pincode: 1 });
pincodeSchema.index({ stateName: 1 });
pincodeSchema.index({ districtName: 1 });
pincodeSchema.index({ taluk: 1 });
pincodeSchema.index({ officeName: "text", taluk: "text", districtName: "text" });
```

---

## 🔧 Environment & Configuration

By default the app uses these hardcoded values. You can extract them into a `.env` file using `dotenv` if needed:

| Variable | Default | Description |
|---|---|---|
| MongoDB URI | `mongodb://localhost:27017/Pincode1` | Local MongoDB connection |
| Server Port | `5000` | Express server port |
| React Dev Port | `3000` | Create React App default |

To use environment variables, install dotenv and update `server.js`:

```bash
npm install dotenv
```

```js
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/Pincode1");
app.listen(process.env.PORT || 5000);
```

---

## 🚧 Known Limitations

- The map view links out to OpenStreetMap rather than embedding an interactive map. To embed a real interactive map, integrate [Leaflet.js](https://leafletjs.com/) with geocoding via the [Nominatim API](https://nominatim.org/).
- The `/api/stats` endpoint queries the full collection — on large datasets (150k+ documents) it may be slow on first load. Consider adding a Redis cache or pre-computing stats on a schedule.
- Bulk lookup is capped at 50 pincodes per request to protect server performance.
- Search autocomplete triggers on 2+ characters; very short queries may return many results.

---

## 🛠️ Possible Enhancements

- Add Redis caching for `/api/stats` and `/states`
- Add pagination to `/api/search` results
- Embed Leaflet.js for a real interactive map with markers
- Add a PWA manifest + service worker for offline support
- Implement rate limiting with `express-rate-limit`
- Add input sanitization and helmet.js for security headers
- Write unit tests with Jest (backend) and React Testing Library (frontend)
- Deploy backend to Railway or Render; frontend to Vercel or Netlify

---

## 📄 License

MIT — free to use, modify and distribute.

---

## 🙌 Acknowledgements

- Indian pincode data sourced from [India Post](https://www.indiapost.gov.in) / [data.gov.in](https://data.gov.in)
- Charts powered by [Recharts](https://recharts.org)
- Map links powered by [OpenStreetMap](https://www.openstreetmap.org)
- Typography: [Clash Display](https://www.fontshare.com/fonts/clash-display) + [Cabinet Grotesk](https://www.fontshare.com/fonts/cabinet-grotesk) via Google Fonts
