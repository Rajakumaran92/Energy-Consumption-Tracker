import React, { useEffect, useState } from "react";
import { API_BASE } from "./config";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function Dashboard({ token }) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [msg, setMsg] = useState("Loading...");
  const barChartRef = React.useRef();
  const lineChartRef = React.useRef();
  const pieChartRef = React.useRef();

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
    if (!rows.length) return;
    
    let barChart, lineChart, pieChart;

    // 1. Bar Chart - Energy consumption per city
    if (barChartRef.current) {
      const byCity = Object.values(rows.reduce((acc, r) => {
        acc[r.city] = acc[r.city] || { city: r.city, energy: 0 };
        acc[r.city].energy += Number(r.energy_consumption);
        return acc;
      }, {}));

      barChart = new Chart(barChartRef.current, {
        type: "bar",
        data: {
          labels: byCity.map(r => r.city),
          datasets: [{
            label: "Energy Consumption (kWh)",
            data: byCity.map(r => r.energy),
            backgroundColor: "#4e79a7",
            borderColor: "#2c5aa0",
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: true },
            title: {
              display: true,
              text: 'Total Energy Consumption by City'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Energy (kWh)'
              }
            }
          }
        }
      });
    }

    // 2. Line Chart - Energy trend over time
    if (lineChartRef.current) {
      const sortedByDate = rows
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .reduce((acc, r) => {
          const date = r.date;
          acc[date] = acc[date] || { date, totalEnergy: 0 };
          acc[date].totalEnergy += Number(r.energy_consumption);
          return acc;
        }, {});

      const timeData = Object.values(sortedByDate);

      lineChart = new Chart(lineChartRef.current, {
        type: "line",
        data: {
          labels: timeData.map(d => new Date(d.date).toLocaleDateString()),
          datasets: [{
            label: "Daily Energy Consumption",
            data: timeData.map(d => d.totalEnergy),
            borderColor: "#e15759",
            backgroundColor: "rgba(225, 87, 89, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: true },
            title: {
              display: true,
              text: 'Energy Consumption Trend Over Time'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Energy (kWh)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            }
          }
        }
      });
    }

    // 3. Pie Chart - Price distribution per city
    if (pieChartRef.current) {
      const priceByCity = Object.values(rows.reduce((acc, r) => {
        acc[r.city] = acc[r.city] || { city: r.city, totalPrice: 0 };
        acc[r.city].totalPrice += Number(r.price);
        return acc;
      }, {}));

      const colors = [
        "#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f",
        "#edc949", "#af7aa1", "#ff9d9a", "#9c755f", "#bab0ab"
      ];

      pieChart = new Chart(pieChartRef.current, {
        type: "pie",
        data: {
          labels: priceByCity.map(r => r.city),
          datasets: [{
            label: "Total Price",
            data: priceByCity.map(r => r.totalPrice),
            backgroundColor: colors.slice(0, priceByCity.length),
            borderColor: "#ffffff",
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { 
              display: true,
              position: 'right'
            },
            title: {
              display: true,
              text: 'Price Distribution by City'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((context.parsed / total) * 100).toFixed(1);
                  return `${context.label}: $${context.parsed.toFixed(2)} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }

    // Cleanup function to destroy charts
    return () => {
      barChart?.destroy();
      lineChart?.destroy();
      pieChart?.destroy();
    };
  }, [rows]);

  return (
    <div className="container">
      <div className="card">
        <h2>Energy Consumption Dashboard</h2>
        {summary && (
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px', margin: '20px 0' }}>
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <strong>Total Uploads</strong><br/>
              <span style={{ fontSize: '28px', color: '#4e79a7', fontWeight: 'bold' }}>{summary.total_uploads}</span>
            </div>
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <strong>Total Records</strong><br/>
              <span style={{ fontSize: '28px', color: '#e15759', fontWeight: 'bold' }}>{summary.total_rows}</span>
            </div>
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <strong>Avg Energy (Latest Upload)</strong><br/>
              <span style={{ fontSize: '28px', color: '#f28e2c', fontWeight: 'bold' }}>{summary.avg_energy_consumption?.toFixed?.(2)} kWh</span>
            </div>
          </div>
        )}
        {msg && <p style={{ color: '#e15759', textAlign: 'center' }}>{msg}</p>}
      </div>

      {/* Top row - Bar and Line charts side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Bar Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', color: '#4e79a7', textAlign: 'center' }}>Energy Consumption by City</h3>
          <div style={{ height: '400px', padding: '10px' }}>
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>

        {/* Line Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', color: '#e15759', textAlign: 'center' }}>Energy Trend Over Time</h3>
          <div style={{ height: '400px', padding: '10px' }}>
            <canvas ref={lineChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Bottom row - Pie chart taking full width but centered */}
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '20px', color: '#f28e2c', textAlign: 'center' }}>Price Distribution by City</h3>
        <div style={{ height: '500px', padding: '20px' }}>
          <canvas ref={pieChartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
