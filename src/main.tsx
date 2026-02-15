import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { HomePage } from '@/pages/HomePage'
import GamePage from '@/pages/GamePage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GamePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

