import { API_BASE } from "./config.js";
const { useState, useEffect } = React;
const { createRoot } = ReactDOM;
const {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} = Recharts;

function useAuth() {
  // Cookie-based auth: no token in localStorage
  const [authed, setAuthed] = useState(false);
  const login = () => { setAuthed(true); };
  const logout = () => { setAuthed(false); };
  return { authed, login, logout };
}

function Nav({authed, onLogout}) {
  return (
    <nav className="container">
      <a href="#/">Home</a>
      <a href="#/register">Register</a>
      <a href="#/login">Login</a>
      {authed && <a href="#/upload">Upload</a>}
      {authed && <a href="#/dashboard">Dashboard</a>}
      {authed && <button onClick={onLogout} style={{marginLeft: "auto"}}>Logout</button>}
    </nav>
  );
}

function Login({onLogin}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("...");
    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password}),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        onLogin();
        window.location.hash = "#/upload";
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

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("...");
    try {
      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, email, password})
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Registered! Please login.");
        window.location.hash = "#/";
      } else {
        setMsg(JSON.stringify(data));
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

function Upload({token}) {
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

function Dashboard({token}) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [msg, setMsg] = useState("Loading...");

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    async function load() {
      try {
        const [dataRes, sumRes] = await Promise.all([
          fetch(`${API_BASE}/processed-data/`, { headers: authHeaders }),
          fetch(`${API_BASE}/upload-summary/`, { headers: authHeaders }),
        ]);
        const data = await dataRes.json();
        const sum = await sumRes.json();
        if (!dataRes.ok) throw new Error(data.detail || "Failed to load data");
        setRows(data);
        setSummary(sum);
        setMsg("");
      } catch (e) {
        setMsg(String(e));
      }
    }
    load();
  }, []);

  // Bar: Energy by City
  const byCity = Object.values(rows.reduce((acc, r) => {
    acc[r.city] = acc[r.city] || { city: r.city, energy: 0 };
    acc[r.city].energy += Number(r.energy_consumption);
    return acc;
  }, {}));

  // Line: Energy over time
  const byDate = Object.values(rows.reduce((acc, r) => {
    acc[r.date] = acc[r.date] || { date: r.date, energy: 0 };
    acc[r.date].energy += Number(r.energy_consumption);
    return acc;
  }, {})).sort((a,b)=> new Date(a.date) - new Date(b.date));

  // Pie: Price distribution per city
  const priceByCity = Object.values(rows.reduce((acc, r) => {
    acc[r.city] = acc[r.city] || { name: r.city, value: 0 };
    acc[r.city].value += Number(r.price);
    return acc;
  }, {}));

  return (
    <div className="container">
      <div className="card"><h2>Dashboard</h2>
        {summary && <p>
          <strong>Total uploads:</strong> {summary.total_uploads} &nbsp; | &nbsp;
          <strong>Total rows:</strong> {summary.total_rows} &nbsp; | &nbsp;
          <strong>Avg energy (latest):</strong> {summary.avg_energy_consumption?.toFixed?.(2)}
        </p>}
        {msg && <p>{msg}</p>}
      </div>

      <div className="row">
        <div className="card">
          <h3>Energy per City (Bar)</h3>
          <div style={{width:"100%", height: 300}}>
            <ResponsiveContainer>
              <BarChart data={byCity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="energy" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="card">
          <h3>Energy Trend Over Time (Line)</h3>
          <div style={{width:"100%", height: 300}}>
            <ResponsiveContainer>
              <LineChart data={byDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="energy" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="card">
          <h3>Price Distribution per City (Pie)</h3>
          <div style={{width:"100%", height: 300}}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={priceByCity} dataKey="value" nameKey="name" outerRadius={110} label />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { token, login, logout } = useAuth();
  const [route, setRoute] = useState(window.location.hash || "#/");

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const authed = Boolean(token);

  let page = null;
  if (route === "#/" || route === "") page = <div className="container"><div className="card"><h2>Welcome to Energy Consumption Tracker</h2></div></div>;
  else if (route === "#/register") page = <Register/>;
  else if (route === "#/login") page = <Login onLogin={login}/>;
  else if (route === "#/upload") page = authed ? <Upload token={token}/> : <Login onLogin={login}/>;
  else if (route === "#/dashboard") page = authed ? <Dashboard token={token}/> : <Login onLogin={login}/>;
  else page = <div className="container"><div className="card">Not Found</div></div>;

  return (<>
    <Nav authed={authed} onLogout={logout} />
    {page}
  </>);
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
