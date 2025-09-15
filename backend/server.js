const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sql = require("mssql");

// Load environment variables
dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: "localhost",
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test connection function
async function connectDB() {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query("SELECT TOP 10 * FROM Roles");
    return pool
    // ❌ don't call sql.close() here
  } catch (err) {
    console.error("SQL error", err);
  }
}
app.post('/login', (req, res) => {
  const bodyData = req.body; // this is the data sent in the request body
  console.log(bodyData);

  res.json({
    message: 'Data received successfully!',
    received: bodyData
  });
});

app.get("/roles", async (req, res) => { 
    try { 
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM Roles"); 
        res.json(result.recordset); }
 catch (err) { 
    res.status(500).send(err.message); } });

app.get("/appointments", async (req, res) => { 
    try { 
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM AppointmentsView"); 
        res.json(result.recordset); }
 catch (err) { 
    res.status(500).send(err.message); } });

app.get("/users", async (req, res) => { 
    try { 
       let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM Users"); 
        res.json(result.recordset); }
 catch (err) { 
    res.status(500).send(err.message); } });
app.listen(PORT, () => 
  { console.log(`🚀 Server running on http://localhost:${PORT}`); 
    console.log(`📋 Available endpoints:`);
    console.log(`http://localhost:${PORT}/appointments`);
    console.log(`http://localhost:${PORT}/roles`); });