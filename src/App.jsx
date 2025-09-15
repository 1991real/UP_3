import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import AppointmentsList from './components/AppointmentsList'
import LoginForm from './components/loginForm'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      <LoginForm/>
      <AppointmentsList/>
      </div>
    </>
  )
}

export default App
