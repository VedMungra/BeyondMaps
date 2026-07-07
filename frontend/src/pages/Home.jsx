import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Reusable Section Component
const TourSection = ({ title, tours, loading }) => {
  if (!loading && tours.length === 0) return null // Hide empty sections

  return (
    <section className="tours-section">
      <div className="container">
        <div className="section-header">
          <h2>{title}</h2>
          <Link to="/tour-packages" className="btn btn-outline">View All</Link>
        </div>

        {loading ? (
          <div className="spinner"></div>
        ) : (
          <div className="tour-grid">
            {tours.map(tour => (
              <div key={tour._id} className="tour-card">
                <div className="tour-img-wrapper">
                  <img
                    src={`/uploads/${tour.photo}`}
                    alt={tour.title}
                    className="tour-img"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
                  />
                  <div className="badge-duration">{tour.duration}</div>
                </div>

                <div className="tour-info">
                  <h3 className="tour-title">{tour.title}</h3>
                  {tour.description && (
                    <div className="tour-route" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {tour.description}
                    </div>
                  )}

                  <div className="tour-footer">
                    <div className="tour-price-box">
                      <span className="tour-price-label">Starting From</span>
                      <span className="tour-price">₹{tour.price}</span>
                    </div>
                    <Link to={`/tour/${tour._id}`} className="btn btn-primary">Details</Link>
                  </div>
                </div>
              </div>
            ))}
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
        const response = await fetch(url)
        const data = await response.json()
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

  // Filter tours into the 3 sections
  const trendingTours = tours.filter(t => t.isTrending)
  const domesticTours = tours.filter(t => t.region === 'Domestic' && !t.isTrending)
  const internationalTours = tours.filter(t => t.region === 'International' && !t.isTrending)

  // Determine prefix based on active category
  const prefix = category ? `${category}: ` : ''

  return (
    <>
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

      {/* Render the 3 sections dynamically */}
      <TourSection title={`${prefix}Trending`} tours={trendingTours} loading={loading} />
      <TourSection title={`${prefix}Domestic Maps`} tours={domesticTours} loading={loading} />
      <TourSection title={`${prefix}International Maps`} tours={internationalTours} loading={loading} />
    </>
  )
}
