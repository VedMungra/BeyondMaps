export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3>Beyond Maps</h3>
            <p>We believe travel is about more than just seeing new places. It's about connecting with cultures, challenging yourself, and returning home with stories that last a lifetime.</p>
          </div>
          <div>
            <h3>Join our Newsletter</h3>
            <p>Get exclusive early access to our newest itineraries and special discounts.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email address" className="newsletter-input" />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2026 Beyond Maps. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}
