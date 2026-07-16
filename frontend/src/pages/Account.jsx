import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resolveImageUrl } from '../utils/resolveImageUrl'

const statusColors = {
  Pending: '#e5a716',
  Contacted: '#2b6cb0',
  Closed: '#2f855a'
}

export default function Account() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const userToken = localStorage.getItem('userToken')
    if (!userToken) {
      navigate('/login')
      return
    }

    const fetchInquiries = async () => {
      try {
        const res = await fetch('/api/v1/inquiries/mine', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        })
        const data = await res.json()
        if (data.success) {
          setInquiries(data.data)
        } else {
          setError(data.error || 'Failed to load your inquiries')
        }
      } catch (err) {
        setError('Network error. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchInquiries()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    window.dispatchEvent(new Event('userLoginStateChanged'))
    navigate('/')
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem', minHeight: '60vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0 }}>My Inquiries</h1>
        <button className="btn" onClick={handleLogout}>Log Out</button>
      </div>

      {loading && <p>Loading your inquiries...</p>}
      {error && <p style={{ color: '#c53030' }}>{error}</p>}

      {!loading && !error && inquiries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          <p>You haven't submitted any inquiries yet.</p>
          <Link to="/tour-packages" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Browse Tour Packages</Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {inquiries.map(inquiry => (
          <div key={inquiry._id} style={{ border: '1px solid var(--border-light)', borderRadius: '10px', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {inquiry.tourPackage?.photo && (
              <img
                src={resolveImageUrl(inquiry.tourPackage.photo)}
                alt={inquiry.tourPackage.title}
                style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
                <strong>{inquiry.tourPackage ? (
                  <Link to={`/tour/${inquiry.tourPackage._id}`}>{inquiry.tourPackage.title}</Link>
                ) : 'General Inquiry'}</strong>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: statusColors[inquiry.status] || '#666',
                  border: `1px solid ${statusColors[inquiry.status] || '#666'}`,
                  borderRadius: '999px',
                  padding: '0.15rem 0.6rem'
                }}>
                  {inquiry.status}
                </span>
              </div>
              <p style={{ margin: '0.4rem 0 0', color: 'var(--text-secondary)' }}>{inquiry.message}</p>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Submitted {new Date(inquiry.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
