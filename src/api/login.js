const API_URL = 'http://localhost:3003/login';

export async function login(appointmentData) {
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