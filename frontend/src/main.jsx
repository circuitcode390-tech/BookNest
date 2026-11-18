
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Transactions from './pages/Transactions';
import SetupAdmin from './pages/SetupAdmin';
import Users from './pages/Users';

import { request } from './api';
import './style.css';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  const [setupRequired, setSetupRequired] = React.useState(null);
  const [checkError, setCheckError] = React.useState('');

  React.useEffect(() => {
    request('/auth/setup-status')
      .then(data => setSetupRequired(data.setupRequired))
      .catch(err => {
        setCheckError(err.message || 'Unable to connect to BookNest.');
      });
  }, []);

  if (setupRequired === null) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>BookNest</h2>
          <p>{checkError || 'Checking library setup...'}</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/setup-admin"
        element={
          setupRequired
            ? <SetupAdmin />
            : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/login"
        element={
          setupRequired
            ? <Navigate to="/setup-admin" replace />
            : <Login />
        }
      />

      <Route
        path="/"
        element={
          setupRequired
            ? <Navigate to="/setup-admin" replace />
            : (
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="books" element={<Books />} />
        <Route path="transactions" element={<Transactions />} />

        <Route
          path="users"
          element={
            <ProtectedRoute requireAdmin>
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
