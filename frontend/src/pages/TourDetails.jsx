import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

const locationImages = {
  'Ahmedabad': 'https://images.unsplash.com/photo-1587315181754-0737a4c7e415?auto=format&fit=crop&w=400&q=80',
  'Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80',
  'Jammu/Udhampur': 'https://images.unsplash.com/photo-1533227260812-70b991ef23f0?auto=format&fit=crop&w=400&q=80',
  'Srinagar': 'https://images.unsplash.com/photo-1596766795493-27c9b83b8b15?auto=format&fit=crop&w=400&q=80',
  'default': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80'
}

export default function TourDetails() {
  const { id } = useParams()
  const [tour, setTour] = useState(null)
  const [globalAmenities, setGlobalAmenities] = useState([])
  const [loading, setLoading] = useState(true)

  // Inquiry Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Review State
  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ userName: '', rating: 5, comments: '' })
  const [reviewPhotos, setReviewPhotos] = useState(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')

  useEffect(() => {
    const fetchTourAndReviews = async () => {
      try {
        const tourRes = await fetch(`/api/v1/tours/${id}`)
        const tourData = await tourRes.json()
        setTour(tourData.data)

        const reviewRes = await fetch(`/api/v1/tours/${id}/reviews`)
        const reviewData = await reviewRes.json()
        if (reviewData.success) {
          setReviews(reviewData.data)
        }

        const amenitiesRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/amenities')
        const amenitiesData = await amenitiesRes.json()
        if (amenitiesData.success) {
          setGlobalAmenities(amenitiesData.data)
        }

        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchTourAndReviews()
  }, [id])

  // Handlers for Inquiry
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tourPackage: id })
      })

      const data = await response.json()
      if (data.success) {
        setSubmitSuccess(true)
      } else {
        setSubmitError(data.error || 'Failed to submit inquiry')
      }
    } catch (error) {
      setSubmitError('Network error. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handlers for Reviews
  const handleReviewChange = (e) => {
    setReviewForm({ ...reviewForm, [e.target.name]: e.target.value })
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setReviewSubmitting(true)
    setReviewMessage('')

    try {
      const fd = new FormData()
      fd.append('userName', reviewForm.userName)
      fd.append('rating', reviewForm.rating)
      fd.append('comments', reviewForm.comments)

      if (reviewPhotos) {
        Array.from(reviewPhotos).forEach(file => {
          fd.append('photos', file)
        })
      }

      const response = await fetch(`/api/v1/tours/${id}/reviews`, {
        method: 'POST',
        body: fd
      })

      const data = await response.json()
      if (data.success) {
        setReviewMessage('✅ Review posted successfully!')
        setReviews([data.data, ...reviews]) // Add new review to top of list
        setReviewForm({ userName: '', rating: 5, comments: '' })
        setReviewPhotos(null)
        const fileInput = document.getElementById('reviewPhotosInput')
        if (fileInput) fileInput.value = ''
      } else {
        setReviewMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setReviewMessage('❌ Network error.')
    } finally {
      setReviewSubmitting(false)
    }
  }
  const [expandedDays, setExpandedDays] = useState([0])

  const toggleDay = (index) => {
    if (expandedDays.includes(index)) {
      setExpandedDays(expandedDays.filter(i => i !== index))
    } else {
      setExpandedDays([...expandedDays, index])
    }
  }

  const toggleAll = () => {
    if (tour && expandedDays.length === tour.itinerary.length) {
      setExpandedDays([])
    } else if (tour) {
      setExpandedDays(tour.itinerary.map((_, i) => i))
    }
  }

  const parseItineraryDay = (dayText) => {
    if (!dayText) return { title: '', bullets: [] };

    // 1. Try newline logic first (Explicitly used by the new Admin Dashboard fields)
    if (dayText.includes('\n')) {
      const parts = dayText.split('\n');
      return {
        title: parts[0].trim(),
        bullets: parts.slice(1).filter(p => p.trim() !== '')
      };
    }

    // 2. Legacy separator logic (' - ' or ' • ' or ': ')
    const separator = dayText.includes(' - ') ? ' - ' : (dayText.includes(' • ') ? ' • ' : (dayText.includes(': ') ? ': ' : null));

    if (separator) {
      const parts = dayText.split(separator);
      return {
        title: parts[0].trim(),
        bullets: parts.slice(1).join(separator).split('\n').filter(p => p.trim() !== '')
      };
    }

    // 3. Fallback: If it's short, it's just a title
    if (dayText.length < 80) {
      return { title: dayText.trim(), bullets: [] };
    }

    // 4. Ultimate fallback for long text without formatting
    return { title: 'Day Activities', bullets: [dayText.trim()] };
  }

  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedDepartureId, setSelectedDepartureId] = useState(null)

  // Group Trip Selections
  const [selectedLocation, setSelectedLocation] = useState(0)
  const [selectedTravelOption, setSelectedTravelOption] = useState(0)
  const [selectedRoomSharing, setSelectedRoomSharing] = useState(0)
  const [activeQuickInfo, setActiveQuickInfo] = useState(null)

  // Tour Package (Private) Selections
  const [selectedPackageOption, setSelectedPackageOption] = useState(0)
  const [selectedSubPackage, setSelectedSubPackage] = useState(0)

  // Inquiry Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inquiryData, setInquiryData] = useState({
    date: '',
    travellers: ''
  })

  let basePrice = tour ? tour.price : 0
  let finalDuration = tour ? tour.duration : ''
  let dynamicPrice = basePrice
  let dynamicOriginalPrice = basePrice + 2000
  let dynamicSubtitle = tour ? tour.title : ''
  let dynamicSavings = 2000

  if (tour) {
    if (tour.category === 'Group Trip') {
      const currentLoc = tour.startingLocations && tour.startingLocations[selectedLocation]

      if (currentLoc) {
        dynamicPrice = currentLoc.basePrice || basePrice
        finalDuration = currentLoc.duration || finalDuration

        const currentOpt = currentLoc.travelOptions && currentLoc.travelOptions[selectedTravelOption]
        if (currentOpt) {
          dynamicPrice += currentOpt.priceDiff || 0
          dynamicSubtitle = `${currentLoc.name} Package with ${currentOpt.name}`
        } else {
          dynamicSubtitle = `${currentLoc.name} Package`
        }
      }

      if (tour.roomSharing && tour.roomSharing.length > 0) {
        dynamicPrice += tour.roomSharing[selectedRoomSharing]?.priceDiff || 0
      }
      
      dynamicOriginalPrice = dynamicPrice + 2000
      dynamicSavings = 2000

    } else if (tour.category === 'Tour Package') {
      const activeOption = tour.packageOptions && tour.packageOptions[selectedPackageOption];
      if (activeOption) {
        const activePriceTier = activeOption.prices && activeOption.prices[selectedSubPackage];
        if (activePriceTier) {
          dynamicPrice = activePriceTier.discountedPrice || basePrice;
          dynamicOriginalPrice = activePriceTier.originalPrice || (dynamicPrice + 2000);
          dynamicSavings = dynamicOriginalPrice - dynamicPrice;
          dynamicSubtitle = `${activeOption.title} - ${activePriceTier.groupSize}`;
        }
      }
    }
  }

  let displayDuration = finalDuration;
  if (displayDuration && !displayDuration.toLowerCase().includes('night')) {
    const daysMatch = displayDuration.match(/(\d+)/);
    if (daysMatch) {
      const d = parseInt(daysMatch[1], 10);
      if (d > 0) {
        displayDuration = `${d} Days ${d - 1} Nights`;
      }
    }
  }

  let activeDepartures = tour ? tour.departures || [] : [];
  let activeItinerary = tour ? tour.itinerary || [] : [];

  if (tour && tour.category === 'Group Trip') {
    const currentLoc = tour.startingLocations && tour.startingLocations[selectedLocation]
    if (currentLoc) {
      if (currentLoc.departures && currentLoc.departures.length > 0) {
        activeDepartures = currentLoc.departures;
      }
      if (currentLoc.itinerary && currentLoc.itinerary.length > 0) {
        activeItinerary = currentLoc.itinerary;
      }
    }
  }

  let groupedDepartures = {}
  let departureMonths = []
  let activeMonth = ''

  if (activeDepartures && activeDepartures.length > 0) {
    activeDepartures.forEach(dep => {
      const dateObj = new Date(dep.startDate)
      const monthYear = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      if (!groupedDepartures[monthYear]) {
        groupedDepartures[monthYear] = []
      }
      groupedDepartures[monthYear].push(dep)
    })
    departureMonths = Object.keys(groupedDepartures)
    activeMonth = selectedMonth || departureMonths[0]
  }

  if (loading) return <div className="spinner" style={{ margin: '10rem auto' }}></div>
  if (!tour) return <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}><h2>Tour not found</h2><Link to="/">Go Back</Link></div>

  return (
    <div style={{ paddingBottom: '5rem' }}>
      <header style={{ padding: '2rem 0', textAlign: 'left' }}>
        <div className="container">
          <Link to="/" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginBottom: '2rem' }}>&larr; Back to Destinations</Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <h1 style={{ margin: 0, maxWidth: 'none', fontSize: '3.5rem' }}>{tour.title}</h1>
          </div>

          {/* Mobile Carousel View */}
          <div className="mobile-gallery">
            <div className="gallery-track">
              {/* First slide is always the cover photo */}
              <img src={`${import.meta.env.VITE_API_URL || ''}/uploads/${tour.photo}`} alt={`${tour.title} Cover`} className="gallery-slide" />

              {/* Remaining slides are gallery photos */}
              {tour.gallery && tour.gallery.map((img, idx) => (
                <img key={idx} src={`${import.meta.env.VITE_API_URL || ''}/uploads/${img}`} alt={`${tour.title} ${idx + 1}`} className="gallery-slide" />
              ))}
            </div>
            <div className="gallery-counter">
              1 / {(tour.gallery ? tour.gallery.length : 0) + 1}
            </div>
          </div>

          {/* Desktop Masonry View */}
          <div className="desktop-gallery">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '250px 250px', gap: '10px', borderRadius: '16px', overflow: 'hidden', height: '510px' }}>
              {/* Big Left Image: Always the Cover Photo */}
              <div style={{ gridColumn: '1 / 2', gridRow: '1 / 3' }}>
                <img src={`${import.meta.env.VITE_API_URL || ''}/uploads/${tour.photo}`} alt={`${tour.title} Cover`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {/* 4 Small Right Images: From the Gallery Array */}
              <div><img src={tour.gallery && tour.gallery[0] ? `${import.meta.env.VITE_API_URL || ''}/uploads/${tour.gallery[0]}` : 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={`${tour.title} Gallery 1`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              <div><img src={tour.gallery && tour.gallery[1] ? `${import.meta.env.VITE_API_URL || ''}/uploads/${tour.gallery[1]}` : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={`${tour.title} Gallery 2`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              <div><img src={tour.gallery && tour.gallery[2] ? `${import.meta.env.VITE_API_URL || ''}/uploads/${tour.gallery[2]}` : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={`${tour.title} Gallery 3`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              <div><img src={tour.gallery && tour.gallery[3] ? `${import.meta.env.VITE_API_URL || ''}/uploads/${tour.gallery[3]}` : 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={`${tour.title} Gallery 4`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem', marginTop: '3rem' }}>
          <div>
            <div style={{ marginBottom: '4rem', background: 'var(--bg-primary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                {displayDuration}
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                {tour.title}
              </h2>
              <div style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '2.5rem', fontWeight: 500 }}>
                {tour.description}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v8c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
                <span style={{ fontSize: '1.1rem' }}>{tour.category || 'Tour Package'}</span>
              </div>
            </div>

            {/* What's Included Box */}
            {tour.amenities && tour.amenities.length > 0 && (
              <div style={{ background: 'var(--bg-primary)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', marginBottom: '4rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {tour.amenities.map(amenity => {
                    const matchedAmenity = globalAmenities.find(a => a.name === amenity);
                    const iconSvg = matchedAmenity ? matchedAmenity.iconSvg : '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';

                    return (
                      <div key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span dangerouslySetInnerHTML={{ __html: iconSvg }} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }} />
                        <span style={{ fontSize: '1.1rem' }}><strong>{amenity}</strong> included</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}


            {/* Pre-Book Banner (Group Trips) */}
            {tour.category === 'Group Trip' && tour.preBookAmount > 0 && (
              <div style={{ background: '#FFF1F2', padding: '2rem', borderRadius: '16px', border: '1px solid #FECDD3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Reserve your seat now!</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>Pre-Book @ ₹{tour.preBookAmount}</div>
                </div>
                <button className="btn btn-primary" onClick={() => document.getElementById('inquiryForm').scrollIntoView({ behavior: 'smooth' })}>Book Now</button>
              </div>
            )}

            {/* Group Trip Selectors */}
            {tour.category === 'Group Trip' && (
              <div style={{ marginBottom: '4rem' }}>
                {tour.startingLocations && tour.startingLocations.length > 0 && (
                  <div style={{ background: 'var(--bg-primary)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Choose Starting Location</h3>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      {tour.startingLocations.map((loc, idx) => {
                        const isActiveLoc = selectedLocation === idx;
                        const applicableTravelPrice = isActiveLoc
                          ? (loc.travelOptions?.[selectedTravelOption]?.priceDiff || 0)
                          : (loc.travelOptions?.[0]?.priceDiff || 0);

                        const activePrice = loc.basePrice + applicableTravelPrice;
                        const crossedPrice = activePrice + 2000;

                        return (
                          <div
                            key={idx}
                            onClick={() => { setSelectedLocation(idx); setSelectedTravelOption(0); }}
                            style={{ cursor: 'pointer', width: '150px' }}
                          >
                            <div style={{
                              position: 'relative',
                              width: '150px',
                              height: '150px',
                              borderRadius: '16px',
                              padding: '3px',
                              border: isActiveLoc ? '2px solid var(--accent-primary)' : '2px solid transparent',
                              transition: 'all 0.2s',
                              marginBottom: '0.75rem'
                            }}>
                              <img
                                src={locationImages[loc.name] || locationImages['default']}
                                alt={loc.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', display: 'block' }}
                              />
                              <div style={{ position: 'absolute', bottom: '12px', left: '12px', color: 'white', fontWeight: 800, fontSize: '0.9rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                {loc.duration}
                              </div>
                            </div>
                            <div style={{ paddingLeft: '4px' }}>
                              <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{loc.name}</div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'line-through', marginBottom: '0.1rem' }}>₹{crossedPrice}</div>
                              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>₹ {activePrice}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {tour.startingLocations && tour.startingLocations[selectedLocation]?.travelOptions && tour.startingLocations[selectedLocation].travelOptions.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Travelling Options</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {tour.startingLocations[selectedLocation].travelOptions.map((opt, idx) => {
                        const isActiveOpt = selectedTravelOption === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedTravelOption(idx)}
                            style={{
                              padding: '0.75rem 1.5rem',
                              borderRadius: '8px',
                              border: isActiveOpt ? '1px solid var(--accent-primary)' : '1px solid var(--text-primary)',
                              background: isActiveOpt ? 'rgba(239, 68, 68, 0.05)' : 'white',
                              color: isActiveOpt ? 'var(--accent-primary)' : 'var(--text-primary)',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              position: 'relative'
                            }}
                          >
                            {opt.name}
                            {isActiveOpt && (
                              <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--accent-primary)', color: 'white', width: '18px', height: '18px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="4" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {tour.roomSharing && tour.roomSharing.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Room Sharing</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {tour.roomSharing.map((room, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedRoomSharing(idx)}
                          style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '30px',
                            border: selectedRoomSharing === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
                            background: selectedRoomSharing === idx ? 'rgba(239, 68, 68, 0.05)' : 'white',
                            color: selectedRoomSharing === idx ? 'var(--accent-primary)' : 'var(--text-primary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {room.name} {room.priceDiff > 0 ? `(+₹${room.priceDiff})` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tour Package Specific UI */}
            {tour.category === 'Tour Package' && tour.packageOptions && tour.packageOptions.length > 0 && (
              <div style={{ marginBottom: '4rem' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  
                  {/* Package Options Cards */}
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>Package Options</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {tour.packageOptions.map((opt, idx) => {
                      const isSelected = selectedPackageOption === idx;
                      const activePriceObj = opt.prices && opt.prices[selectedSubPackage] ? opt.prices[selectedSubPackage] : opt.prices[0];
                      const origPrice = activePriceObj ? activePriceObj.originalPrice : 0;
                      const discPrice = activePriceObj ? activePriceObj.discountedPrice : 0;
                      
                      return (
                        <div 
                          key={idx}
                          onClick={() => setSelectedPackageOption(idx)}
                          style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: isSelected ? 'rgba(239, 68, 68, 0.03)' : 'white',
                            position: 'relative',
                            boxShadow: isSelected ? '0 4px 12px rgba(239, 68, 68, 0.15)' : 'none'
                          }}
                        >
                          <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                            <img src={opt.image ? `${import.meta.env.VITE_API_URL || ''}/uploads/${opt.image}` : '/assets/no-photo.jpg'} alt={opt.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/default-tour.jpg' }} />
                            <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              {displayDuration}
                            </div>
                            {isSelected && (
                              <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent-primary)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              </div>
                            )}
                          </div>
                          <div style={{ padding: '1.25rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{opt.title}</h3>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>₹{origPrice.toLocaleString()}</span>
                              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>₹{discPrice.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sub Package Options (Group Sizes) */}
                  {tour.packageOptions[selectedPackageOption] && tour.packageOptions[selectedPackageOption].prices && tour.packageOptions[selectedPackageOption].prices.length > 0 && (
                    <>
                      <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontWeight: 700 }}>Sub Package Options</h2>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {tour.packageOptions[selectedPackageOption].prices.map((priceTier, idx) => {
                          const isSelected = selectedSubPackage === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedSubPackage(idx)}
                              style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
                                background: isSelected ? 'rgba(239, 68, 68, 0.05)' : 'white',
                                color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {priceTier.groupSize}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                  
                </div>
              </div>
            )}

            {/* Departure Dates */}
            {tour.category === 'Group Trip' && activeDepartures && activeDepartures.length > 0 && (
              <div style={{ background: 'var(--bg-primary)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Departure Dates</h2>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
                  {departureMonths.map(month => {
                    const isActiveMonth = activeMonth === month;
                    return (
                      <button
                        key={month}
                        onClick={() => setSelectedMonth(month)}
                        style={{
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          border: isActiveMonth ? '1px solid var(--accent-primary)' : '1px solid var(--text-primary)',
                          background: isActiveMonth ? 'rgba(239, 68, 68, 0.05)' : 'white',
                          color: isActiveMonth ? 'var(--accent-primary)' : 'var(--text-primary)',
                          fontWeight: 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                      >
                        {month}
                        {isActiveMonth && (
                          <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--accent-primary)', color: 'white', width: '18px', height: '18px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="4" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  {groupedDepartures[activeMonth]?.map((dep, index) => {
                    const startDate = new Date(dep.startDate);
                    const endDate = new Date(dep.endDate);
                    const isSelected = selectedDepartureId === dep._id;

                    let statusColor = '#10B981'; // Green
                    let statusBg = '#D1FAE5';
                    if (dep.status === 'Filling Fast') {
                      statusColor = '#F59E0B'; // Orange
                      statusBg = '#FEF3C7';
                    } else if (dep.status === 'Sold Out') {
                      statusColor = '#EF4444'; // Red
                      statusBg = '#FEE2E2';
                    }

                    return (
                      <div
                        key={dep._id || index}
                        onClick={() => dep.status !== 'Sold Out' && setSelectedDepartureId(dep._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1.25rem 1.5rem',
                          borderRadius: '12px',
                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-light)',
                          background: isSelected ? 'linear-gradient(90deg, white, rgba(239, 68, 68, 0.1))' : 'white',
                          cursor: dep.status === 'Sold Out' ? 'not-allowed' : 'pointer',
                          opacity: dep.status === 'Sold Out' ? 0.6 : 1,
                          transition: 'all 0.2s',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                          <div style={{ minWidth: '70px' }}>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                              {startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                              {startDate.toLocaleDateString('en-US', { weekday: 'long' })}
                            </div>
                          </div>

                          <div style={{ color: 'var(--text-secondary)' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                          </div>

                          <div style={{ minWidth: '70px' }}>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                              {endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                              {endDate.toLocaleDateString('en-US', { weekday: 'long' })}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>
                          <div style={{ background: statusBg, color: statusColor, padding: '0.5rem 1.5rem', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {dep.status === 'Available' && <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            {dep.status}
                          </div>

                          <div style={{ textAlign: 'right', minWidth: '100px' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                              ₹{dep.price.toLocaleString('en-IN')}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>+ taxes</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '30px' }}
                  disabled={!selectedDepartureId}
                  onClick={() => {
                    const selectedDep = activeDepartures.find(d => d._id === selectedDepartureId);
                    const text = `I would like to book the tour starting on ${new Date(selectedDep.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}.`;
                    setFormData({ ...formData, message: text });
                    setIsModalOpen(true);
                  }}
                >
                  Book Now
                </button>
              </div>
            )}

            {/* Package Price Comparison */}
            {tour.category === 'Group Trip' && tour.startingLocations && tour.startingLocations.length > 0 && (
              <div style={{ marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Package Price Comparison</h2>
                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', background: 'white' }}>
                    <thead>
                      <tr style={{ background: '#F0F4F8', borderBottom: '2px solid var(--border-light)' }}>
                        <th style={{ padding: '1rem', fontWeight: 600 }}>Package</th>
                        <th style={{ padding: '1rem', fontWeight: 600, borderLeft: '1px solid var(--border-light)' }}>Sub Package</th>
                        <th style={{ padding: '1rem', fontWeight: 600, borderLeft: '1px solid var(--border-light)' }}>Regular Price</th>
                        <th style={{ padding: '1rem', fontWeight: 600, borderLeft: '1px solid var(--border-light)', color: '#EF4444' }}>Discounted Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tour.startingLocations.map((loc, locIndex) => {
                        const options = loc.travelOptions && loc.travelOptions.length > 0 ? loc.travelOptions : [{ name: loc.name + ' Package', priceDiff: 0 }];

                        return options.map((opt, optIndex) => {
                          const discountedPrice = (loc.basePrice || tour.price || 0) + (opt.priceDiff || 0);
                          const regularPrice = discountedPrice + 2000;
                          const isSelected = selectedLocation === locIndex && selectedTravelOption === optIndex;

                          // Format duration to like "10D / 9N"
                          let shortDur = '';
                          const durStr = loc.duration || tour.duration || '';
                          const dMatch = durStr.match(/(\d+)/);
                          if (dMatch) {
                            const d = parseInt(dMatch[1], 10);
                            if (d > 0) shortDur = `${d}D / ${d - 1}N`;
                          }

                          return (
                            <tr key={`${locIndex}-${optIndex}`} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              {optIndex === 0 && (
                                <td rowSpan={options.length} style={{ padding: '1.5rem 1rem', borderLeft: '1px solid var(--border-light)', verticalAlign: 'middle' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{loc.name}</div>
                                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{shortDur}</div>
                                </td>
                              )}
                              <td style={{ padding: '1.5rem 1rem', borderLeft: '1px solid var(--border-light)' }}>
                                {opt.name}
                              </td>
                              <td style={{ padding: '1.5rem 1rem', borderLeft: '1px solid var(--border-light)' }}>
                                <div style={{ textDecoration: 'line-through', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>₹{regularPrice.toLocaleString('en-IN')}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>₹ 2,000/- OFF</div>
                              </td>
                              <td style={{ padding: '1.5rem 1rem', borderLeft: '1px solid var(--border-light)' }}>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>₹{discountedPrice.toLocaleString('en-IN')}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>per person</div>
                                {isSelected && (
                                  <div style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.25rem' }}>Selected</div>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                  * All prices are per person and exclude applicable taxes
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>Itinerary</h2>
              <button onClick={toggleAll} style={{ background: 'transparent', border: '1px solid var(--border-light)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="7 13 12 8 17 13"></polyline><polyline points="7 17 12 12 17 17"></polyline></svg>
                {activeItinerary && expandedDays.length === activeItinerary.length ? 'Collapse All' : 'Expand All'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '4rem' }}>
              {activeItinerary.map((dayText, index) => {
                const { title, bullets } = parseItineraryDay(dayText);
                const isExpanded = expandedDays.includes(index);

                const selectedDep = activeDepartures?.find(d => d._id === selectedDepartureId);
                let dayDateStr = null;
                if (selectedDep) {
                  const startDate = new Date(selectedDep.startDate);
                  startDate.setDate(startDate.getDate() + index);
                  dayDateStr = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                }

                return (
                  <div key={index} style={{ marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden' }}>
                    <div onClick={() => toggleDay(index)} style={{ padding: '1rem 1.5rem', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: isExpanded ? '12px 12px 0 0' : '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span style={{ background: '#737373', color: 'white', padding: '0.4rem 1.25rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700 }}>Day {index + 1}</span>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{title}</span>
                      </div>
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '1.5rem', background: 'white', border: '1px solid var(--border-light)', borderTop: 'none', borderRadius: '0 0 12px 12px' }}>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-primary)', lineHeight: 1.8, listStyleType: 'disc' }}>
                          {bullets.map((bullet, i) => (
                            <li key={i} style={{ marginBottom: '0.5rem' }}>
                              {bullet.startsWith('Note:') ? <><strong style={{ fontWeight: 800 }}>Note:</strong>{bullet.substring(5)}</> : bullet}
                            </li>
                          ))}
                        </ul>
                        {dayDateStr && (
                          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            Date: {dayDateStr}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {tour.attractions && tour.attractions.length > 0 && (
              <div style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '2rem', margin: 0 }}>Attractions & Activities</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  {tour.attractions.map((attr, index) => (
                    <div key={index} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                        <img src={attr.image} alt={attr.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://loremflickr.com/400/300/landscape' }} />
                      </div>
                      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{attr.name}</h4>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', flex: 1 }}>{attr.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Info Section */}
            <div style={{ background: 'var(--bg-primary)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', marginBottom: '4rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 800 }}>Quick Info</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {tour?.packingList?.length > 0 && (
                  <button
                    onClick={() => setActiveQuickInfo('packing')}
                    style={{ background: 'var(--bg-secondary)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, transition: 'background 0.2s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginTop: '-2px' }}><path d="M20 7h-3V5c0-1.1-.9-2-2-2H9C7.9 3 7 3.9 7 5v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM9 5h6v2H9V5zm11 14H4V9h16v10z"></path></svg>
                    Packing List
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginLeft: '0.5rem' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                )}
                {tour?.flightPackage?.length > 0 && (
                  <button
                    onClick={() => setActiveQuickInfo('flight')}
                    style={{ background: 'var(--bg-secondary)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, transition: 'background 0.2s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginTop: '-2px' }}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6l-.7 2.1c-.2.5.1 1.1.6 1.3l5.5 2L6 15l-3.3-1c-.5-.1-.9.2-1.1.6l-.7 2.1c-.2.5.1 1.1.6 1.3l11.4 3.7c.5.2 1.1-.1 1.3-.6l1.3-4.5c.2-.5-.1-1.1-.6-1.3l-2-5.5"></path></svg>
                    Flight Package
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginLeft: '0.5rem' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                )}
                {tour?.termsAndConditions?.length > 0 && (
                  <button
                    onClick={() => setActiveQuickInfo('terms')}
                    style={{ background: 'var(--bg-secondary)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, transition: 'background 0.2s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginTop: '-2px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Terms & Conditions
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginLeft: '0.5rem' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                )}
                {tour?.knowBeforeYouBook?.length > 0 && (
                  <button
                    onClick={() => setActiveQuickInfo('knowBefore')}
                    style={{ background: 'var(--bg-secondary)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, transition: 'background 0.2s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginTop: '-2px' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    Know Before You Book
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginLeft: '0.5rem' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                )}
              </div>
            </div>

            {tour.inclusions && tour.inclusions.length > 0 && (
              <div style={{ background: 'var(--bg-primary)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Inclusions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {tour.inclusions.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tour.exclusions && tour.exclusions.length > 0 && (
              <div style={{ background: 'var(--bg-primary)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', marginBottom: '4rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Exclusions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {tour.exclusions.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="#EF4444" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      <span style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="tour-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}></div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Customer Reviews</h2>

            <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Write a Review</h3>
              {reviewMessage && <div style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-secondary)' }}>{reviewMessage}</div>}

              <form onSubmit={handleReviewSubmit}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <input type="text" name="userName" className="form-control" placeholder="Your Name" required value={reviewForm.userName} onChange={handleReviewChange} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <select name="rating" className="form-control" value={reviewForm.rating} onChange={handleReviewChange}>
                      <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                      <option value="4">⭐⭐⭐⭐ (4/5)</option>
                      <option value="3">⭐⭐⭐ (3/5)</option>
                      <option value="2">⭐⭐ (2/5)</option>
                      <option value="1">⭐ (1/5)</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <textarea name="comments" className="form-control" placeholder="Share your experience..." required value={reviewForm.comments} onChange={handleReviewChange} style={{ minHeight: '80px' }}></textarea>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Upload Photos (Max 4)</label>
                  <input
                    type="file"
                    id="reviewPhotosInput"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files.length > 4) {
                        alert('You can only upload up to 4 photos')
                        e.target.value = ''
                        setReviewPhotos(null)
                      } else {
                        setReviewPhotos(e.target.files)
                      }
                    }}
                    className="form-control"
                    style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={reviewSubmitting}>
                  {reviewSubmitting ? 'Posting...' : 'Post Review'}
                </button>
              </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first to review this tour!</p>
              ) : (
                reviews.map(review => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <span className="review-author">{review.userName}</span>
                      <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="review-stars">
                      {'⭐'.repeat(review.rating)}
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6' }}>"{review.comments}"</p>

                    {review.photos && review.photos.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                        {review.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={`${import.meta.env.VITE_API_URL || ''}/uploads/${photo}`}
                            alt={`Review photo ${idx + 1}`}
                            style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>

          <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
              <div style={{ background: '#dcfce7', padding: '0.75rem', textAlign: 'center', color: '#16a34a', fontWeight: 700, fontSize: '0.95rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Save ₹ {dynamicSavings.toLocaleString('en-IN')}
              </div>
              <div style={{ height: '8px', background: 'radial-gradient(circle, white 4px, transparent 4.5px) repeat-x', backgroundSize: '12px 12px', marginTop: '-4px' }}></div>
              <div style={{ padding: '2rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.5rem' }}>Starting from</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.5rem' }}>
                      ₹ {dynamicPrice.toLocaleString('en-IN')}
                    </div>
                    {dynamicOriginalPrice > dynamicPrice && (
                      <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textDecoration: 'line-through', marginBottom: '0.5rem' }}>
                        ₹ {dynamicOriginalPrice.toLocaleString('en-IN')}
                      </div>
                    )}
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>per person</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>+ taxes</div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '0 0 1.5rem 0' }} />

                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{dynamicSubtitle}</div>
                  <div>{finalDuration}</div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1.1rem', fontSize: '1.2rem', fontWeight: 700, borderRadius: '12px' }}
                  onClick={() => setIsModalOpen(true)}
                >
                  Send Enquiry
                </button>
              </div>
            </div>

            {tour.category === 'Group Trip' ? (
              <>
                {/* Private Trips Card */}
                <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', padding: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Private Trips Available</h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>for Group of 2+ Travellers</div>
                  <button
                    style={{ width: '100%', padding: '0.85rem', background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-secondary)', transition: 'all 0.2s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                    onClick={() => setIsModalOpen(true)}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    Request a Callback
                  </button>
                </div>

                {/* Quick Actions Card */}
                <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', padding: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <button
                    style={{ flex: 1, padding: '0.85rem', background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-secondary)', transition: 'all 0.2s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                    onClick={() => window.open('https://wa.me/919999999999', '_blank')}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="#22c55e" strokeWidth="2" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    Whatsapp
                  </button>
                  <button
                    style={{ flex: 1, padding: '0.85rem', background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-secondary)', transition: 'all 0.2s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                    onClick={() => alert('PDF download will be implemented soon!')}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Get PDF
                  </button>
                </div>
              </>
            ) : (
              <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', padding: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Still Got Queries ?</h4>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Have your queries answered by</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>BeyondMaps's Destination Experts</div>
                <button
                  style={{ width: '100%', padding: '0.85rem', background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-secondary)', transition: 'all 0.2s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                  onClick={() => window.open('https://wa.me/919999999999', '_blank')}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="#22c55e" strokeWidth="2" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  Connect with Expert
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '850px', display: 'flex', overflow: 'hidden', position: 'relative', minHeight: '500px' }}>

            {/* Left Image Section */}
            <div style={{ flex: 1, position: 'relative', background: 'var(--bg-secondary)', display: 'none' }} className="d-md-block">
              <img src={`${import.meta.env.VITE_API_URL || ''}/uploads/${tour.photo}`} alt={tour.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>{finalDuration}</div>
                <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>{tour.title}</div>
                <div style={{ color: 'white', fontSize: '0.9rem', opacity: 0.9 }}>{tour.region}</div>
              </div>
            </div>

            {/* Right Form Section */}
            <div style={{ flex: 1, padding: '3rem 2.5rem', position: 'relative' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              {submitSuccess ? (
                <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Inquiry Received!</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Our travel experts will contact you shortly.</p>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 700 }}>Plan Your Next Trip</h3>
                  {submitError && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#ffebee', borderRadius: '8px', fontSize: '0.9rem' }}>{submitError}</div>}

                  <form onSubmit={(e) => {
                    // Inject travel date and pax into the message if present
                    const dateMsg = inquiryData.date ? `\nTravel Date: ${inquiryData.date}` : '';
                    const paxMsg = inquiryData.travellers ? `\nTravellers: ${inquiryData.travellers}` : '';
                    if (dateMsg || paxMsg) {
                      formData.message += `\n${dateMsg}${paxMsg}`;
                    }
                    handleSubmit(e);
                  }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <input type="text" className="form-control" placeholder="Your Name" required value={formData.name} onChange={handleInputChange} name="name" style={{ borderRadius: '8px' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ width: '60px', flexShrink: 0 }}>
                        <input type="text" className="form-control" value="+91" readOnly style={{ borderRadius: '8px', textAlign: 'center', background: 'var(--bg-secondary)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="tel" className="form-control" placeholder="Mobile No." required value={formData.phone} onChange={handleInputChange} name="phone" style={{ borderRadius: '8px' }} />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <input type="email" className="form-control" placeholder="Email (optional)" value={formData.email} onChange={handleInputChange} name="email" style={{ borderRadius: '8px' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <input type="date" className="form-control" placeholder="Date of Travel" value={inquiryData.date} onChange={e => setInquiryData({ ...inquiryData, date: e.target.value })} style={{ borderRadius: '8px', color: 'var(--text-secondary)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="number" className="form-control" placeholder="Traveller Count" value={inquiryData.travellers} onChange={e => setInquiryData({ ...inquiryData, travellers: e.target.value })} style={{ borderRadius: '8px' }} />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <textarea className="form-control" placeholder="Message (optional)" value={formData.message} onChange={handleInputChange} name="message" rows="3" style={{ borderRadius: '8px' }}></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 700, borderRadius: '8px', background: '#e11d48' }} disabled={submitting}>
                      {submitting ? 'Sending...' : 'Connect with Expert'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Info Modal */}
      {activeQuickInfo && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '450px', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>
            <button
              onClick={() => setActiveQuickInfo(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: 800 }}>
              {activeQuickInfo === 'packing' ? 'Packing List' : ''}
              {activeQuickInfo === 'flight' ? 'Flight Package' : ''}
              {activeQuickInfo === 'terms' ? 'Terms & Conditions' : ''}
              {activeQuickInfo === 'knowBefore' ? 'Know Before You Book' : ''}
            </h2>
            <div>
              <ul style={{ paddingLeft: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {activeQuickInfo === 'packing' && tour?.packingList?.map((item, i) => <li key={i}>{item}</li>)}
                {activeQuickInfo === 'flight' && tour?.flightPackage?.map((item, i) => <li key={i}>{item}</li>)}
                {activeQuickInfo === 'terms' && tour?.termsAndConditions?.map((item, i) => <li key={i}>{item}</li>)}
                {activeQuickInfo === 'knowBefore' && tour?.knowBeforeYouBook?.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
