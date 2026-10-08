import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Candidate Pages
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import JobStatus from "./pages/JobStatus";
import Jobs from "./pages/Jobs";
import ResumeUpload from "./pages/ResumeUpload";

// Recruiter Pages
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterProfile from "./pages/RecruiterProfile";

import NotFound from "./pages/NotFound";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- Candidate Routes --- */}
        <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/jobs" element={
            <ProtectedRoute><Jobs /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/upload" element={
            <ProtectedRoute><ResumeUpload /></ProtectedRoute>
        } />
        <Route path="/status/:jobId" element={
            <ProtectedRoute><JobStatus /></ProtectedRoute>
        } />

        {/* --- Recruiter Routes --- */}
        <Route path="/recruiter-dashboard" element={
            <ProtectedRoute><RecruiterDashboard /></ProtectedRoute>
        } />
        <Route path="/recruiter-profile" element={
            <ProtectedRoute><RecruiterProfile /></ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}