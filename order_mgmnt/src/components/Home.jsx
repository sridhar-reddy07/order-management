import React, { useState, useEffect } from "react";
import { FormGroup } from "react-bootstrap";
import { PieChart, Pie, Tooltip, Cell } from "recharts";
import axios from "axios"; // For making API requests

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const renderLegend = (data) => (
  <ul>
    {data.map((entry, index) => (
      <li key={`item-${index}`}>
        <span
          style={{
            backgroundColor: COLORS[index % COLORS.length],
            width: '12px',
            height: '12px',
            display: 'inline-block',
            marginRight: '10px'
          }}
        ></span>
        {entry.name}: {entry.value}
      </li>
    ))}
  </ul>
);

const renderPieChart = (data, title) => {
  // Check if data is defined and is an array
  if (!data || !Array.isArray(data)) {
    return null; // Or return a placeholder if needed
  }

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <PieChart width={300} height={300}>
        <Pie data={data} cx={150} cy={150} outerRadius={100} fill="#8884d8" dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
      {renderLegend(data)}
    </div>
  );
};

const Home = () => {
  const [selectedTeam, setSelectedTeam] = useState("RIZ");
  const [embroideryData, setEmbroideryData] = useState([]);
  const [screenPrintingData, setScreenPrintingData] = useState([]);
  const [total, setTotal] = useState([]);
  const [dtgData, setDtgData] = useState([]);
  const [dtgEmbData, setDtgEmbData] = useState([]);

  // Fetch data when the dropdown selection changes
  useEffect(() => {
    if (selectedTeam) {
      axios.get(`http://localhost:5000/pieorders?team=${selectedTeam}`)
        .then(response => {
        console.log(response.data)
          const { totalOrders, embroideryOrders, screenPrintingOrders, dtgOrders,dtgEmbOrders } = response.data;
          setEmbroideryData(embroideryOrders || []); // Fallback to empty array
          setScreenPrintingData(screenPrintingOrders || []); // Fallback to empty array
          setDtgData(dtgOrders || []); // Fallback to empty array
          setTotal(totalOrders || []); // Fallback to empty array
          setDtgEmbData(dtgEmbOrders || []);
          
        })
        .catch(error => {
          console.error("Error fetching data:", error);
        });
    }
  }, [selectedTeam]);

  return (
    <div className="home-page">
      <div className="dropdown">
        <FormGroup>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            
            <option value="RIZ">RIZ</option>
            <option value="MUSSA">MUSSA</option>
            <option value="KARACHI TEAM">KARACHI TEAM</option>
            <option value="WAREHOUSE JOBS">WAREHOUSE JOBS</option>
          </select>
        </FormGroup>
      </div>

      <div className="home-container">
        {renderPieChart(total, `${selectedTeam} `)}
        {renderPieChart(embroideryData, "Embroidery ")}
        {renderPieChart(screenPrintingData, "Screen Printing")}
        {renderPieChart(dtgData, "DTG ")}
        {renderPieChart(dtgEmbData, "DTG+EMB ")}
      </div>
    </div>
  );
};

export default Home;
