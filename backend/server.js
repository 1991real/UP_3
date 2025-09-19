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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function connectDB() {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query("SELECT TOP 10 * FROM Roles");
    return pool
  } catch (err) {
    console.error("SQL error", err);
  }
}
app.post("/register", async (req, res) => {
  try {
    const bodyData = req.body;
    console.log("Received register request:", bodyData);

    let pool = await sql.connect(config);

    await pool.request()
      .input("UserName", sql.VarChar(30), bodyData.username)
      .input("Email", sql.VarChar(50), bodyData.email)
      .input("Name", sql.VarChar(40), bodyData.name || null)
      .input("Surname", sql.VarChar(40), bodyData.surname || null)
      .input("MiddleName", sql.VarChar(40), bodyData.middlename || null)
      .input("Password", sql.VarChar(50), bodyData.password)
      .query(`
        INSERT INTO Users (UserName, Email, [Name], [Surname], [MiddleName], [Password])
        VALUES (@UserName, @Email, @Name, @Surname, @MiddleName, @Password)
      `);

    res.json({
      message: "✅ User registered successfully!",
      received: bodyData,
    });
  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});
app.get("/bin", async (req, res) => {
  try {
    const { username, password } = req.query;

    if (username == null || password == null) {
      return res.status(400).json({ error: "Missing username or password" });
    }

    let pool = await sql.connect(config);

    const userResult = await pool.request()
      .input("username", sql.VarChar(30), username)
      .query("SELECT ID_user, Password FROM Users WHERE UserName = @username");

    if (userResult.recordset.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = userResult.recordset[0];

    if (user.Password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const userId = user.ID_user;

    const binResult = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT 
          Bins.ID_bin,
          Bins.Amount,
          Services.ServiceName,
          Services.ID_service,
          Services.ServiceDescription,
          Services.Price
        FROM Bins
        INNER JOIN Services ON Bins.ID_service = Services.ID_service
        WHERE Bins.ID_user = @userId
      `);

    return res.json(binResult.recordset);
  } catch (err) {
    console.error("/bin error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

app.post("/bin/decrement", async (req, res) => {
  const { username, password, serviceId } = req.body;
  try {
    let pool = await sql.connect(config);

    let user = await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password)
      .query(
        "SELECT ID_user FROM Users WHERE UserName=@username AND Password=@password"
      );

    if (user.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid user" });
    }

    const userId = user.recordset[0].ID_user;

    let existing = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("serviceId", sql.Int, serviceId)
      .query(
        "SELECT Amount FROM Bins WHERE ID_user=@userId AND ID_service=@serviceId"
      );

    if (existing.recordset.length === 0) {
      return res.status(400).json({ error: "Service not found in bin" });
    }

    const currentAmount = existing.recordset[0].Amount;

    if (currentAmount > 1) {
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("serviceId", sql.Int, serviceId)
        .query(
          "UPDATE Bins SET Amount = Amount - 1 WHERE ID_user=@userId AND ID_service=@serviceId"
        );
    } else {
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("serviceId", sql.Int, serviceId)
        .query(
          "DELETE FROM Bins WHERE ID_user=@userId AND ID_service=@serviceId"
        );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    let pool = await sql.connect(config);

    const result = await pool.request()
      .input("username", sql.VarChar(30), username)
      .query(`
        SELECT * FROM Users WHERE UserName = @username
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.recordset[0];

    if (user.Password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({
      message: "✅ Login successful!",
      user: {
        id: user.ID_user,
        username: user.UserName,
        email: user.Email,
        password: user.Password,
        role: user.ID_role,
      },
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});
app.post("/bin/add", async (req, res) => {
  const { username, password, serviceId } = req.body;

  if (username == null || password == null) {
    return res.status(400).json({ error: `Missing username, password, or serviceId ${username},${password},${serviceId}` });
  }
  const sid = Number(serviceId);
    if (!Number.isInteger(sid) || sid < 0) {
      return res.status(400).json({ error: "Invalid serviceId" });
    }

  try {
    let pool = await sql.connect(config);
    const userResult = await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password)
      .query(`
        SELECT ID_user FROM Users 
        WHERE UserName = @username AND Password = @password
      `);

    if (userResult.recordset.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userId = userResult.recordset[0].ID_user;

    const check = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("serviceId", sql.Int, serviceId)
      .query(`
        SELECT * FROM Bins 
        WHERE ID_user = @userId AND ID_service = @serviceId
      `);

    if (check.recordset.length > 0) {

      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("serviceId", sql.Int, serviceId)
        .query(`
          UPDATE Bins
          SET Amount = Amount + 1
          WHERE ID_user = @userId AND ID_service = @serviceId
        `);

      return res.json({ message: "Amount incremented" });
    } else {
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("serviceId", sql.Int, serviceId)
        .query(`
          INSERT INTO Bins (ID_user, ID_service, Amount)
          VALUES (@userId, @serviceId, 1)
        `);

      return res.json({ message: "Service added to bin" });
    }
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
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
app.get("/services", async (req, res) => { 
    try { 
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM Services"); 
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