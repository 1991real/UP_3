import { useEffect, useState } from "react";

export default function Bin() {
  const [bin, setBin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserFromStorage = () => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      const user = JSON.parse(raw);
      return {
        username: user.username,
        password: user.password,
      };
    } catch {
      return null;
    }
  };

  const loadBin = async () => {
    const user = getUserFromStorage();
    if (!user || !user.username || !user.password) {
      setError("Not logged in or invalid user data");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3003/bin?username=${user.username}&password=${user.password}`
      );
      const data = await res.json();

      if (res.ok) {
        setBin(data);
        setError(null);
      } else {
        setError(data.error || "Failed to load bin");
      }
    } catch (err) {
      console.error("Error loading bin:", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDecrement = async (serviceId) => {
    const user = getUserFromStorage();
    if (!user) {
      setError("User not found in localStorage");
      return;
    }

    try {
      const res = await fetch("http://localhost:3003/bin/decrement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          password: user.password,
          serviceId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        loadBin(); // refresh bin after decrement
      } else {
        setError(data.error || "Failed to update bin");
      }
    } catch (err) {
      console.error("Error decrementing service:", err);
      setError("Network error");
    }
  };

  useEffect(() => {
    loadBin();
  }, []);

  if (loading) return <div>Загрузка корзины...</div>;
  if (error) return <div style={{ color: "red" }}>Ошибка: {error}</div>;
  if (!bin.length) return <div>Корзина пуста</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Моя корзина ({bin.length} услуг)</h2>
      <div style={{ display: "grid", gap: "15px" }}>
        {bin.map((item) => (
          <div
            key={item.ID_bin}
            style={{
              border: "1px solid #dee2e6",
              padding: "20px",
              borderRadius: "8px",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#495057' }}>Название:</strong> 
                <span style={{ marginLeft: '8px', color: '#007bff' }}>{item.ServiceName}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#495057' }}>Описание:</strong> 
                <span style={{ marginLeft: '8px', color: '#007bff' }}>{item.ServiceDescription}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#495057' }}>Цена за единицу:</strong> 
                <span style={{ marginLeft: '8px', color: '#007bff' }}>{item.Price}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#495057' }}>Количество:</strong> 
                <span style={{ marginLeft: '8px', color: "black" }}>{item.Amount}</span>
            </div>
            <button
              onClick={() => handleDecrement(item.ID_service)}
              style={{
                marginTop: "10px",
                padding: "6px 12px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              - Уменьшить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
