import AppointmentsList from "../components/appointmentsList";


export async function login(appointmentData) {
    const API_URL = 'http://localhost:3003/login';
    fetch(API_URL, appointmentData)
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON response from the server
    })
    .then(responseData => {
        console.log('Success:', responseData); // Handle the successful response
    })
    .catch(error => {
        console.error('Error:', error); // Handle any errors during the request
    });
}