# 🧭 UniLost & Found - Frontend

This is the frontend of the UniLost & Found System built using React.  
It allows users to report lost/found items, view matches, manage profiles, and handle claims.

---

## 🚀 Tech Stack
- React (Vite / Create React App)
- JavaScript (ES6+)
- LocalStorage (for temporary data storage)
- Inline CSS styling

---

## 📁 Project Structure
src/
 ├── pages/        # Main pages (Dashboard, Login, Reports, Profile, etc.)
 ├── components/   # Reusable UI components (Forms, Cards, etc.)
 ├── api/          # LocalStorage helper functions
 ├── App.jsx       # Main navigation logic (page switching)
 └── main.jsx

---

## ▶️ How to Run Locally

### 1. Install dependencies
npm install

### 2. Start development server
npm run dev

(If using Create React App)
npm start

---

### 3. Open in browser
http://localhost:5173  
or  
http://localhost:3000

---

## 🧭 Navigation System (Important)

This project uses manual routing (no React Router).

Page switching is controlled using:
const [page, setPage] = useState("login");

### Example pages:
- "login" → Login page  
- "dashboard" → Dashboard  
- "reports" → My Reports  
- "profile" → Profile page  
- "postlost" → Post Lost Form  
- "postfound" → Post Found Form  

### Navigation example:
setPage("dashboard");

---

## 💾 Data Storage
Uses LocalStorage instead of a backend.

Example:
localStorage.setItem("lost_found_items", JSON.stringify(items));

Stored data:
- Lost items
- Found items
- Reports
- Form submissions

---

## 🧪 Test Credentials
Email: admin@uom.lk  
Password: 1234  

---

## ⚠️ Important Notes
- No backend is connected yet
- Data resets when browser storage is cleared
- Page names in App.jsx MUST match setPage() values exactly

---

## 👨‍💻 Team Modules

1. Authentication Module
   - Login / Registration
   - Profile management

2. Lost & Found Module
   - Report lost/found items
   - Match results
   - Claim flow

3. Admin Module
   - Dashboard analytics
   - Reports overview

---

## 📌 Future Improvements
- Add backend API (Node.js / Spring Boot)
- Replace LocalStorage with database
- Implement React Router
- Add real-time notifications
- Improve authentication security

---

## 🏁 Troubleshooting
If app does not run:
- Delete node_modules and run npm install
- Check Node version (node -v)
- Ensure port 3000/5173 is free

---

## 📄 License
This project is for educational purposes.