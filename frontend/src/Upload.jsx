import React, { useState } from "react";
import { API_BASE } from "./config";

export default function Upload({ token }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setMsg("Uploading...");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${API_BASE}/upload-csv/`, {
        method: "POST",
        credentials: "include",
        body: fd
      });
      const data = await res.json();
      if (res.ok) setMsg("Upload successful!");
      else setMsg(data.detail || "Upload failed");
    } catch (err) {
      setMsg(String(err));
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Upload CSV (100–200 rows)</h2>
        <form onSubmit={submit}>
          <input type="file" accept=".csv" onChange={e=>setFile(e.target.files[0])} />
          <br/><br/>
          <button type="submit">Upload</button>
        </form>
        <p>{msg}</p>
      </div>
    </div>
  );
}
