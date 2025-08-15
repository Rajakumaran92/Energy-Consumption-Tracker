import React, { useState } from "react";
import { API_BASE } from "./config";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMsg("...");
    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Add this line to ensure cookies are set properly
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.access);
        setMsg("Login successful!");
        setTimeout(() => navigate("/upload"), 1000);
      } else {
        setMsg(data.detail || "Login failed");
      }
    } catch (err) {
      setMsg(String(err));
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={submit}>
          <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
          <br/><br/>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <br/><br/>
          <button type="submit">Login</button>
        </form>
        <p>{msg}</p>
      </div>
    </div>
  );
}
