# Frontend Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Components](#components)
5. [Pages & Routing](#pages--routing)
6. [API Integration](#api-integration)
7. [State Management](#state-management)
8. [Styling & CSS](#styling--css)
9. [Development Setup](#development-setup)
10. [Building & Deployment](#building--deployment)
11. [Best Practices](#best-practices)

---

## Project Overview

The frontend is a modern React application that provides the user interface for the Lost & Found Management System. It includes:
- **User-facing application** for reporting and finding items
- **Admin dashboard** for system management
- Real-time notifications and updates
- Responsive design for desktop and mobile
- JWT-based authentication

---

## Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.4 | UI framework |
| Vite | 5.4.11 | Build tool & dev server |
| React Router | 7.15.0 | Client-side routing |
| JavaScript | ES2020+ | Language |
| CSS3 | Latest | Styling |
| Fetch API | Native | HTTP requests |
| localStorage | Native | Session persistence |

---

## Project Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── images/
│
├── src/
│   ├── main.jsx                 # Entry point
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # Global styles
│   ├── index.css                # Global CSS variables & reset
│   │
│   ├── api/                     # API integration layer
│   │   ├── client.js            # HTTP client wrapper
│   │   ├── auth.js              # Auth endpoints
│   │   ├── items.js             # Item management endpoints
│   │   ├── matches.js           # Matching endpoints
│   │   ├── notifications.js     # Notification endpoints
│   │   └── claims.js            # Claim endpoints
│   │
│   ├── components/              # Reusable components
│   │   ├── Navbar.jsx           # Top navigation
│   │   ├── Sidebar.jsx          # Side menu
│   │   ├── PostFoundForm.jsx    # Found item form
│   │   ├── PostLostForm.jsx     # Lost item form
│   │   ├── PostItem.jsx         # Item display card
│   │   └── PostList.jsx         # Item list container
│   │
│   ├── pages/                   # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx        # User dashboard
│   │   ├── BrowseItems.jsx
│   │   ├── MyReports.jsx
│   │   ├── MatchResults.jsx
│   │   ├── ClaimItem.jsx
│   │   ├── Notifications.jsx
│   │   ├── Rewards.jsx
│   │   ├── Profile.jsx
│   │   ├── Settings.jsx
│   │   ├── Chat.jsx
│   │   ├── HelpSupport.jsx
│   │   ├── Contact.jsx
│   │   ├── About.jsx
│   │   ├── AdminDashboard.jsx   # Admin dashboard
│   │   ├── AdminClaims.jsx      # Claims management
│   │   ├── AdminItems.jsx       # Item management
│   │   ├── AdminAnalytics.jsx   # Analytics
│   │   ├── AdminAudit.jsx       # Audit logs
│   │   ├── AdminUsers.jsx       # User management
│   │   ├── AdminReports.jsx     # Reports
│   │   └── ... (other pages)
│   │
│   ├── assets/                  # Images, icons, etc.
│   │
│   ├── data/                    # Mock data (dev only)
│   │   └── mockAdminData.js
│   │
│   ├── utils/                   # Utility functions
│   │   ├── formatters.js        # Date, number formatting
│   │   ├── validation.js        # Form validation
│   │   └── helpers.js           # General helpers
│   │
│   ├── router-mock.jsx          # Router configuration
│   │
│   └── contexts/                # Context providers (optional)
│       └── AuthContext.jsx      # Auth state management
│
├── .eslintrc.js                 # ESLint configuration
├── vite.config.js              # Vite configuration
├── index.html                  # HTML template
├── package.json                # Dependencies & scripts
├── README.md
└── ReadmeInstructions.md       # Setup instructions

admin/                          # Admin application (separate)
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── ClaimsQueue.jsx
│   │   ├── ItemManagement.jsx
│   │   ├── Analytics.jsx
│   │   └── AuditLog.jsx
│   └── ... (similar structure)
├── vite.config.js
├── package.json
└── index.html
```

---

## Components

### Navigation Components

#### Navbar.jsx
**Purpose**: Top navigation bar with user menu and branding

**Props**: 
- `user` (object): Current logged-in user
- `onLogout` (function): Logout handler

**Features**:
- Brand/logo display
- Navigation links
- User dropdown menu
- Notification bell icon
- Mobile responsive hamburger menu

```jsx
<Navbar user={currentUser} onLogout={handleLogout} />
```

#### Sidebar.jsx
**Purpose**: Side navigation menu for main sections

**Props**:
- `isOpen` (boolean): Menu visibility state
- `onClose` (function): Close menu handler

**Features**:
- Navigation links grouped by section
- Active link highlighting
- Collapsible sections
- Mobile drawer support

```jsx
<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
```

### Form Components

#### PostFoundForm.jsx
**Purpose**: Form for posting found items

**Features**:
- Title, description, location fields
- Image upload with preview
- Form validation
- Error message display
- Submit handler

**Example Usage**:
```jsx
<PostFoundForm onSubmit={handlePostFound} />
```

#### PostLostForm.jsx
**Purpose**: Form for posting lost items

**Features**:
- Title, description, location, date fields
- Category/type selection
- Reward amount (optional)
- Image upload
- Form validation

**Example Usage**:
```jsx
<PostLostForm onSubmit={handlePostLost} />
```

### Display Components

#### PostItem.jsx
**Purpose**: Card displaying a single item

**Props**:
- `item` (object): Item data
- `onViewDetails` (function): Details click handler
- `onClaim` (function): Claim action handler

**Features**:
- Item image display
- Title and description
- Location and date
- Match indicator (if matched)
- Claim button for interested users

```jsx
<PostItem 
  item={item} 
  onViewDetails={handleView}
  onClaim={handleClaim}
/>
```

#### PostList.jsx
**Purpose**: Container for displaying multiple items with filtering

**Props**:
- `items` (array): Items to display
- `loading` (boolean): Loading state
- `onItemClick` (function): Item selection handler

**Features**:
- Grid/list layout options
- Pagination
- Sorting options (recent, popular)
- Filter controls
- Empty state message

```jsx
<PostList 
  items={filteredItems} 
  loading={isLoading}
  onItemClick={handleItemSelect}
/>
```

---

## Pages & Routing

### Public Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home | Landing page |
| `/login` | Login | User login |
| `/register` | Register | New user registration |
| `/forgot-password` | ForgotPassword | Password reset request |
| `/reset-password` | ResetPassword | Password reset confirmation |
| `/about` | About | About page |
| `/contact` | Contact | Contact form |

### Protected User Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/dashboard` | Dashboard | User dashboard |
| `/items/browse` | BrowseItems | Browse lost/found items |
| `/items/my-reports` | MyReports | User's posted items |
| `/matches` | MatchResults | Matching results |
| `/claims` | ClaimItem | Make a claim on item |
| `/notifications` | Notifications | User notifications |
| `/rewards` | Rewards | Reward points page |
| `/profile` | Profile | User profile management |
| `/settings` | Settings | User settings |
| `/messages` | Chat | Messaging with other users |
| `/help` | HelpSupport | Help & support |

### Admin Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin` | AdminDashboard | Admin overview |
| `/admin/claims` | AdminClaims | Claims management |
| `/admin/items` | AdminItems | Item management |
| `/admin/analytics` | AdminAnalytics | Analytics & reports |
| `/admin/audit` | AdminAudit | Audit logs |
| `/admin/users` | AdminUsers | User management |

### Routing Configuration

```jsx
// src/router-mock.jsx or App.jsx

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>
  },
  {
    path: '/admin',
    element: <AdminRoute><AdminDashboard /></AdminRoute>
  },
  // ... more routes
]);
```

---

## API Integration

### API Client (`api/client.js`)

**Purpose**: Centralized HTTP request wrapper with authentication and error handling

```javascript
const apiRequest = async (path, options = {}) => {
  const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8085';
  
  // Get stored user for authentication
  const user = getSavedUser();
  
  const headers = {
    ...options.headers,
  };
  
  // Add authentication token if available
  if (user?.accessToken) {
    headers['Authorization'] = `Bearer ${user.accessToken}`;
  }
  
  // Set content type for non-FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Clear session and redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
      const errorData = await response.json();
      throw new Error(errorData.message || response.statusText);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### API Modules

#### `api/auth.js`
**Auth-related endpoints**

```javascript
export const registerUser = (username, email, password) =>
  apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });

export const loginUser = (username, password) =>
  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const getCurrentUserFromStorage = () =>
  JSON.parse(localStorage.getItem('user') || 'null');

export const updateProfile = (updates) =>
  apiRequest('/users/me', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

export const uploadProfilePhoto = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiRequest('/users/me/photo', {
    method: 'POST',
    body: formData,
  });
};

export const requestPasswordReset = (email) =>
  apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const confirmPasswordReset = (token, newPassword) =>
  apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
```

#### `api/items.js`
**Item management endpoints**

```javascript
export const getAllItems = (filters = {}) => {
  const query = new URLSearchParams(filters);
  return apiRequest(`/items?${query}`);
};

export const getItemById = (id) =>
  apiRequest(`/items/${id}`);

export const postFoundItem = (itemData) =>
  apiRequest('/items', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });

export const postLostItem = (itemData) =>
  apiRequest('/items', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });

export const updateItem = (id, updates) =>
  apiRequest(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

export const deleteItem = (id) =>
  apiRequest(`/items/${id}`, {
    method: 'DELETE',
  });

export const updateItemStatus = (id, status) =>
  apiRequest(`/items/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

export const uploadItemImage = (id, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return apiRequest(`/items/${id}/image`, {
    method: 'POST',
    body: formData,
  });
};
```

#### `api/matches.js`
**Matching endpoints**

```javascript
export const getMyMatches = (filters = {}) => {
  const query = new URLSearchParams(filters);
  return apiRequest(`/matches?${query}`);
};

export const getMatchDetails = (matchId) =>
  apiRequest(`/matches/${matchId}`);

export const updateMatchStatus = (matchId, status) =>
  apiRequest(`/matches/${matchId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

export const acceptMatch = (matchId) =>
  updateMatchStatus(matchId, 'ACCEPTED');

export const rejectMatch = (matchId) =>
  updateMatchStatus(matchId, 'REJECTED');
```

#### `api/notifications.js`
**Notification endpoints**

```javascript
export const getNotifications = (filters = {}) => {
  const query = new URLSearchParams(filters);
  return apiRequest(`/notifications?${query}`);
};

export const getUnreadCount = () =>
  apiRequest('/notifications/unread-count');

export const markNotificationAsRead = (id) =>
  apiRequest(`/notifications/${id}/read`, {
    method: 'PUT',
  });

export const markAllAsRead = () =>
  apiRequest('/notifications/mark-all-read', {
    method: 'PUT',
  });
```

#### `api/claims.js`
**Claim endpoints**

```javascript
export const createClaim = (itemId, claimData) =>
  apiRequest(`/items/${itemId}/claim`, {
    method: 'POST',
    body: JSON.stringify(claimData),
  });

export const getMyClams = (filters = {}) => {
  const query = new URLSearchParams(filters);
  return apiRequest(`/claims?${query}`);
};

export const getClaimDetails = (id) =>
  apiRequest(`/claims/${id}`);

export const verifyClaim = (id, verificationCode) =>
  apiRequest(`/claims/${id}/verify`, {
    method: 'POST',
    body: JSON.stringify({ verificationCode }),
  });
```

---

## State Management

### Local Component State
For simple component-level state, use React hooks:

```jsx
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getAllItems();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchItems();
}, []);
```

### Auth Context (Optional)

```jsx
// contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(savedUser);
    setLoading(false);
  }, []);
  
  const login = async (username, password) => {
    const response = await loginUser(username, password);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.accessToken);
    setUser(response.user);
    return response;
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Usage
```jsx
const { user, login, logout } = useAuth();
```

---

## Styling & CSS

### Global CSS Variables (`index.css`)

```css
:root {
  /* Colors */
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  
  /* Neutral Colors */
  --white: #ffffff;
  --black: #000000;
  --gray-100: #f8f9fa;
  --gray-200: #e9ecef;
  --gray-300: #dee2e6;
  --gray-500: #6c757d;
  --gray-700: #495057;
  --gray-900: #212529;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Typography */
  --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto';
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  
  /* Border Radius */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Z-index */
  --z-navbar: 1000;
  --z-modal: 1050;
  --z-tooltip: 1070;
}
```

### Component Styles

CSS is organized at the component level using CSS Modules or inline styles:

```jsx
// Component.jsx
import styles from './Component.module.css';

export default function Component() {
  return <div className={styles.container}>Content</div>;
}
```

```css
/* Component.module.css */
.container {
  padding: var(--spacing-lg);
  background-color: var(--white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
}
```

### Responsive Design

Mobile-first approach using CSS media queries:

```css
/* Mobile (default) */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

/* Tablet and up */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Development Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- Git

### Initial Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Environment File**
   ```bash
   # .env.local (not committed to git)
   VITE_API_BASE_URL=http://localhost:8085
   VITE_APP_NAME="Lost & Found"
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Application opens at `http://localhost:5173`

5. **Run ESLint**
   ```bash
   npm run lint
   ```

6. **Format Code**
   ```bash
   npm run format
   ```

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
```

---

## Building & Deployment

### Production Build
```bash
npm run build
```

Creates optimized bundle in `dist/` directory.

### Preview Build Locally
```bash
npm run preview
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Then drag & drop dist/ folder to Netlify
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview"]
```

---

## Best Practices

1. **Component Structure**
   - One component per file
   - Keep components focused and reusable
   - Use meaningful component names

2. **API Calls**
   - Use the centralized `apiRequest` function
   - Handle errors properly
   - Show loading and error states
   - Use try-catch with async/await

3. **Performance**
   - Use `React.memo()` for expensive components
   - Lazy load pages with `React.lazy()`
   - Avoid unnecessary re-renders
   - Use `useCallback` for event handlers

4. **Styling**
   - Use CSS variables for consistency
   - Mobile-first responsive design
   - Keep CSS scoped to components
   - Avoid inline styles for complex logic

5. **State Management**
   - Keep state as local as possible
   - Lift state up only when needed
   - Use Context for global state
   - Avoid prop drilling

6. **Error Handling**
   - Always catch promise rejections
   - Show user-friendly error messages
   - Log errors for debugging
   - Provide recovery actions

7. **Accessibility**
   - Use semantic HTML
   - Add alt text to images
   - Use proper heading hierarchy
   - Ensure keyboard navigation
   - Test with screen readers

8. **Security**
   - Never store sensitive data in localStorage
   - Always use HTTPS in production
   - Validate user input
   - Sanitize API responses

---

**Last Updated**: 2026-06-18
