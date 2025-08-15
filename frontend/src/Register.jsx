import React, { useState } from "react";
import { API_BASE } from "./config";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMsg("...");
    try {
      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Registered! Please login.");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        setMsg(data.detail || JSON.stringify(data));
      }
    } catch (err) {
      setMsg(String(err));
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Register</h2>
        <form onSubmit={submit}>
          <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
          <br/><br/>
          <input placeholder="Email (optional)" value={email} onChange={e=>setEmail(e.target.value)} />
          <br/><br/>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <br/><br/>
          <button type="submit">Register</button>
        </form>
        <p>{msg}</p>
      </div>
    </div>
  );
}
