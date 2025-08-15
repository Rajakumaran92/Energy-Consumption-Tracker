
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./Home.jsx";
import Register from "./Register.jsx";
import Login from "./Login.jsx";
import Upload from "./Upload.jsx";
import Dashboard from "./Dashboard.jsx";

function useAuth() {
  // Cookie-based auth: no token in localStorage
  const [authed, setAuthed] = useState(false);
  const login = () => { setAuthed(true); };
  const logout = () => { setAuthed(false); };
  return { authed, login, logout };
}

function Nav({ authed, onLogout }) {
  return (
    <nav className="container">
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
      {authed && <Link to="/upload">Upload</Link>}
      {authed && <Link to="/dashboard">Dashboard</Link>}
      {authed && <button onClick={onLogout} style={{marginLeft: "auto"}}>Logout</button>}
    </nav>
  );
}

function App() {
  const { authed, login, logout } = useAuth();

  return (
    <BrowserRouter>
      <Nav authed={authed} onLogout={logout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="/register" element={<Register />} />
  <Route path="/upload" element={authed ? <Upload /> : <Login onLogin={login} />} />
  <Route path="/dashboard" element={authed ? <Dashboard /> : <Login onLogin={login} />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
