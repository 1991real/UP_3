import { useState, useEffect} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// import AppointmentsList from './components/AppointmentsList'
import ServicesList from './components/ServicesList'
import LoginForm from './components/loginForm'
import RegisterForm from './components/registerForm'
import Bin  from './components/bin'
function App() {
  const [count, setCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const usercrypt = localStorage.getItem("user");
    if (usercrypt) {
      try {
        const user = JSON.parse(usercrypt);
        if (user.username && user.password) {
          setIsLoggedIn(true);
        }
      } catch {
        setIsLoggedIn(false);
      }
    }
  }, []);

   return (
    <>
      <div>
        {isLoggedIn ? (
          <>
            <h1>Добро пожаловать в корзину</h1>
            <Bin />
          </>
        ) : (
          <>
            <LoginForm />
            <h1>Or</h1>
            <RegisterForm />
          </>
        )}
        <ServicesList />
      </div>
    </>
  );
}

export default App
