import React, { useState } from "react";

function RegisterForm() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    name: "",
    surname: "",
    middlename: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3003/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        // ✅ Save user info to localStorage
        localStorage.setItem("user", JSON.stringify(data.received));
        alert("Registration successful!");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "20px auto" }}>
      <h2>Register</h2>
      <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required /><br />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required /><br />
      <input name="name" placeholder="First Name" value={form.name} onChange={handleChange} /><br />
      <input name="surname" placeholder="Surname" value={form.surname} onChange={handleChange} /><br />
      <input name="middlename" placeholder="Middle Name" value={form.middlename} onChange={handleChange} /><br />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required /><br />
      <button type="submit">Register</button>
    </form>
  );
}

export default RegisterForm;
