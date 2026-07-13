import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function UserLogin() {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      
      const data = await res.json()
      
      if (data.success) {
        localStorage.setItem('userToken', data.token)
        // Dispatch custom event so Navbar can update instantly
        window.dispatchEvent(new Event('userLoginStateChanged'))
        navigate('/')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)' }}>
      <div style={{ background: 'var(--bg-primary)', padding: '3rem', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Enter your phone number to sign in or create a new account.</p>
        
        {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#ffebee', borderRadius: '8px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input 
              type="tel" 
              placeholder="e.g. +1234567890" 
              className="form-control" 
              required 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
