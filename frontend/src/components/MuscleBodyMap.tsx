'use client'

import { useState } from 'react'

interface MuscleBodyMapProps {
  selected: string[]
  onSelect: (id: string) => void
  highlightedMuscles?: string[]
  readOnly?: boolean
}

export function MuscleBodyMap({ selected, onSelect, highlightedMuscles = [], readOnly = false }: MuscleBodyMapProps) {
  const [view, setView] = useState<'front' | 'back'>('front')

  return (
    <div>
      {/* Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button onClick={() => setView('front')}
          style={{ padding: '6px 16px', borderRadius: '8px', border: '1.5px solid', borderColor: view === 'front' ? '#2563eb' : '#e5e7eb', background: view === 'front' ? '#2563eb' : 'white', color: view === 'front' ? 'white' : '#6b7280', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
          Front
        </button>
        <button onClick={() => setView('back')}
          style={{ padding: '6px 16px', borderRadius: '8px', border: '1.5px solid', borderColor: view === 'back' ? '#2563eb' : '#e5e7eb', background: view === 'back' ? '#2563eb' : 'white', color: view === 'back' ? 'white' : '#6b7280', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
          Back
        </button>
      </div>

      {/* Image */}
      <div style={{ position: 'relative' }}>
        <img
          src={view === 'front' ? '/front.png' : '/back.png'}
          alt="muscle model"
          style={{ width: '100%', display: 'block', borderRadius: '8px' }}
        />
      </div>
    </div>
  )
}