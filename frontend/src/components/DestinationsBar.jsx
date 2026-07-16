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

export default function DestinationsBar({ onSelect, activeLocation }) {
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
          {destinations.map((dest, index) => {
            const isActive = activeLocation === dest.name;
            return (
              <div 
                key={index} 
                className="destination-item"
                onClick={() => onSelect && onSelect(dest.name)}
                style={{ 
                  cursor: onSelect ? 'pointer' : 'default',
                  borderBottom: isActive ? '2px solid red' : 'none',
                  color: isActive ? 'red' : 'inherit',
                  paddingBottom: isActive ? '4px' : '6px' // adjust padding to avoid jumping when border is added
                }}
              >
                <span className="destination-icon" style={{ opacity: isActive ? 1 : 0.7 }}>{dest.icon}</span>
                <span className="destination-name" style={{ color: isActive ? 'red' : 'inherit' }}>{dest.name}</span>
              </div>
            )
          })}
        </div>

        <button className="scroll-btn right-btn" onClick={() => scroll(300)}>
          &#8250;
        </button>

      </div>
    </div>
  )
}
