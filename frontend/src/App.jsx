import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import DataInput from './components/DataInput';
import ResumeList from './components/ResumeList';
import { createClient } from '@supabase/supabase-js';
import './styles/main.css';

const supabaseUrl = 'https://gxmepzketsyrnkjfsrjf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWVwemtldHN5cm5ramZzcmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MTE0NDMsImV4cCI6MjA1MjI4NzQ0M30.FOhllH5PxQwOCAcXb1C8l3JQqZY99StsaE7qKdZZ0h0'
const supabase = createClient(supabaseUrl, supabaseKey)

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/data-input"
          element={
            <PrivateRoute>
              <DataInput />
            </PrivateRoute>
          }
        />
        <Route
          path="/resumes"
          element={
            <PrivateRoute>
              <ResumeList />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;