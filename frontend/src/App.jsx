import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Login from '~/pages/Auth/Login'
import Register from '~/pages/Auth/Register'
import Dashboard from '~/pages/Dashboard/Dashboard'
import Builder from '~/pages/Builder/Builder'
import Preview from '~/pages/Preview/Preview'
import Apps from '~/pages/Apps/Apps'

import './App.css'

// Giới hạn tối đa số dự án
const MAX_PROJECTS = 5

function App() {
  // User state — từ API thật (JWT)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stem-user')
    return saved ? JSON.parse(saved) : null
  })

  // Projects — giữ localStorage
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('stem-projects')
    return saved ? JSON.parse(saved) : []
  })

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('stem-user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('stem-user')
    localStorage.removeItem('accessToken')
  }

  // Auto-save projects vào localStorage
  const handleSetProjects = (updater) => {
    setProjects(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      localStorage.setItem('stem-projects', JSON.stringify(next))
      return next
    })
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <Register onLogin={handleLogin} />}
          />
          <Route
            path="/"
            element={user
              ? <Dashboard user={user} onLogout={handleLogout} projects={projects} setProjects={handleSetProjects} maxProjects={MAX_PROJECTS} />
              : <Navigate to="/login" />
            }
          />
          <Route
            path="/builder/:id"
            element={user
              ? <Builder user={user} onLogout={handleLogout} projects={projects} setProjects={handleSetProjects} />
              : <Navigate to="/login" />
            }
          />
          <Route
            path="/preview/:id"
            element={<Preview projects={projects} />}
          />
          <Route
            path="/apps"
            element={user
              ? <Apps user={user} onLogout={handleLogout} />
              : <Navigate to="/login" />
            }
          />
        </Routes>

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
        />
      </div>
    </BrowserRouter>
  )
}

export default App
