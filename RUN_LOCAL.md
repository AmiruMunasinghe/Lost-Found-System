# Local Run Instructions

This merged version contains:
- `backend/` Spring Boot API with notifications/email/rewards/admin/matching
- `frontend/` student frontend with one-login admin portal embedded
- `admin/` original separate admin frontend kept for reference/optional testing

## 1. Backend

The backend runs on `http://localhost:8085`.

It can run without PostgreSQL using the default H2 in-memory database. For persistent PostgreSQL/email settings, copy `backend/.env.example` to `backend/.env` and edit the values.

```bash
cd backend
./mvnw clean spring-boot:run -Dmaven.test.skip=true
```

Windows CMD:

```cmd
cd backend
mvnw.cmd clean spring-boot:run -Dmaven.test.skip=true
```

Default seeded accounts:

```txt
admin / admin123
student / student123
```

## 2. Main frontend, student + admin one-login portal

The frontend uses `frontend/.env` with:

```env
VITE_API_BASE_URL=http://localhost:8085
```

Run:

```bash
cd frontend
npm install
npm run dev
```

Open the shown Vite URL, usually `http://localhost:5173`.

Login using:

```txt
student / student123  -> student side
admin / admin123      -> embedded admin dashboard, same frontend host
```

## 3. Email notifications

In-app notifications work with the database. Email sending requires mail settings in `backend/.env`. For Gmail, create a Gmail App Password and set:

```env
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_gmail_app_password
NOTIFICATION_FROM_EMAIL=your_gmail@gmail.com
```

## 4. Matching

Create a LOST item and a similar FOUND item, then run matching from the admin/matching UI or call:

```txt
POST http://localhost:8085/matches/run?lostItemId=<LOST_ITEM_ID>
GET  http://localhost:8085/matches
```

## 5. Notes

- `node_modules/`, `backend/target/`, and real backend `.env` are intentionally not included.
- If old tests fail after matching changes, use `-Dmaven.test.skip=true` for local running.
