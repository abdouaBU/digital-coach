'use client'

interface MuscleBodyMapProps {
  selected: string[]
  onSelect: (id: string) => void
  highlightedMuscles?: string[]
  readOnly?: boolean
}

export function MuscleBodyMap({ selected, onSelect, highlightedMuscles = [], readOnly = false }: MuscleBodyMapProps) {
  return (
    <div>
      <p>hello</p>
    </div>
  )
}