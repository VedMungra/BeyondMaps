import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState([])
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('manage') // 'leads', 'manage', 'tours'
  const [editingTourId, setEditingTourId] = useState(null)
  const UPLOAD_URL = `${import.meta.env.VITE_API_URL || ''}/uploads/`

  // Tour Form State
  const [newTour, setNewTour] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    itinerary: [''],
    inclusions: '',
    exclusions: '',
    amenities: [],
    departures: [],
    preBookAmount: 0,
    startingLocations: [],
    roomSharing: [],
    packageOptions: [],
    attractions: [],
    category: 'Tour Package',
    region: 'Domestic',
    isTrending: false
  })
  const [tourPhoto, setTourPhoto] = useState(null)
  const [galleryPhotos, setGalleryPhotos] = useState([])
  const [packageOptionPhotos, setPackageOptionPhotos] = useState({})
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState('')
  const [globalAmenities, setGlobalAmenities] = useState([])
  const [newAmenityName, setNewAmenityName] = useState('')
  const [newAmenitySvg, setNewAmenitySvg] = useState('')

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

  const handleItineraryChange = (index, value) => {
    const newItinerary = [...newTour.itinerary];
    newItinerary[index] = value;
    setNewTour({ ...newTour, itinerary: newItinerary });
  }

  const addItineraryDay = () => {
    setNewTour({ ...newTour, itinerary: [...newTour.itinerary, ''] });
  }

  const removeItineraryDay = (index) => {
    const newItinerary = newTour.itinerary.filter((_, i) => i !== index);
    setNewTour({ ...newTour, itinerary: newItinerary });
  }

  const handleAttractionChange = (index, field, value) => {
    const newAttractions = [...(newTour.attractions || [])];
    newAttractions[index][field] = value;
    setNewTour({ ...newTour, attractions: newAttractions });
  }

  const addAttraction = () => {
    setNewTour({ ...newTour, attractions: [...(newTour.attractions || []), { name: '', description: '', image: '' }] });
  }

  const removeAttraction = (index) => {
    const newAttractions = (newTour.attractions || []).filter((_, i) => i !== index);
    setNewTour({ ...newTour, attractions: newAttractions });
  }

  const handleDepartureChange = (index, field, value) => {
    const newDepartures = [...newTour.departures];
    newDepartures[index][field] = value;
    
    if (field === 'startDate' && value && newTour.itinerary) {
      const days = newTour.itinerary.length;
      if (days > 0) {
        const startDate = new Date(value);
        if (!isNaN(startDate.getTime())) {
          startDate.setDate(startDate.getDate() + (days - 1));
          newDepartures[index].endDate = startDate.toISOString().split('T')[0];
        }
      }
    }
    
    setNewTour({ ...newTour, departures: newDepartures });
  }

  const addDeparture = () => {
    setNewTour({ ...newTour, departures: [...newTour.departures, { startDate: '', endDate: '', price: '', status: 'Available' }] });
  }

  const removeDeparture = (index) => {
    const newDepartures = newTour.departures.filter((_, i) => i !== index);
    setNewTour({ ...newTour, departures: newDepartures });
  }

  const addArrayItem = (field, defaultObj) => {
    setNewTour({ ...newTour, [field]: [...newTour[field], defaultObj] });
  }
  const removeArrayItem = (field, index) => {
    const newArr = newTour[field].filter((_, i) => i !== index);
    setNewTour({ ...newTour, [field]: newArr });
  }
  const handleArrayItemChange = (field, index, subField, value) => {
    const newArr = [...newTour[field]];
    newArr[index][subField] = value;
    setNewTour({ ...newTour, [field]: newArr });
  }

  const addTravelOptionToLocation = (locIndex) => {
    const newLocs = [...newTour.startingLocations];
    if (!newLocs[locIndex].travelOptions) newLocs[locIndex].travelOptions = [];
    newLocs[locIndex].travelOptions.push({ name: '', priceDiff: '' });
    setNewTour({ ...newTour, startingLocations: newLocs });
  }
  const removeTravelOptionFromLocation = (locIndex, optIndex) => {
    const newLocs = [...newTour.startingLocations];
    newLocs[locIndex].travelOptions = newLocs[locIndex].travelOptions.filter((_, i) => i !== optIndex);
    setNewTour({ ...newTour, startingLocations: newLocs });
  }
  const handleTravelOptionChange = (locIndex, optIndex, field, value) => {
    const newLocs = [...newTour.startingLocations];
    newLocs[locIndex].travelOptions[optIndex][field] = value;
    setNewTour({ ...newTour, startingLocations: newLocs });
  }

  const handleLocationItineraryChange = (locIndex, dayIndex, value) => {
    const newLocs = [...newTour.startingLocations];
    if (!newLocs[locIndex].itinerary) newLocs[locIndex].itinerary = [''];
    newLocs[locIndex].itinerary[dayIndex] = value;
    setNewTour({ ...newTour, startingLocations: newLocs });
  }

  const duplicateLocation = (locIndex) => {
    const newLocs = [...newTour.startingLocations];
    const locToCopy = newLocs[locIndex];
    const duplicatedLoc = JSON.parse(JSON.stringify(locToCopy));
    duplicatedLoc.name = (duplicatedLoc.name || 'Location') + ' (Copy)';
    newLocs.splice(locIndex + 1, 0, duplicatedLoc);
    setNewTour({ ...newTour, startingLocations: newLocs });
  }

  const addLocationItineraryDay = (locIndex) => {
    const newLocs = [...newTour.startingLocations];
    if (!newLocs[locIndex].itinerary) newLocs[locIndex].itinerary = [];
    newLocs[locIndex].itinerary.push('');
    setNewTour({ ...newTour, startingLocations: newLocs });
  }

  const removeLocationItineraryDay = (locIndex, dayIndex) => {
    const newLocs = [...newTour.startingLocations];
    newLocs[locIndex].itinerary = newLocs[locIndex].itinerary.filter((_, i) => i !== dayIndex);
    setNewTour({ ...newTour, startingLocations: newLocs });
  }

  const handleLocationDepartureChange = (locIndex, depIndex, field, value) => {
    const newLocs = [...newTour.startingLocations];
    if (!newLocs[locIndex].departures) newLocs[locIndex].departures = [];
    newLocs[locIndex].departures[depIndex][field] = value;
    
    if (field === 'startDate' && value && newLocs[locIndex].itinerary) {
      const days = newLocs[locIndex].itinerary.length;
      if (days > 0) {
        const startDate = new Date(value);
        if (!isNaN(startDate.getTime())) {
          startDate.setDate(startDate.getDate() + (days - 1));
          newLocs[locIndex].departures[depIndex].endDate = startDate.toISOString().split('T')[0];
        }
      }
    }
    
    setNewTour({ ...newTour, startingLocations: newLocs });
  }

  const addLocationDeparture = (locIndex) => {
    const newLocs = [...newTour.startingLocations];
    if (!newLocs[locIndex].departures) newLocs[locIndex].departures = [];
    newLocs[locIndex].departures.push({ startDate: '', endDate: '', price: '', status: 'Available' });
    setNewTour({ ...newTour, startingLocations: newLocs });
  }

  const removeLocationDeparture = (locIndex, depIndex) => {
    const newLocs = [...newTour.startingLocations];
    if (!newLocs[locIndex].departures) newLocs[locIndex].departures = [];
    newLocs[locIndex].departures = newLocs[locIndex].departures.filter((_, i) => i !== depIndex);
    setNewTour({ ...newTour, startingLocations: newLocs });
  }

  const handleAddPackageOption = () => {
    setNewTour({ ...newTour, packageOptions: [...newTour.packageOptions, { title: '', image: 'no-photo.jpg', prices: [{ groupSize: '', originalPrice: '', discountedPrice: '' }] }] });
  };

  const handleRemovePackageOption = (index) => {
    const newOptions = [...newTour.packageOptions];
    newOptions.splice(index, 1);
    setNewTour({ ...newTour, packageOptions: newOptions });
    
    // Also clean up photo state
    if (packageOptionPhotos[index]) {
      const newPhotos = { ...packageOptionPhotos };
      delete newPhotos[index];
      // re-index remaining photos
      const reindexed = {};
      Object.keys(newPhotos).forEach(k => {
        const numK = parseInt(k);
        if (numK > index) reindexed[numK - 1] = newPhotos[k];
        else reindexed[k] = newPhotos[k];
      });
      setPackageOptionPhotos(reindexed);
    }
  };

  const handlePackageOptionChange = (index, field, value) => {
    const newOptions = [...newTour.packageOptions];
    newOptions[index][field] = value;
    setNewTour({ ...newTour, packageOptions: newOptions });
  };

  const handleAddPackagePrice = (optIndex) => {
    const newOptions = [...newTour.packageOptions];
    newOptions[optIndex].prices.push({ groupSize: '', originalPrice: '', discountedPrice: '' });
    setNewTour({ ...newTour, packageOptions: newOptions });
  };

  const handleRemovePackagePrice = (optIndex, priceIndex) => {
    const newOptions = [...newTour.packageOptions];
    newOptions[optIndex].prices.splice(priceIndex, 1);
    setNewTour({ ...newTour, packageOptions: newOptions });
  };

  const handlePackagePriceChange = (optIndex, priceIndex, field, value) => {
    const newOptions = [...newTour.packageOptions];
    newOptions[optIndex].prices[priceIndex][field] = value;
    setNewTour({ ...newTour, packageOptions: newOptions });
  };

  const handlePackageOptionPhotoChange = (index, file) => {
    setPackageOptionPhotos({ ...packageOptionPhotos, [index]: file });
  };

  const handleAddGlobalAmenity = async (e) => {
    e.preventDefault()
    if (!newAmenityName.trim() || !newAmenitySvg.trim()) return;

    // Automatically format Avian Experiences image paths and Tailwind classes
    let formattedSvg = newAmenitySvg.trim();
    if (formattedSvg.includes('src="/assets/')) {
      formattedSvg = formattedSvg.replace(/src="\/assets\//g, 'src="https://avianexperiences.com/assets/');
    }
    if (formattedSvg.includes('<img')) {
      formattedSvg = formattedSvg.replace(/class="[^"]*"/g, 'style="width: 24px; height: 24px; object-fit: contain;"');
    }

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/amenities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newAmenityName.trim(), iconSvg: formattedSvg })
      })
      const data = await res.json()
      if (data.success) {
        setGlobalAmenities([...globalAmenities, data.data])
        setNewAmenityName('')
        setNewAmenitySvg('')
      } else {
        alert(data.error || 'Failed to add amenity')
      }
    } catch (err) {
      alert('Network error')
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
        const leadsRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/inquiries`, {
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

        const toursRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/tours`)
        const toursData = await toursRes.json()
        if (toursData.success) {
          setTours(toursData.data)
        }

        const amenitiesRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/amenities`)
        const amenitiesData = await amenitiesRes.json()
        if (amenitiesData.success) {
          setGlobalAmenities(amenitiesData.data)
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
      const itineraryArray = newTour.itinerary.filter(i => i.trim() !== '')
      const inclusionsArray = newTour.inclusions ? newTour.inclusions.split('\n').filter(i => i.trim() !== '') : []
      const exclusionsArray = newTour.exclusions ? newTour.exclusions.split('\n').filter(i => i.trim() !== '') : []
      const packingListArray = newTour.packingList ? newTour.packingList.split('\n').filter(i => i.trim() !== '') : []
      const flightPackageArray = newTour.flightPackage ? newTour.flightPackage.split('\n').filter(i => i.trim() !== '') : []
      const termsAndConditionsArray = newTour.termsAndConditions ? newTour.termsAndConditions.split('\n').filter(i => i.trim() !== '') : []
      const knowBeforeYouBookArray = newTour.knowBeforeYouBook ? newTour.knowBeforeYouBook.split('\n').filter(i => i.trim() !== '') : []

      const method = editingTourId ? 'PUT' : 'POST'
      const url = editingTourId ? `${import.meta.env.VITE_API_URL || ''}/api/v1/tours/${editingTourId}` : `${import.meta.env.VITE_API_URL || ''}/api/v1/tours`

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
          exclusions: exclusionsArray,
          packingList: packingListArray,
          flightPackage: flightPackageArray,
          termsAndConditions: termsAndConditionsArray,
          knowBeforeYouBook: knowBeforeYouBookArray
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

        // 4. Upload Package Option Photos if selected
        if (packageOptionPhotos && Object.keys(packageOptionPhotos).length > 0) {
          for (const optionIndex in packageOptionPhotos) {
            const photoFile = packageOptionPhotos[optionIndex];
            if (photoFile) {
              const formData = new FormData();
              formData.append('file', photoFile);
              await fetch(`/api/v1/tours/${tourId}/package-option/${optionIndex}/photo`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
              });
            }
          }
        }

        setMessage(editingTourId ? '✅ Tour updated successfully!' : '✅ Tour created successfully!')
        setNewTour({ title: '', description: '', price: '', duration: '', itinerary: [''], inclusions: '', exclusions: '', packingList: '', flightPackage: '', termsAndConditions: '', knowBeforeYouBook: '', amenities: [], departures: [], preBookAmount: 0, startingLocations: [], roomSharing: [], packageOptions: [], attractions: [], category: 'Tour Package', region: 'Domestic', isTrending: false })
        setTourPhoto(null)
        setGalleryPhotos([])
        setPackageOptionPhotos({})
        setGalleryPhotos([])
        setEditingTourId(null)

        // Refresh tours
        const toursRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/tours`)
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
      itinerary: tour.itinerary && tour.itinerary.length > 0 ? tour.itinerary : [''],
      inclusions: tour.inclusions ? tour.inclusions.join('\n') : '',
      exclusions: tour.exclusions ? tour.exclusions.join('\n') : '',
      packingList: tour.packingList ? tour.packingList.join('\n') : '',
      flightPackage: tour.flightPackage ? tour.flightPackage.join('\n') : '',
      termsAndConditions: tour.termsAndConditions ? tour.termsAndConditions.join('\n') : '',
      knowBeforeYouBook: tour.knowBeforeYouBook ? tour.knowBeforeYouBook.join('\n') : '',
      amenities: tour.amenities || [],
      departures: tour.departures ? tour.departures.map(d => ({
        startDate: d.startDate ? new Date(d.startDate).toISOString().split('T')[0] : '',
        endDate: d.endDate ? new Date(d.endDate).toISOString().split('T')[0] : '',
        price: d.price,
        status: d.status
      })) : [],
      preBookAmount: tour.preBookAmount || 0,
      startingLocations: tour.startingLocations ? tour.startingLocations.map(loc => ({
        ...loc,
        itinerary: loc.itinerary && loc.itinerary.length > 0 ? loc.itinerary : [''],
        departures: loc.departures ? loc.departures.map(d => ({
          startDate: d.startDate ? new Date(d.startDate).toISOString().split('T')[0] : '',
          endDate: d.endDate ? new Date(d.endDate).toISOString().split('T')[0] : '',
          price: d.price,
          status: d.status
        })) : []
      })) : [],
      roomSharing: tour.roomSharing || [],
      packageOptions: tour.packageOptions || [],
      attractions: tour.attractions || [],
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
          setNewTour({ title: '', description: '', price: '', duration: '', itinerary: [''], inclusions: '', exclusions: '', amenities: [], departures: [], preBookAmount: 0, startingLocations: [], travelOptions: [], roomSharing: [], pricingByGroupSize: [], hotelCategories: [], category: 'Tour Package', region: 'Domestic', isTrending: false })
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

              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Pre-Book Deposit (₹)</label>
                <input type="number" name="preBookAmount" className="form-control" value={newTour.preBookAmount} onChange={handleInputChange} placeholder="e.g. 5000 (0 to disable)" />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
              <textarea name="description" className="form-control" rows="4" required value={newTour.description} onChange={handleInputChange}></textarea>
            </div>

            {newTour.category !== 'Group Trip' && (
              <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600 }}>Itinerary</label>
                {newTour.itinerary.map((day, index) => {
                  const parts = day.split('\n');
                  const dayTitle = parts[0] || '';
                  const dayDesc = parts.slice(1).join('\n') || '';
                  
                  return (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                      <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-light)', fontWeight: 600, width: '80px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px' }}>Day {index + 1}</div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input type="text" className="form-control" style={{ marginBottom: 0 }} value={dayTitle} onChange={(e) => handleItineraryChange(index, e.target.value + '\n' + dayDesc)} placeholder="Day Title (e.g. Arrival at Srinagar)" required />
                        <textarea className="form-control" rows="2" style={{ marginBottom: 0 }} value={dayDesc} onChange={(e) => handleItineraryChange(index, dayTitle + '\n' + e.target.value)} placeholder="Day activities and details..." required />
                      </div>
                      {newTour.itinerary.length > 1 && (
                        <button type="button" className="btn btn-outline" style={{ padding: '0.75rem', borderColor: '#ff4d4f', color: '#ff4d4f', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px' }} onClick={() => removeItineraryDay(index)}>
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      )}
                    </div>
                  )
                })}
                <button type="button" className="btn btn-outline" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={addItineraryDay}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add Day
                </button>
              </div>
            )}

            {newTour.category === 'Group Trip' && (
              <>
                <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600 }}>Starting Locations & Travel Options</label>
                  {newTour.startingLocations.map((loc, locIndex) => (
                    <div key={locIndex} style={{ padding: '1rem', background: 'white', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                        <input type="text" className="form-control" value={loc.name} onChange={(e) => handleArrayItemChange('startingLocations', locIndex, 'name', e.target.value)} placeholder="Location (e.g. Ahmedabad)" required style={{ marginBottom: 0 }} />
                        <input type="text" className="form-control" value={loc.duration} onChange={(e) => handleArrayItemChange('startingLocations', locIndex, 'duration', e.target.value)} placeholder="Duration (e.g. 11 Days)" required style={{ marginBottom: 0 }} />
                        <input type="number" className="form-control" value={loc.basePrice} onChange={(e) => handleArrayItemChange('startingLocations', locIndex, 'basePrice', e.target.value)} placeholder="Base Price (₹)" required style={{ marginBottom: 0 }} />
                        <button type="button" className="btn btn-outline" style={{ padding: '0.65rem', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }} onClick={() => duplicateLocation(locIndex)} title="Duplicate Location (Copy Itinerary & Dates)">
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                        <button type="button" className="btn btn-outline" style={{ padding: '0.65rem', borderColor: '#ff4d4f', color: '#ff4d4f' }} onClick={() => removeArrayItem('startingLocations', locIndex)} title="Remove Location">
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline></svg>
                        </button>
                      </div>

                      <div style={{ paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-light)' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Travel Options for {loc.name || 'this location'}</label>
                        {loc.travelOptions && loc.travelOptions.map((opt, optIndex) => (
                          <div key={optIndex} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                            <input type="text" className="form-control" value={opt.name} onChange={(e) => handleTravelOptionChange(locIndex, optIndex, 'name', e.target.value)} placeholder="Option (e.g. AC Sleeper)" required style={{ marginBottom: 0 }} />
                            <input type="number" className="form-control" value={opt.priceDiff} onChange={(e) => handleTravelOptionChange(locIndex, optIndex, 'priceDiff', e.target.value)} placeholder="Price Diff (e.g. 1500)" required style={{ marginBottom: 0 }} />
                            <button type="button" className="btn btn-outline" style={{ padding: '0.5rem', borderColor: '#ff4d4f', color: '#ff4d4f' }} onClick={() => removeTravelOptionFromLocation(locIndex, optIndex)}>
                              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline></svg>
                            </button>
                          </div>
                        ))}
                        <button type="button" className="btn btn-outline" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }} onClick={() => addTravelOptionToLocation(locIndex)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add Travel Option
                        </button>
                      </div>

                      {/* Location Specific Itinerary */}
                      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>Itinerary for {loc.name || 'this location'}</label>
                        {(loc.itinerary || []).map((day, dayIndex) => {
                          const parts = (day || '').split('\n');
                          const dayTitle = parts[0] || '';
                          const dayDesc = parts.slice(1).join('\n') || '';

                          return (
                            <div key={dayIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                              <div style={{ padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-light)', fontWeight: 600, width: '70px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', height: '38px' }}>Day {dayIndex + 1}</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input type="text" className="form-control" style={{ marginBottom: 0, padding: '0.5rem' }} value={dayTitle} onChange={(e) => handleLocationItineraryChange(locIndex, dayIndex, e.target.value + '\n' + dayDesc)} placeholder="Day Title (e.g. Arrival)" required />
                                <textarea className="form-control" rows="2" style={{ marginBottom: 0, padding: '0.5rem' }} value={dayDesc} onChange={(e) => handleLocationItineraryChange(locIndex, dayIndex, dayTitle + '\n' + e.target.value)} placeholder="Activities..." required />
                              </div>
                              {(loc.itinerary || []).length > 1 && (
                                <button type="button" className="btn btn-outline" style={{ padding: '0.5rem', borderColor: '#ff4d4f', color: '#ff4d4f', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '38px' }} onClick={() => removeLocationItineraryDay(locIndex, dayIndex)}>
                                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline></svg>
                                </button>
                              )}
                            </div>
                          )
                        })}
                        <button type="button" className="btn btn-outline" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }} onClick={() => addLocationItineraryDay(locIndex)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add Day
                        </button>
                      </div>

                      {/* Location Specific Departures */}
                      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>Departure Dates for {loc.name || 'this location'}</label>
                        {(loc.departures || []).map((dep, depIndex) => (
                          <div key={depIndex} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                            <input type="date" className="form-control" value={dep.startDate ? new Date(dep.startDate).toISOString().split('T')[0] : ''} onChange={(e) => handleLocationDepartureChange(locIndex, depIndex, 'startDate', e.target.value)} required style={{ marginBottom: 0 }} />
                            <input type="date" className="form-control" value={dep.endDate ? new Date(dep.endDate).toISOString().split('T')[0] : ''} onChange={(e) => handleLocationDepartureChange(locIndex, depIndex, 'endDate', e.target.value)} required style={{ marginBottom: 0 }} />
                            <input type="number" className="form-control" value={dep.price} onChange={(e) => handleLocationDepartureChange(locIndex, depIndex, 'price', e.target.value)} placeholder="Price (₹)" required style={{ marginBottom: 0 }} />
                            <select className="form-control" value={dep.status} onChange={(e) => handleLocationDepartureChange(locIndex, depIndex, 'status', e.target.value)} style={{ marginBottom: 0 }}>
                              <option value="Available">Available</option>
                              <option value="Filling Fast">Filling Fast</option>
                              <option value="Sold Out">Sold Out</option>
                            </select>
                            <button type="button" className="btn btn-outline" style={{ padding: '0.65rem', borderColor: '#ff4d4f', color: '#ff4d4f' }} onClick={() => removeLocationDeparture(locIndex, depIndex)}>
                              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline></svg>
                            </button>
                          </div>
                        ))}
                        <button type="button" className="btn btn-outline" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }} onClick={() => addLocationDeparture(locIndex)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add Departure Date
                        </button>
                      </div>

                    </div>
                  ))}
                  <button type="button" className="btn btn-outline" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => addArrayItem('startingLocations', { name: '', duration: '', basePrice: '', travelOptions: [], itinerary: [''], departures: [] })}>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add Location
                  </button>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600 }}>Room Sharing</label>
                  {newTour.roomSharing.map((room, index) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <input type="text" className="form-control" value={room.name} onChange={(e) => handleArrayItemChange('roomSharing', index, 'name', e.target.value)} placeholder="Type (e.g. Double Sharing)" required style={{ marginBottom: 0 }} />
                      <input type="number" className="form-control" value={room.priceDiff} onChange={(e) => handleArrayItemChange('roomSharing', index, 'priceDiff', e.target.value)} placeholder="Price Diff (e.g. 2500)" required style={{ marginBottom: 0 }} />
                      <button type="button" className="btn btn-outline" style={{ padding: '0.65rem', borderColor: '#ff4d4f', color: '#ff4d4f' }} onClick={() => removeArrayItem('roomSharing', index)}>
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline></svg>
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => addArrayItem('roomSharing', { name: '', priceDiff: '' })}>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add Room Sharing
                  </button>
                </div>
              </>
            )}

            {newTour.category !== 'Group Trip' && (
              <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600 }}>Departure Dates</label>
                
                {(() => {
                  const departuresByMonth = {};
                  newTour.departures.forEach((dep, index) => {
                    const dateObj = new Date(dep.startDate);
                    const monthYear = (!dep.startDate || isNaN(dateObj.getTime())) ? 'Unscheduled' : dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    if (!departuresByMonth[monthYear]) departuresByMonth[monthYear] = [];
                    departuresByMonth[monthYear].push({ ...dep, originalIndex: index });
                  });
                  
                  // Sort months chronologically, put Unscheduled at the end
                  const sortedMonths = Object.keys(departuresByMonth).sort((a, b) => {
                    if (a === 'Unscheduled') return 1;
                    if (b === 'Unscheduled') return -1;
                    return new Date(a) - new Date(b);
                  });

                  return sortedMonths.map(month => (
                    <div key={month} style={{ marginBottom: '1rem', background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                      <h4 style={{ margin: '0 0 1rem 0', color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{month}</h4>
                      {departuresByMonth[month].map((dep) => {
                        const index = dep.originalIndex;
                        return (
                          <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                            <input type="date" className="form-control" value={dep.startDate ? new Date(dep.startDate).toISOString().split('T')[0] : ''} onChange={(e) => handleDepartureChange(index, 'startDate', e.target.value)} required style={{ marginBottom: 0 }} />
                            <input type="date" className="form-control" value={dep.endDate ? new Date(dep.endDate).toISOString().split('T')[0] : ''} onChange={(e) => handleDepartureChange(index, 'endDate', e.target.value)} required style={{ marginBottom: 0 }} />
                            <input type="number" className="form-control" value={dep.price} onChange={(e) => handleDepartureChange(index, 'price', e.target.value)} placeholder="Price (₹)" required style={{ marginBottom: 0 }} />
                            <select className="form-control" value={dep.status} onChange={(e) => handleDepartureChange(index, 'status', e.target.value)} style={{ marginBottom: 0 }}>
                              <option value="Available">Available</option>
                              <option value="Filling Fast">Filling Fast</option>
                              <option value="Sold Out">Sold Out</option>
                            </select>
                            <button type="button" className="btn btn-outline" style={{ padding: '0.65rem', borderColor: '#ff4d4f', color: '#ff4d4f' }} onClick={() => removeDeparture(index)}>
                              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline></svg>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ))
                })()}

                <button type="button" className="btn btn-outline" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={addDeparture}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add Departure Date
                </button>
              </div>
            )}

            {newTour.category === 'Tour Package' && (
              <>
                <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600 }}>Package Options</label>
                  {newTour.packageOptions.map((opt, optIndex) => (
                    <div key={optIndex} style={{ marginBottom: '1rem', padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      
                      {/* Package Option Header */}
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Package Title</label>
                          <input type="text" className="form-control" value={opt.title} onChange={(e) => handlePackageOptionChange(optIndex, 'title', e.target.value)} placeholder="e.g. Standard" required style={{ marginBottom: 0 }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Card Image (Optional)</label>
                          <input type="file" className="form-control" accept="image/*" onChange={(e) => handlePackageOptionPhotoChange(optIndex, e.target.files[0])} style={{ padding: '0.5rem', fontSize: '0.9rem' }} />
                          {opt.image && opt.image !== 'no-photo.jpg' && !packageOptionPhotos[optIndex] && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Current: {opt.image}</div>
                          )}
                        </div>
                        <button type="button" className="btn btn-outline" style={{ padding: '0.65rem', borderColor: '#ff4d4f', color: '#ff4d4f', marginTop: '1.5rem' }} onClick={() => handleRemovePackageOption(optIndex)}>
                          Remove Package
                        </button>
                      </div>
                      
                      {/* Sub Package Prices */}
                      <div style={{ paddingLeft: '1rem', borderLeft: '3px solid var(--border-light)' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', display: 'block' }}>Sub Package Prices (Group Size)</label>
                        {opt.prices.map((price, priceIndex) => (
                          <div key={priceIndex} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                            <input type="text" className="form-control" value={price.groupSize} onChange={(e) => handlePackagePriceChange(optIndex, priceIndex, 'groupSize', e.target.value)} placeholder="e.g. 6 Person" required style={{ marginBottom: 0 }} />
                            <input type="number" className="form-control" value={price.originalPrice} onChange={(e) => handlePackagePriceChange(optIndex, priceIndex, 'originalPrice', e.target.value)} placeholder="Original (₹)" required style={{ marginBottom: 0 }} />
                            <input type="number" className="form-control" value={price.discountedPrice} onChange={(e) => handlePackagePriceChange(optIndex, priceIndex, 'discountedPrice', e.target.value)} placeholder="Discounted (₹)" required style={{ marginBottom: 0 }} />
                            <button type="button" className="btn btn-outline" style={{ padding: '0.65rem', borderColor: '#ff4d4f', color: '#ff4d4f' }} onClick={() => handleRemovePackagePrice(optIndex, priceIndex)}>
                               <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline></svg>
                            </button>
                          </div>
                        ))}
                        <button type="button" className="btn btn-outline" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleAddPackagePrice(optIndex)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add Price
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button type="button" className="btn btn-outline" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleAddPackageOption}>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add Package Option
                  </button>
                </div>
              </>
            )}

            <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ margin: 0, fontWeight: 600 }}>Attractions & Activities</label>
              </div>
              
              {newTour.attractions && newTour.attractions.map((attr, index) => (
                <div key={index} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="text" className="form-control" value={attr.name || ''} onChange={(e) => handleAttractionChange(index, 'name', e.target.value)} placeholder="Name (e.g. Shikara Ride)" required style={{ marginBottom: 0 }} />
                    <input type="text" className="form-control" value={attr.description || ''} onChange={(e) => handleAttractionChange(index, 'description', e.target.value)} placeholder="Description (e.g. Great way to experience...)" required style={{ marginBottom: 0 }} />
                    <input type="text" className="form-control" value={attr.image || ''} onChange={(e) => handleAttractionChange(index, 'image', e.target.value)} placeholder="Image URL" required style={{ marginBottom: 0 }} />
                    <button type="button" className="btn btn-outline" style={{ padding: '0.65rem', borderColor: '#ff4d4f', color: '#ff4d4f' }} onClick={() => removeAttraction(index)}>
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline></svg>
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-outline" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={addAttraction}>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add Attraction
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
              <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600 }}>Included Amenities</label>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {globalAmenities.map(amenity => (
                  <label key={amenity._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" value={amenity.name} checked={newTour.amenities.includes(amenity.name)} onChange={handleAmenityChange} style={{ width: '18px', height: '18px' }} />
                    <span dangerouslySetInnerHTML={{ __html: amenity.iconSvg }} style={{ display: 'flex', alignItems: 'center', width: '20px', height: '20px' }} />
                    {amenity.name}
                  </label>
                ))}
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Create New Master Amenity</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" className="form-control" placeholder="Name (e.g. WiFi)" value={newAmenityName} onChange={e => setNewAmenityName(e.target.value)} style={{ marginBottom: 0, flex: 1 }} />
                  <input type="text" className="form-control" placeholder="<svg>...</svg>" value={newAmenitySvg} onChange={e => setNewAmenitySvg(e.target.value)} style={{ marginBottom: 0, flex: 2 }} />
                  <button type="button" className="btn btn-outline" onClick={handleAddGlobalAmenity}>Add to Master List</button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Inclusions (One per line)</label>
                <textarea name="inclusions" className="form-control" rows="5" value={newTour.inclusions || ''} onChange={handleInputChange} placeholder="Train Tickets as per Package&#10;Veg Food..."></textarea>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Exclusions (One per line)</label>
                <textarea name="exclusions" className="form-control" rows="5" value={newTour.exclusions || ''} onChange={handleInputChange} placeholder="Any Paid Activity Cost...&#10;GST (5%)..."></textarea>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Packing List (One per line)</label>
                <textarea name="packingList" className="form-control" rows="5" value={newTour.packingList || ''} onChange={handleInputChange} placeholder="Backpack&#10;Trekking Shoes..."></textarea>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Flight Package Info (One per line)</label>
                <textarea name="flightPackage" className="form-control" rows="5" value={newTour.flightPackage || ''} onChange={handleInputChange} placeholder="Delhi to Srinagar flight included..."></textarea>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Terms & Conditions (One per line)</label>
                <textarea name="termsAndConditions" className="form-control" rows="5" value={newTour.termsAndConditions || ''} onChange={handleInputChange} placeholder="Booking amount is non-refundable..."></textarea>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Know Before You Book (One per line)</label>
                <textarea name="knowBeforeYouBook" className="form-control" rows="5" value={newTour.knowBeforeYouBook || ''} onChange={handleInputChange} placeholder="Carry valid ID proof..."></textarea>
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
