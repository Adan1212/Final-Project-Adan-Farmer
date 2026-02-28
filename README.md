# 🌾 Farm Manager - מנהל החווה החכם

> מערכת ניהול חווה חכמה מלאה עם בינה מלאכותית לחיזוי צריכת מים

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)
![Python](https://img.shields.io/badge/Python-ML/AI-3776AB?logo=python)

## 📋 תיאור הפרויקט

מערכת Full-Stack לניהול חווה חקלאית הכוללת שלושה מודולים עיקריים:

### 🌱 מודול 1 - ניהול שדות וגידולים
- ניהול שדות (CRUD), סוגי קרקע, מיקום
- ניהול גידולים עם שלבי צמיחה ומעקב
- יומן פעולות חקלאיות (חריש, זריעה, השקיה, דישון, ריסוס, קציר)

### 🐑 מודול 2 - ניהול עדר כבשים
- ניהול כבשים עם Tag Number, מעקב משקל, מצב בריאות
- ניהול חיסונים עם תזכורות לחיסון הבא
- טיפולים רפואיים עם מעקב סטטוס
- רישום לידות עם קשר הורים-טלאים

### 💧 מודול 3 - ניהול מים חכם + AI
- קריאות מונה מים ומעקב צריכה
- **3 אלגוריתמים לחיזוי צריכת מים:**
  - רגרסיה ליניארית (Linear Regression)
  - יער אקראי (Random Forest)
  - Gradient Boosting
- חישוב ET₀ לפי שיטת **FAO-56 Penman-Monteith**
- זיהוי חריגות אוטומטי
- השוואת ביצועי אלגוריתמים

## 🛠️ טכנולוגיות

| שכבה | טכנולוגיה |
|------|-----------|
| Frontend | React 18, React Router v6, Chart.js, React Icons |
| Backend | Node.js, Express.js, Mongoose ODM |
| Database | MongoDB |
| ML/AI | Python, scikit-learn, Flask |
| Auth | JWT, bcryptjs |
| Design | CSS Custom Properties, Dark/Light Mode, RTL Hebrew |

## 🚀 התקנה והרצה

### דרישות מקדימות
- Node.js v16+
- MongoDB (local or Atlas)
- Python 3.8+ (למודול ML)

### שלב 1 - התקנת תלויות
```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### שלב 2 - הגדרות סביבה
ערוך את `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/farm-manager
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
```

### שלב 3 - מילוי נתונים לדוגמה
```bash
cd server && node config/seed.js
```

### שלב 4 - הרצה
```bash
# מתיקיית הראשית - מפעיל את שניהם
npm run dev
```

### שלב 5 - מודול ML (אופציונלי)
```bash
cd ml
pip install -r requirements.txt
python train.py       # אימון מודלים
python predict.py     # הרצת שרת תחזיות (port 5001)
```

## 📁 מבנה הפרויקט

```
├── client/                  # React Frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Auth/        # Login, Register
│       │   ├── Common/      # Layout, Sidebar
│       │   ├── Dashboard/   # Dashboard + Charts
│       │   ├── Fields/      # Fields, Crops, Operations
│       │   ├── Sheep/       # Sheep, Vaccinations, Treatments, Births
│       │   └── Water/       # Water Dashboard, Readings, Predictions, Anomalies
│       ├── context/         # Auth & Theme providers
│       └── services/        # API service layer
├── server/                  # Node.js Backend
│   ├── config/              # DB connection, Seeder
│   ├── controllers/         # 8 controllers
│   ├── middleware/           # JWT auth middleware
│   ├── models/              # 11 Mongoose models
│   └── routes/              # 13 API route files
└── ml/                      # Python ML Module
    ├── fao56.py             # FAO-56 ET₀ calculation
    ├── train.py             # Model training
    └── predict.py           # Flask prediction API
```

## 🔒 אימות

- **JWT Token** נשמר ב-localStorage
- תפקידים: admin, manager, worker
- משתמש ברירת מחדל (לאחר seed): `adan@farm.com` / `123456`

## 🎨 עיצוב

- **RTL מלא** עם תמיכה בעברית
- **מצב כהה / בהיר** עם toggle
- **Responsive** - מותאם לכל מסך
- **Font**: Rubik (Google Fonts)
- **Charts**: Line, Bar, Doughnut (Chart.js)

## 👤 מפתח

**Adan Farmer** - Final Project