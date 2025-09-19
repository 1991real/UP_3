import React, { useState } from "react";

function LoginForm() {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3003/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        // ✅ Save user info to localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Login successful!");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Error logging in:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "300px", margin: "20px auto" }}>
      <h2>Login</h2>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        required
      /><br />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      /><br />
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;
