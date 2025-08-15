import React, { useEffect, useState } from "react";
import { API_BASE } from "./config";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function Dashboard({ token }) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [msg, setMsg] = useState("Loading...");
  const chartRef = React.useRef();

  useEffect(() => {
    async function load() {
      try {
        const [dataRes, sumRes] = await Promise.all([
          fetch(`${API_BASE}/processed-data/`, { credentials: "include" }),
          fetch(`${API_BASE}/upload-summary/`, { credentials: "include" }),
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
  }, [token]);

  useEffect(() => {
    if (!rows.length || !chartRef.current) return;
    // Example: Energy by City
    const byCity = Object.values(rows.reduce((acc, r) => {
      acc[r.city] = acc[r.city] || { city: r.city, energy: 0 };
      acc[r.city].energy += Number(r.energy_consumption);
      return acc;
    }, {}));
    const chart = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: byCity.map(r => r.city),
        datasets: [{
          label: "Energy Consumption",
          data: byCity.map(r => r.energy),
          backgroundColor: "#4e79a7"
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } }
      }
    });
    return () => chart.destroy();
  }, [rows]);

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
      <div className="card">
        <h3>Energy per City (Bar Chart)</h3>
        <canvas ref={chartRef} height={300}></canvas>
      </div>
    </div>
  );
}
