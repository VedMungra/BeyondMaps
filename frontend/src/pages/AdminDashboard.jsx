import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState([])
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('manage') // 'leads', 'manage', 'tours'
  const [editingTourId, setEditingTourId] = useState(null)

  // Tour Form State
  const [newTour, setNewTour] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    itinerary: '',
    inclusions: '',
    exclusions: '',
    amenities: [],
    category: 'Tour Package',
    region: 'Domestic',
    isTrending: false
  })
  const [tourPhoto, setTourPhoto] = useState(null)
  const [galleryPhotos, setGalleryPhotos] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState('')

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setNewTour({ ...newTour, [e.target.name]: value })
  }

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target
    if (checked) {
      setNewTour({ ...newTour, amenities: [...newTour.amenities, value] })
    } else {
      setNewTour({ ...newTour, amenities: newTour.amenities.filter(a => a !== value) })
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin/login')
      return
    }

    const fetchData = async () => {
      try {
        const leadsRes = await fetch('/api/v1/inquiries', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const leadsData = await leadsRes.json()
        if (leadsData.success) {
          setLeads(leadsData.data)
        } else {
          localStorage.removeItem('adminToken')
          navigate('/admin/login')
          return
        }

        const toursRes = await fetch('/api/v1/tours')
        const toursData = await toursRes.json()
        if (toursData.success) {
          setTours(toursData.data)
        }

      } catch (err) {
        console.error('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  const handleCreateTour = async (e) => {
    e.preventDefault()
    setIsCreating(true)
    setMessage('')
    const token = localStorage.getItem('adminToken')

    try {
      // 1. Create Tour JSON
      const itineraryArray = newTour.itinerary.split('\n').filter(i => i.trim() !== '')
      const inclusionsArray = newTour.inclusions ? newTour.inclusions.split('\n').filter(i => i.trim() !== '') : []
      const exclusionsArray = newTour.exclusions ? newTour.exclusions.split('\n').filter(i => i.trim() !== '') : []

      const method = editingTourId ? 'PUT' : 'POST'
      const url = editingTourId ? `/api/v1/tours/${editingTourId}` : '/api/v1/tours'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newTour,
          itinerary: itineraryArray,
          inclusions: inclusionsArray,
          exclusions: exclusionsArray
        })
      })

      const data = await res.json()

      if (data.success) {
        const tourId = data.data._id

        // 2. Upload Cover Photo if selected
        if (tourPhoto) {
          const formData = new FormData()
          formData.append('file', tourPhoto)

          await fetch(`/api/v1/tours/${tourId}/photo`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          })
        }

        // 3. Upload Gallery Photos if selected
        if (galleryPhotos && galleryPhotos.length > 0) {
          const formData = new FormData()
          for (let i = 0; i < galleryPhotos.length; i++) {
            formData.append('files', galleryPhotos[i])
          }

          await fetch(`/api/v1/tours/${tourId}/gallery`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          })
        }

        setMessage(editingTourId ? '✅ Tour updated successfully!' : '✅ Tour created successfully!')
        setNewTour({ title: '', description: '', price: '', duration: '', itinerary: '', inclusions: '', exclusions: '', amenities: [], category: 'Tour Package', region: 'Domestic', isTrending: false })
        setTourPhoto(null)
        setGalleryPhotos([])
        setEditingTourId(null)

        // Refresh tours
        const toursRes = await fetch('/api/v1/tours')
        const toursData = await toursRes.json()
        if (toursData.success) setTours(toursData.data)

        setActiveTab('manage')
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (err) {
      setMessage('❌ Network Error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEdit = (tour) => {
    setNewTour({
      title: tour.title,
      description: tour.description,
      price: tour.price,
      duration: tour.duration,
      itinerary: tour.itinerary.join('\n'),
      inclusions: tour.inclusions ? tour.inclusions.join('\n') : '',
      exclusions: tour.exclusions ? tour.exclusions.join('\n') : '',
      amenities: tour.amenities || [],
      category: tour.category || 'Tour Package',
      region: tour.region || 'Domestic',
      isTrending: tour.isTrending || false
    })
    setEditingTourId(tour._id)
    setActiveTab('tours')
    setMessage('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return
    const token = localStorage.getItem('adminToken')
    try {
      const res = await fetch(`/api/v1/tours/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setTours(tours.filter(t => t._id !== id))
      } else {
        alert('Error deleting tour')
      }
    } catch (err) {
      alert('Network Error')
    }
  }

  if (loading) return <div className="spinner"></div>

  return (
    <div className="container" style={{ padding: '4rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="btn btn-outline">Log Out</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button className={activeTab === 'manage' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setActiveTab('manage')}>Manage Tours</button>
        <button className={activeTab === 'leads' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setActiveTab('leads')}>View Leads</button>
        <button className={activeTab === 'tours' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => {
          setActiveTab('tours')
          setEditingTourId(null)
          setNewTour({ title: '', description: '', price: '', duration: '', itinerary: '', inclusions: '', exclusions: '', amenities: [], category: 'Tour Package', region: 'Domestic', isTrending: false })
          setMessage('')
        }}>Create Tour</button>
      </div>

      {activeTab === 'manage' && (
        <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: 'var(--radius-card)', border: 'var(--border-light)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>All Tours</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Region</th>
                  <th>Price (₹)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tours.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No tours found.</td></tr>
                ) : (
                  tours.map(tour => (
                    <tr key={tour._id}>
                      <td>{tour.title}</td>
                      <td>{tour.category || 'Tour Package'}</td>
                      <td>{tour.region || 'Domestic'}</td>
                      <td>{tour.price}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }} onClick={() => handleEdit(tour)}>Edit</button>
                          <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem', color: '#ff4d4f', borderColor: '#ff4d4f' }} onClick={() => handleDelete(tour._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: 'var(--radius-card)', border: 'var(--border-light)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Inquiries</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Tour ID</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center' }}>No leads yet.</td></tr>
                ) : (
                  leads.map(lead => (
                    <tr key={lead._id}>
                      <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td>{lead.name}</td>
                      <td>{lead.email}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.tourPackage ? (lead.tourPackage.title || 'Unknown Tour') : 'General'}</td>
                      <td>{lead.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tours' && (
        <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: 'var(--radius-card)', border: 'var(--border-light)', maxWidth: '800px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{editingTourId ? 'Edit Tour' : 'Create New Tour'}</h3>
          {message && <div style={{ padding: '1rem', marginBottom: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>{message}</div>}

          <form onSubmit={handleCreateTour}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tour Title</label>
              <input type="text" name="title" className="form-control" required value={newTour.title} onChange={handleInputChange} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Price (₹)</label>
                <input type="number" name="price" className="form-control" required value={newTour.price} onChange={handleInputChange} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Duration (e.g. 10 Days 9 Nights)</label>
                <input type="text" name="duration" className="form-control" required value={newTour.duration} onChange={handleInputChange} placeholder="e.g. 10 Days 9 Nights" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Category</label>
                <select name="category" className="form-control" value={newTour.category} onChange={handleInputChange}>
                  <option value="Tour Package">Tour Package</option>
                  <option value="Group Trip">Group Trip</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Region</label>
                <select name="region" className="form-control" value={newTour.region} onChange={handleInputChange}>
                  <option value="Domestic">Domestic Maps</option>
                  <option value="International">International Maps</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', flex: 1 }}>
                <input type="checkbox" name="isTrending" id="isTrending" checked={newTour.isTrending} onChange={handleInputChange} style={{ width: '20px', height: '20px' }} />
                <label htmlFor="isTrending" style={{ fontWeight: 600, cursor: 'pointer' }}>Mark as Trending</label>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
              <textarea name="description" className="form-control" rows="4" required value={newTour.description} onChange={handleInputChange}></textarea>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Itinerary (One item per line)</label>
              <textarea name="itinerary" className="form-control" rows="6" required value={newTour.itinerary} onChange={handleInputChange} placeholder="Day 1: Arrival...&#10;Day 2: Sightseeing..."></textarea>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
              <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600 }}>Included Amenities (Icons for "What's Included" box)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {['Stay', 'Meals', 'Breakfast', 'Breakfast & Dinner', 'Travelling', 'Sightseeing', 'Trip Leader', 'Train Ticket', 'Bike & Fuel', 'Backup Vehicle', 'Volvo Bus', 'Airport Transfer'].map(amenity => (
                  <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" value={amenity} checked={newTour.amenities.includes(amenity)} onChange={handleAmenityChange} style={{ width: '18px', height: '18px' }} />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Inclusions (One per line)</label>
                <textarea name="inclusions" className="form-control" rows="5" value={newTour.inclusions} onChange={handleInputChange} placeholder="Train Tickets as per Package&#10;Veg Food..."></textarea>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Exclusions (One per line)</label>
                <textarea name="exclusions" className="form-control" rows="5" value={newTour.exclusions} onChange={handleInputChange} placeholder="Any Paid Activity Cost...&#10;GST (5%)..."></textarea>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cover Photo (Max 5MB)</label>
                <input type="file" className="form-control" accept="image/jpeg, image/png, image/jpg" onChange={e => setTourPhoto(e.target.files[0])} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Gallery Photos (Up to 5)</label>
                <input type="file" className="form-control" accept="image/jpeg, image/png, image/jpg" multiple onChange={e => setGalleryPhotos(e.target.files)} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isCreating}>
              {isCreating ? 'Saving...' : (editingTourId ? 'Update Tour Package' : 'Create Tour Package')}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
