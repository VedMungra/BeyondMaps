import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import TourDetails from './pages/TourDetails'
import UserLogin from './pages/UserLogin'
import Account from './pages/Account'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import './index.css'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tour-packages" element={<Home category="Tour Package" />} />
        <Route path="/group-trips" element={<Home category="Group Trip" />} />
        <Route path="/tour/:id" element={<TourDetails />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App
