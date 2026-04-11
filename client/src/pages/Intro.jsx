import React from 'react'
import { useNavigate } from 'react-router-dom'

const Intro = () => {
  const navigate = useNavigate();
  return (
    <div>
      Intro
      <button onClick={() => navigate("/login")}>Start</button>
    </div>
    
  )
}

export default Intro