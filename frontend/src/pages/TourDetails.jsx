import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function TourDetails() {
  const { id } = useParams()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)

  // Inquiry Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Review State
  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ userName: '', rating: 5, comments: '' })
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
      const response = await fetch('/api/v1/inquiries', {
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
      const response = await fetch(`/api/v1/tours/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      })

      const data = await response.json()
      if (data.success) {
        setReviewMessage('✅ Review posted successfully!')
        setReviews([data.data, ...reviews]) // Add new review to top of list
        setReviewForm({ userName: '', rating: 5, comments: '' })
      } else {
        setReviewMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setReviewMessage('❌ Network error.')
    } finally {
      setReviewSubmitting(false)
    }
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
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{tour.price}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{tour.duration}</div>
            </div>
          </div>

          {/* Mobile Carousel View */}
          <div className="mobile-gallery">
            <div className="gallery-track">
              {/* First slide is always the cover photo */}
              <img src={`/uploads/${tour.photo}`} alt={`${tour.title} Cover`} className="gallery-slide" />

              {/* Remaining slides are gallery photos */}
              {tour.gallery && tour.gallery.map((img, idx) => (
                <img key={idx} src={`/uploads/${img}`} alt={`${tour.title} ${idx + 1}`} className="gallery-slide" />
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
                <img src={`/uploads/${tour.photo}`} alt={`${tour.title} Cover`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {/* 4 Small Right Images: From the Gallery Array */}
              <div><img src={tour.gallery && tour.gallery[0] ? `/uploads/${tour.gallery[0]}` : 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={`${tour.title} Gallery 1`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              <div><img src={tour.gallery && tour.gallery[1] ? `/uploads/${tour.gallery[1]}` : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={`${tour.title} Gallery 2`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              <div><img src={tour.gallery && tour.gallery[2] ? `/uploads/${tour.gallery[2]}` : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={`${tour.title} Gallery 3`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              <div><img src={tour.gallery && tour.gallery[3] ? `/uploads/${tour.gallery[3]}` : 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={`${tour.title} Gallery 4`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem', marginTop: '3rem' }}>
          <div>
            <div style={{ marginBottom: '4rem', background: 'var(--bg-primary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                {tour.duration}
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
                    let icon = null;
                    if (amenity === 'Stay') icon = <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>;
                    if (amenity === 'Meals' || amenity === 'Breakfast & Dinner') icon = <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>;
                    if (amenity === 'Breakfast') icon = <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>;
                    if (amenity === 'Travelling') icon = <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v8c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>;
                    if (amenity === 'Sightseeing') icon = <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 10h4"/><path d="M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h4z"/><path d="M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3"/><path d="M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H4z"/></svg>;
                    if (amenity === 'Trip Leader') icon = <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M17 8l2 2 4-4"/></svg>;
                    if (amenity === 'Train Ticket') icon = <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="16" rx="2" ry="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="M8 15h0"/><path d="M16 15h0"/><path d="M8 19h8"/><path d="M4 15l-2 4"/><path d="M20 15l2 4"/></svg>;
                    if (amenity === 'Bike & Fuel') icon = <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>;
                    if (amenity === 'Backup Vehicle') icon = <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-4.16.82A1 1 0 0 0 0 12.8V16h3m16 0a3 3 0 1 1-6 0m-8 0a3 3 0 1 1-6 0"/></svg>;
                    if (amenity === 'Volvo Bus') icon = <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><circle cx="16" cy="18" r="2"/></svg>;
                    if (amenity === 'Airport Transfer') icon = <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6l-1.2 2 5.5 3.5-3.5 3.5-2.5-.5-1.5 1.5 3.5 1.5 1.5 3.5 1.5-1.5-.5-2.5 3.5-3.5 3.5 5.5 2-1.2c.4-.2.7-.6.6-1.1z"/></svg>;
                    
                    return (
                      <div key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {icon}
                        <span style={{ fontSize: '1.1rem' }}><strong>{amenity}</strong> included</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Itinerary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '4rem' }}>
              {tour.itinerary.map((day, index) => (
                <div key={index} style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', borderLeft: '4px solid var(--accent-primary)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Day {index + 1}</div>
                  <div style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{day}</div>
                </div>
              ))}
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
                  </div>
                ))
              )}
            </div>

          </div>

          <div>
            <div style={{ position: 'sticky', top: '100px', padding: '2rem', background: 'var(--bg-primary)', border: 'var(--border-light)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-lg)' }}>

              {submitSuccess ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Inquiry Received!</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Our travel experts will contact you shortly to start planning your adventure.</p>
                </div>
              ) : (
                <>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Book this Trip</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Leave your details below and our experts will get back to you.</p>

                  {submitError && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#ffebee', borderRadius: '8px', fontSize: '0.9rem' }}>{submitError}</div>}

                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <input type="text" name="name" className="form-control" placeholder="Full Name" required value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <input type="email" name="email" className="form-control" placeholder="Email Address" required value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <input type="tel" name="phone" className="form-control" placeholder="Phone Number" required value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <textarea name="message" className="form-control" placeholder="Any special requests or questions?" required value={formData.message} onChange={handleInputChange}></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '0.5rem' }} disabled={submitting}>
                      {submitting ? 'Sending...' : 'Inquire Now'}
                    </button>
                  </form>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
