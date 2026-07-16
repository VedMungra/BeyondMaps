import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DestinationsBar from '../components/DestinationsBar'

// Image Slider Component for Tour Card
const TourCardImageSlider = ({ tour }) => {
  const images = tour.gallery && tour.gallery.length > 0
    ? [tour.photo, ...tour.gallery].filter(Boolean)
    : [tour.photo || 'no-photo.jpg']

  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="tour-img-wrapper" style={{ position: 'relative' }}>
      <img
        src={images[currentIndex] ? (images[currentIndex].startsWith('http') ? images[currentIndex] : `/uploads/${images[currentIndex]}`) : 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
        alt={tour.title}
        className="tour-img"
        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
      />
      {images.length > 1 && (
        <>
          <button className="card-slider-btn prev-btn" onClick={handlePrev}>&#8249;</button>
          <button className="card-slider-btn next-btn" onClick={handleNext}>&#8250;</button>
          <div className="card-slider-dots">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`card-slider-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
              ></span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Reusable Section Component
const TourSection = ({ title, tours, loading }) => {
  const scrollRef = useRef(null)
  const navigate = useNavigate()

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (!loading && tours.length === 0) return null // Hide empty sections

  return (
    <section className="tours-section">
      <div className="container">
        <div className="section-header">
          <h2>{title}</h2>
        </div>

        {loading ? (
          <div className="spinner"></div>
        ) : (
          <div className="tour-slider-container">
            <button className="scroll-btn left-btn" onClick={() => scroll('left')}>&#8249;</button>
            <div className="tour-grid" ref={scrollRef}>
              {tours.map(tour => (
                <div
                  key={tour._id}
                  className="tour-card"
                  onClick={() => navigate(`/tour/${tour._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <TourCardImageSlider tour={tour} />

                  <div className="tour-info-avian">
                    <div className="tour-duration-avian">
                      {(() => {
                        const dur = tour.duration || '';
                        if (dur.toLowerCase().includes('night')) return dur;
                        const m = dur.match(/(\d+)/);
                        if (m) {
                          const d = parseInt(m[1], 10);
                          if (d > 0) return `${d} Days ${d - 1} Nights`;
                        }
                        return dur;
                      })()}
                    </div>
                    <h3 className="tour-title-avian">{tour.title}</h3>
                    {(tour.attractions && tour.attractions.length > 0) ? (
                      <div className="tour-subtitle-avian">
                        with {tour.attractions.map(a => typeof a === 'string' ? a : (a.name || '')).join(' & ')}
                      </div>
                    ) : (tour.description && (
                      <div className="tour-subtitle-avian">
                        {tour.description.substring(0, 50)}...
                      </div>
                    ))}

                    <hr className="tour-divider-avian" />

                    <div className="tour-save-badge">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                      <span>Save {Math.round(tour.price * 0.1).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="tour-price-row">
                      <span className="tour-price-avian">₹ {tour.price.toLocaleString('en-IN')}</span>
                      <span className="tour-price-strike">₹ {(tour.price + Math.round(tour.price * 0.1)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="scroll-btn right-btn" onClick={() => scroll('right')}>&#8250;</button>
          </div>
        )}
      </div>
    </section>
  )
}

export default function Home({ category }) {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedGroupLocation, setSelectedGroupLocation] = useState('All')
  const [selectedHomeLocation, setSelectedHomeLocation] = useState(null)
  const navigate = useNavigate()

  const slides = [
    { text: 'Maps for explorers', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' },
    { text: 'Maps for adventures', img: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' },
    { text: 'Maps for colleagues', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' },
    { text: 'Maps for families', img: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' },
    { text: 'Maps for friends', img: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' }
  ]

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const url = category ? `/api/v1/tours?category=${category}` : '/api/v1/tours'
        const res = await fetch(url)
        const data = await res.json()
        setTours(data.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching tours:', error)
        setLoading(false)
      }
    }

    fetchTours()

    // Slider Interval
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [category])

  // Group tours by location (used for Tour Packages)
  const locationGroups = {};
  const unassignedTours = [];

  tours.forEach(t => {
    const locName = (t.location && t.location.name) ? t.location.name : null;
    if (locName) {
      if (!locationGroups[locName]) {
        locationGroups[locName] = [];
      }
      locationGroups[locName].push(t);
    } else {
      unassignedTours.push(t);
    }
  });

  // Unique locations for Group Trips pill filter
  const uniqueLocations = Array.from(
    new Set(tours.map(t => t.location?.name).filter(Boolean))
  ).sort();

  // Scroll handler for DestinationsBar
  const handleDestinationSelect = (locationName) => {
    const el = document.getElementById(`section-${locationName}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <>
      {/* Hero Slider - Only show on Main Home Page when no location is selected */}
      {!category && !selectedHomeLocation && (
        <header className="hero">
          {slides.map((slide, index) => (
            <div key={index} className={`hero-slide ${index === currentSlide ? 'active' : ''}`}>
              <img src={slide.img} alt="Travel Background" className="hero-img" />
            </div>
          ))}

          <div className="container">
            <h1 key={currentSlide} className="fade-in-text">{slides[currentSlide].text}</h1>
            <p>Curated itineraries, expert local guides, and unforgettable journeys to the world's most spectacular destinations.</p>
          </div>
        </header>
      )}

      {/* 1. Main Home Page (No Category) */}
      {!category && (
        <>
          <DestinationsBar 
            activeLocation={selectedHomeLocation}
            onSelect={(loc) => setSelectedHomeLocation(prev => prev === loc ? null : loc)} 
          />
          
          {selectedHomeLocation ? (
            <div className="container" style={{ paddingBottom: '3rem' }}>
              {/* Sub-Navigation Pills */}
              <div style={{ display: 'flex', gap: '0.75rem', padding: '2rem 0 1rem 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
                <button 
                  className="btn btn-outline"
                  style={{ borderRadius: '50px', padding: '0.5rem 1.5rem', whiteSpace: 'nowrap', borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
                >
                  <span style={{ marginRight: '8px' }}>🚗</span> Tour Package
                </button>
                <button 
                  className="btn btn-outline"
                  style={{ borderRadius: '50px', padding: '0.5rem 1.5rem', whiteSpace: 'nowrap', borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
                >
                  <span style={{ marginRight: '8px' }}>👥</span> Group Trip
                </button>
                <button 
                  className="btn btn-outline"
                  style={{ borderRadius: '50px', padding: '0.5rem 1.5rem', whiteSpace: 'nowrap', borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
                >
                  <span style={{ marginRight: '8px' }}>📍</span> Attractions
                </button>
              </div>

              <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)', marginBottom: '2rem' }} />

              <TourSection 
                title="Tour Packages" 
                tours={tours.filter(t => t.location?.name === selectedHomeLocation && t.category === 'Tour Package')} 
                loading={loading} 
              />
              
              <div style={{ marginTop: '2rem' }}>
                <TourSection 
                  title="Group Trips" 
                  tours={tours.filter(t => t.location?.name === selectedHomeLocation && t.category === 'Group Trip')} 
                  loading={loading} 
                />
              </div>
            </div>
          ) : (
            <>
              <TourSection title="Trending Tours" tours={tours.filter(t => t.isTrending)} loading={loading} />
              <TourSection title="Domestic Tours" tours={tours.filter(t => t.region === 'Domestic')} loading={loading} />
              <TourSection title="International Tours" tours={tours.filter(t => t.region === 'International')} loading={loading} />
            </>
          )}
        </>
      )}

      {/* 2. Tour Packages Page */}
      {category === 'Tour Package' && (
        <>
          <DestinationsBar onSelect={handleDestinationSelect} />
          {Object.keys(locationGroups).sort().map(locName => (
            <div id={`section-${locName}`} key={locName} style={{ scrollMarginTop: '100px' }}>
              <TourSection
                title={`${locName} Tour Packages`}
                tours={locationGroups[locName]}
                loading={loading}
              />
            </div>
          ))}
          {unassignedTours.length > 0 && (
            <div id="section-Other" style={{ scrollMarginTop: '100px' }}>
              <TourSection
                title="Other Tour Packages"
                tours={unassignedTours}
                loading={loading}
              />
            </div>
          )}
        </>
      )}

      {/* 3. Group Trips Page */}
      {category === 'Group Trip' && (
        <section className="tours-section" style={{ paddingTop: '2rem' }}>
          <div className="container">
            {/* Pill Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem', scrollbarWidth: 'none' }}>
              <button
                className={`btn ${selectedGroupLocation === 'All' ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: '50px', padding: '0.5rem 1.5rem', whiteSpace: 'nowrap' }}
                onClick={() => setSelectedGroupLocation('All')}
              >
                All
              </button>
              {uniqueLocations.map(loc => (
                <button
                  key={loc}
                  className={`btn ${selectedGroupLocation === loc ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: '50px', padding: '0.5rem 1.5rem', whiteSpace: 'nowrap', borderColor: selectedGroupLocation === loc ? 'transparent' : 'var(--border-light)', color: selectedGroupLocation === loc ? '#fff' : 'var(--text-secondary)' }}
                  onClick={() => setSelectedGroupLocation(loc)}
                >
                  {loc}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="spinner"></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                {tours.filter(t => selectedGroupLocation === 'All' || (t.location && t.location.name === selectedGroupLocation)).map(tour => (
                  <div
                    key={tour._id}
                    className="tour-card"
                    onClick={() => navigate(`/tour/${tour._id}`)}
                    style={{ cursor: 'pointer', margin: 0, minWidth: 'auto' }}
                  >
                    <TourCardImageSlider tour={tour} />

                    <div className="tour-info-avian">
                      <div className="tour-duration-avian">
                        {(() => {
                          const dur = tour.duration || '';
                          if (dur.toLowerCase().includes('night')) return dur;
                          const m = dur.match(/(\d+)/);
                          if (m) {
                            const d = parseInt(m[1], 10);
                            if (d > 0) return `${d} Days ${d - 1} Nights`;
                          }
                          return dur;
                        })()}
                      </div>
                      <h3 className="tour-title-avian">{tour.title}</h3>
                      {(tour.attractions && tour.attractions.length > 0) ? (
                        <div className="tour-subtitle-avian">
                          with {tour.attractions.map(a => typeof a === 'string' ? a : (a.name || '')).join(' & ')}
                        </div>
                      ) : (tour.description && (
                        <div className="tour-subtitle-avian">
                          {tour.description.substring(0, 50)}...
                        </div>
                      ))}

                      <hr className="tour-divider-avian" />

                      <div className="tour-save-badge">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                        <span>Save {Math.round(tour.price * 0.1).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="tour-price-row">
                        <span className="tour-price-avian">₹ {tour.price.toLocaleString('en-IN')}</span>
                        <span className="tour-price-strike">₹ {(tour.price + Math.round(tour.price * 0.1)).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}
