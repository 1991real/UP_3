import { useEffect, useState } from 'react';
import { getAppointments } from '../api/services';

export default function ServicesList() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointments();
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Ошибка при загрузке записей:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleAddToBin = async (serviceId) => {
  const user = JSON.parse(localStorage.getItem("user")); 

  if (!user) {
    alert("Вы должны войти в систему, чтобы добавить услугу в корзину!");
    return;
  }

  try {
    const res = await fetch("http://localhost:3003/bin/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.username,
        password: user.password,
        serviceId
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message);
    } else {
      alert(data.error || "Ошибка при добавлении");
    }
  } catch (err) {
    console.error("Ошибка:", err);
  }
};


  if (loading) return <div>Загрузка Каталога...</div>;
  if (error) return <div style={{ color: "red" }}>Ошибка: {error}</div>;
  if (!appointments.length) return <div>Записей не найдено</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Список услуг ({appointments.length})</h2>
      <div style={{ display: 'grid', gap: '15px' }}>
        {appointments.map(a => (
          <div key={a.ID_service} style={{
            border: '1px solid #dee2e6',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#495057' }}>Название услуги:</strong> 
                <span style={{ marginLeft: '8px', color: '#007bff' }}>{a.ServiceName}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#495057' }}>Описание услуги:</strong> 
                <span style={{ marginLeft: '8px', color: '#007bff' }}>{a.ServiceDescription}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#495057' }}>Цена услуги:</strong> 
                <span style={{ marginLeft: '8px', color: '#007bff' }}>{a.Price}</span>
            </div>
            <button 
              onClick={() => handleAddToBin(a.ID_service)}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Добавить в корзину
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
