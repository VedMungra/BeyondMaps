import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../firebase'

export default function UserLogin() {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [confirmationResult, setConfirmationResult] = useState(null)

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.');
        }
      });
    }
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    setLoading(true)
    setError('')

    const phoneNumber = '+91' + phone;
    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send OTP via Firebase');
      if (window.recaptchaVerifier) {
          window.recaptchaVerifier.render().then((widgetId) => {
              if (window.grecaptcha) window.grecaptcha.reset(widgetId);
          });
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    setLoading(true)
    setError('')

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await fetch('/api/v1/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      })
      
      const data = await res.json()
      
      if (data.success) {
        localStorage.setItem('userToken', data.token)
        window.dispatchEvent(new Event('userLoginStateChanged'))
        navigate('/')
      } else {
        setError(data.error || 'Backend verification failed')
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content">
        <button className="login-close-btn" onClick={() => navigate('/')}>&times;</button>
        
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 0 24 24" fill="#e5232a" width="48" height="48">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </div>
          <p className="login-welcome">Welcome to</p>
          <h2 className="login-brand">Beyond Maps</h2>
        </div>

        <div className="login-divider">
          <span>{step === 1 ? 'Log in or Sign up' : 'Enter OTP'}</span>
        </div>

        {error && <div className="login-error">{error}</div>}
        
        {/* Firebase reCAPTCHA MUST always be mounted */}
        <div id="recaptcha-container"></div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="login-form">
            <div className="phone-input-group">
              <span className="country-code">+91</span>
              <input 
                type="tel" 
                placeholder="Enter Mobile Number" 
                className="phone-input" 
                value={phone} 
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required 
                autoFocus
              />
            </div>
            <button type="submit" className="login-continue-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="login-form">
            <div className="phone-input-group" style={{ padding: '0' }}>
              <input 
                type="text" 
                placeholder="Enter 6-digit OTP" 
                className="phone-input" 
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', padding: '0.8rem' }}
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required 
                autoFocus
              />
            </div>
            <button type="submit" className="login-continue-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <button type="button" className="btn-link" onClick={() => setStep(1)} style={{ width: '100%', textAlign: 'center', marginTop: '1rem', color: '#666' }}>
              Change Mobile Number
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>By continuing, you agree to our</p>
          <div className="login-links">
            <a href="#">Terms & Conditions</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  )
}
