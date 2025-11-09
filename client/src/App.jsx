import React from 'react';
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registration from './pages/Registration'
import Login from "./pages/Login";
import Home from "./pages/Home";
import './App.css'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App
