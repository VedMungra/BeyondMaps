import React, { useRef } from 'react'

const destinations = [
  { name: 'Ladakh', icon: '🏔️' },
  { name: 'Vietnam', icon: '🗺️' },
  { name: 'Bali', icon: '⛩️' },
  { name: 'Spiti Valley', icon: '🧘‍♂️' },
  { name: 'Thailand', icon: '🐘' },
  { name: 'North East', icon: '⛩️' },
  { name: 'Kashmir', icon: '⛷️' },
  { name: 'Manali', icon: '⛰️' },
  { name: 'Goa', icon: '🏖️' },
  { name: 'Maldives', icon: '🌴' },
  { name: 'Japan', icon: '🌸' },
  { name: 'Swiss Alps', icon: '❄️' },
  { name: 'Dubai', icon: '🐪' },
  { name: 'Paris', icon: '🗼' },
  { name: 'Kerala', icon: '🛶' },
  { name: 'Meghalaya', icon: '🌧️' }
]

export default function DestinationsBar() {
  const scrollRef = useRef(null)

  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
    <div className="destinations-bar">
      <div className="container" style={{ position: 'relative' }}>
        
        <button className="scroll-btn left-btn" onClick={() => scroll(-300)}>
          &#8249;
        </button>

        <div className="destinations-container" ref={scrollRef}>
          {destinations.map((dest, index) => (
            <div key={index} className="destination-item">
              <span className="destination-icon">{dest.icon}</span>
              <span className="destination-name">{dest.name}</span>
            </div>
          ))}
        </div>

        <button className="scroll-btn right-btn" onClick={() => scroll(300)}>
          &#8250;
        </button>

      </div>
    </div>
  )
}
