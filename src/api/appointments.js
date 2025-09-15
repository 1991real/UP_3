const API_URL = 'http://localhost:3003/appointments';

export async function getAppointments() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error('Ошибка при получении записей');
    }
    return await response.json();
}

export async function getAppointmentById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
        throw new Error('Ошибка при получении записи');
    }
    return await response.json();
}

export async function createAppointment(appointmentData) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
    });
    if (!response.ok) {
        throw new Error('Ошибка при создании записи');
    }
    return await response.json();
}