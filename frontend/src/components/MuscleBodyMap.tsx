'use client'

import { useState } from 'react'

interface MuscleBodyMapProps {
  selected: string[]
  onSelect: (id: string) => void
  highlightedMuscles?: string[]
  readOnly?: boolean
}

interface MuscleRegion {
  id: string
  label: string
  view: 'front' | 'back'
  d?: string
  cx?: number
  cy?: number
  rx?: number
  ry?: number
  type: 'ellipse' | 'path'
}

const muscleRegions: MuscleRegion[] = [
  // Front view
  {
    id: 'chest',
    label: 'Chest',
    view: 'front',
    type: 'ellipse',
    cx: 90,
    cy: 148,
    rx: 26,
    ry: 18,
  },
  {
    id: 'shoulders',
    label: 'Shoulders',
    view: 'front',
    type: 'ellipse',
    cx: 90,
    cy: 118,
    rx: 34,
    ry: 12,
  },
  {
    id: 'biceps',
    label: 'Biceps',
    view: 'front',
    type: 'ellipse',
    cx: 52,
    cy: 163,
    rx: 9,
    ry: 18,
  },
  {
    id: 'core',
    label: 'Core',
    view: 'front',
    type: 'ellipse',
    cx: 90,
    cy: 182,
    rx: 18,
    ry: 20,
  },
  {
    id: 'legs',
    label: 'Quads',
    view: 'front',
    type: 'ellipse',
    cx: 90,
    cy: 280,
    rx: 26,
    ry: 36,
  },
  {
    id: 'calves',
    label: 'Calves',
    view: 'front',
    type: 'ellipse',
    cx: 90,
    cy: 355,
    rx: 20,
    ry: 22,
  },
  // Back view
  {
    id: 'back',
    label: 'Traps',
    view: 'back',
    type: 'ellipse',
    cx: 90,
    cy: 120,
    rx: 28,
    ry: 14,
  },
  {
    id: 'back',
    label: 'Lats',
    view: 'back',
    type: 'ellipse',
    cx: 90,
    cy: 158,
    rx: 26,
    ry: 24,
  },
  {
    id: 'triceps',
    label: 'Triceps',
    view: 'back',
    type: 'ellipse',
    cx: 128,
    cy: 163,
    rx: 9,
    ry: 18,
  },
  {
    id: 'glutes',
    label: 'Glutes',
    view: 'back',
    type: 'ellipse',
    cx: 90,
    cy: 222,
    rx: 28,
    ry: 20,
  },
  {
    id: 'legs',
    label: 'Hamstrings',
    view: 'back',
    type: 'ellipse',
    cx: 90,
    cy: 290,
    rx: 24,
    ry: 34,
  },
  {
    id: 'calves',
    label: 'Calves',
    view: 'back',
    type: 'ellipse',
    cx: 90,
    cy: 355,
    rx: 20,
    ry: 22,
  },
]

// Deduplicated for back view (lats + traps both map to 'back')
const backRegionIds = ['back', 'triceps', 'glutes', 'legs', 'calves']
const frontRegionIds = ['chest', 'shoulders', 'biceps', 'core', 'legs', 'calves']

export function MuscleBodyMap({ selected, onSelect, highlightedMuscles = [], readOnly = false }: MuscleBodyMapProps) {
  const [view, setView] = useState<'front' | 'back'>('front')

  const visibleRegions = muscleRegions.filter(r => r.view === view)

  const isActive = (id: string) => selected.includes(id)
  const isHighlighted = (id: string) => highlightedMuscles.includes(id)

  const getFill = (id: string) => {
    if (isActive(id)) return '#2563eb'
    if (isHighlighted(id)) return '#93c5fd'
    return '#bfdbfe'
  }

  const getFillOpacity = (id: string) => {
    if (isActive(id)) return 0.85
    if (isHighlighted(id)) return 0.7
    return 0.45
  }

  const getStroke = (id: string) => {
    if (isActive(id)) return '#1d4ed8'
    if (isHighlighted(id)) return '#3b82f6'
    return '#93c5fd'
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Front / Back toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium">
        <button
          onClick={() => setView('front')}
          className={`px-4 py-1.5 transition-colors ${view === 'front' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
        >
          Front
        </button>
        <button
          onClick={() => setView('back')}
          className={`px-4 py-1.5 transition-colors ${view === 'back' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
        >
          Back
        </button>
      </div>

      <svg viewBox="0 0 180 400" className="w-full max-w-[160px]" style={{ userSelect: 'none' }}>
        {/* ── Body silhouette ── */}
        {/* Head */}
        <ellipse cx="90" cy="44" rx="22" ry="26" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Neck */}
        <rect x="82" y="66" width="16" height="14" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
        {/* Torso */}
        <rect x="62" y="78" width="56" height="130" rx="14" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Left upper arm */}
        <rect x="38" y="82" width="22" height="72" rx="10" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Right upper arm */}
        <rect x="120" y="82" width="22" height="72" rx="10" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Left forearm */}
        <rect x="40" y="156" width="18" height="58" rx="8" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Right forearm */}
        <rect x="122" y="156" width="18" height="58" rx="8" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Left thigh */}
        <rect x="66" y="210" width="24" height="92" rx="12" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Right thigh */}
        <rect x="90" y="210" width="24" height="92" rx="12" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Left calf */}
        <rect x="68" y="304" width="20" height="76" rx="10" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Right calf */}
        <rect x="92" y="304" width="20" height="76" rx="10" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />

        {/* ── Muscle overlays ── */}
        {visibleRegions.map((region, idx) => {
          const active = isActive(region.id)
          const highlighted = isHighlighted(region.id)
          const cursorClass = readOnly ? 'cursor-default' : 'cursor-pointer'

          return (
            <g key={`${region.id}-${idx}`} onClick={() => !readOnly && onSelect(region.id)}>
              <ellipse
                cx={region.cx}
                cy={region.cy}
                rx={region.rx}
                ry={region.ry}
                fill={getFill(region.id)}
                fillOpacity={getFillOpacity(region.id)}
                stroke={getStroke(region.id)}
                strokeWidth={active ? 2 : 1.5}
                className={`${cursorClass} transition-all duration-200`}
              />
              <text
                x={region.cx}
                y={(region.cy ?? 0) + 4}
                textAnchor="middle"
                fontSize="7"
                fontWeight={active ? 'bold' : 'normal'}
                fill={active ? 'white' : '#1e40af'}
                className="pointer-events-none"
              >
                {region.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-200 border border-blue-400 inline-block" />
          Muscle
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          Selected
        </span>
      </div>
    </div>
  )
}
