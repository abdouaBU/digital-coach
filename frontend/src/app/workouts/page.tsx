'use client'

import { useState, useEffect } from 'react'
import { Search, Play, Clock, Flame, Dumbbell, ChevronRight, Camera, Trash2, Star } from 'lucide-react'
import Link from 'next/link'
import { MuscleBodyMap } from '@/components/MuscleBodyMap'

type Category = 'All' | 'Push' | 'Pull' | 'Legs' | 'Full Body' | 'Arms & Core' | 'Custom'

interface Workout {
  id: number
  name: string
  desc: string
  level: string
  levelColor: string
  exercises: number
  duration: string
  calories: number
  muscles: string[]
  categories: Category[]
  isCustom?: boolean
}

const presetWorkouts: Workout[] = [
  {
    id: 1,
    name: 'Chest & Triceps',
    desc: 'Build upper body strength with compound movements',
    level: 'Intermediate',
    levelColor: 'bg-orange-100 text-orange-600',
    exercises: 6,
    duration: '45-60 min',
    calories: 450,
    muscles: ['chest', 'triceps', 'shoulders'],
    categories: ['Push'],
  },
  {
    id: 2,
    name: 'Back & Biceps',
    desc: 'Focus on pulling movements and arm development',
    level: 'Intermediate',
    levelColor: 'bg-orange-100 text-orange-600',
    exercises: 7,
    duration: '50-65 min',
    calories: 520,
    muscles: ['back', 'biceps'],
    categories: ['Pull'],
  },
  {
    id: 3,
    name: 'Leg Day',
    desc: 'Complete lower body workout for mass and strength',
    level: 'Advanced',
    levelColor: 'bg-red-100 text-red-600',
    exercises: 8,
    duration: '60-75 min',
    calories: 680,
    muscles: ['legs', 'glutes', 'calves'],
    categories: ['Legs'],
  },
  {
    id: 4,
    name: 'Shoulder & Core',
    desc: 'Develop strong shoulders and stabilizing core',
    level: 'Beginner',
    levelColor: 'bg-green-100 text-green-600',
    exercises: 6,
    duration: '40-50 min',
    calories: 380,
    muscles: ['shoulders', 'core'],
    categories: ['Push'],
  },
  {
    id: 5,
    name: 'Full Body Power',
    desc: 'Complete workout hitting all major muscle groups',
    level: 'Advanced',
    levelColor: 'bg-red-100 text-red-600',
    exercises: 10,
    duration: '60-75 min',
    calories: 720,
    muscles: ['chest', 'back', 'legs', 'shoulders', 'core'],
    categories: ['Full Body'],
  },
  {
    id: 6,
    name: 'Arms Blast',
    desc: 'Intense arm workout for biceps and triceps growth',
    level: 'Intermediate',
    levelColor: 'bg-orange-100 text-orange-600',
    exercises: 8,
    duration: '45-55 min',
    calories: 420,
    muscles: ['biceps', 'triceps'],
    categories: ['Arms & Core'],
  },
  {
    id: 7,
    name: 'Romanian Deadlift Focus',
    desc: 'Hamstrings and posterior chain specialization',
    level: 'Intermediate',
    levelColor: 'bg-orange-100 text-orange-600',
    exercises: 6,
    duration: '45-60 min',
    calories: 490,
    muscles: ['legs', 'glutes', 'back'],
    categories: ['Pull', 'Legs'],
  },
  {
    id: 8,
    name: 'Core Crusher',
    desc: 'Functional core training for stability and strength',
    level: 'Beginner',
    levelColor: 'bg-green-100 text-green-600',
    exercises: 7,
    duration: '35-45 min',
    calories: 310,
    muscles: ['core', 'shoulders'],
    categories: ['Arms & Core'],
  },
]

const categories: Category[] = ['All', 'Push', 'Pull', 'Legs', 'Full Body', 'Arms & Core', 'Custom']

const muscleChipColors: Record<string, string> = {
  chest: 'bg-red-100 text-red-700',
  shoulders: 'bg-purple-100 text-purple-700',
  biceps: 'bg-blue-100 text-blue-700',
  triceps: 'bg-indigo-100 text-indigo-700',
  core: 'bg-yellow-100 text-yellow-700',
  back: 'bg-green-100 text-green-700',
  legs: 'bg-orange-100 text-orange-700',
  glutes: 'bg-pink-100 text-pink-700',
  calves: 'bg-teal-100 text-teal-700',
}

const muscleLabels: Record<string, string> = {
  chest: 'Chest',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  core: 'Core',
  back: 'Back',
  legs: 'Legs',
  glutes: 'Glutes',
  calves: 'Calves',
}

function inferCategory(muscles: string[]): Category[] {
  const cats: Category[] = ['Custom']
  const m = muscles.map(s => s.toLowerCase())
  if (m.some(x => ['chest', 'shoulders', 'triceps'].includes(x))) cats.push('Push')
  if (m.some(x => ['back', 'biceps'].includes(x))) cats.push('Pull')
  if (m.some(x => ['legs', 'glutes', 'calves'].includes(x))) cats.push('Legs')
  if (m.length >= 4) cats.push('Full Body')
  if (m.some(x => ['biceps', 'triceps', 'core'].includes(x))) cats.push('Arms & Core')
  return cats
}

function inferLevel(exerciseCount: number): { level: string; levelColor: string } {
  if (exerciseCount <= 5) return { level: 'Beginner', levelColor: 'bg-green-100 text-green-600' }
  if (exerciseCount <= 8) return { level: 'Intermediate', levelColor: 'bg-orange-100 text-orange-600' }
  return { level: 'Advanced', levelColor: 'bg-red-100 text-red-600' }
}

export default function Workouts() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])
  const [hoveredWorkout, setHoveredWorkout] = useState<number | null>(null)
  const [showMuscleMap, setShowMuscleMap] = useState(false)
  const [customWorkouts, setCustomWorkouts] = useState<Workout[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('digital-coach-custom-workouts')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return
      const mapped: Workout[] = parsed.map((cw: { name?: string; exercises?: { name: string; muscles?: string[] }[]; sets?: number; reps?: number }, i: number) => {
        const allMuscles = Array.from(new Set((cw.exercises ?? []).flatMap((e: { muscles?: string[] }) => e.muscles ?? [])))
        const exerciseCount = cw.exercises?.length ?? 0
        const { level, levelColor } = inferLevel(exerciseCount)
        return {
          id: 1000 + i,
          name: cw.name || `Custom Workout ${i + 1}`,
          desc: `Your custom workout · ${exerciseCount} exercises`,
          level,
          levelColor,
          exercises: exerciseCount,
          duration: `${exerciseCount * 4}-${exerciseCount * 5} min`,
          calories: exerciseCount * 60,
          muscles: allMuscles,
          categories: inferCategory(allMuscles),
          isCustom: true,
        }
      })
      setCustomWorkouts(mapped)
    } catch { /* ignore */ }
  }, [])

  const allWorkouts = [...presetWorkouts, ...customWorkouts]

  const highlightedMuscles =
    hoveredWorkout !== null
      ? (allWorkouts.find(w => w.id === hoveredWorkout)?.muscles ?? [])
      : []

  const handleMuscleSelect = (id: string) => {
    setSelectedMuscles(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const deleteCustomWorkout = (id: number) => {
    const idx = id - 1000
    try {
      const raw = localStorage.getItem('digital-coach-custom-workouts')
      if (!raw) return
      const parsed = JSON.parse(raw)
      parsed.splice(idx, 1)
      localStorage.setItem('digital-coach-custom-workouts', JSON.stringify(parsed))
      setCustomWorkouts(prev => prev.filter(w => w.id !== id))
    } catch { /* ignore */ }
  }

  const filtered = allWorkouts.filter(w => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory =
      activeCategory === 'All' || w.categories.includes(activeCategory)
    const matchMuscle =
      selectedMuscles.length === 0 ||
      selectedMuscles.some(m => w.muscles.includes(m))
    return matchSearch && matchCategory && matchMuscle
  })

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Workout Plans</h1>
        <p className="text-gray-400 text-sm mt-1">Browse and start your perfect workout</p>
      </div>

      {/* Search + toggle */}
      <div className="flex items-center gap-2 md:gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search workouts..."
            className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <button
          onClick={() => setShowMuscleMap(o => !o)}
          className="lg:hidden flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 bg-white whitespace-nowrap"
        >
          <Dumbbell size={14} /> Muscles
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Equipment Scanner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2.5">
            <Camera size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base md:text-lg">Scan Equipment</h2>
            <p className="text-purple-200 text-xs md:text-sm">Take a photo of your gym equipment for personalized exercises</p>
          </div>
        </div>
        <Link
          href="/workouts/scan"
          className="bg-white text-purple-600 font-semibold text-sm px-4 md:px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-purple-50 transition-colors whitespace-nowrap"
        >
          <Camera size={14} /> Scan Now
        </Link>
      </div>

      {/* Ready banner */}
      <div className="bg-blue-600 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-white font-bold text-base md:text-lg">Ready to Start?</h2>
          <p className="text-blue-200 text-xs md:text-sm">
            Jump into today&apos;s recommended workout
          </p>
        </div>
        <Link
          href="/workouts/session"
          className="bg-white text-blue-600 font-semibold text-sm px-4 md:px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-50 transition-colors whitespace-nowrap"
        >
          <Play size={13} /> Start Today&apos;s Workout
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Workout list */}
        <div className="lg:col-span-2">
          {/* Mobile muscle map drawer */}
          {showMuscleMap && (
            <div className="lg:hidden bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
              <h3 className="font-bold text-gray-900 mb-1 text-sm">Tap a muscle to filter</h3>
              <p className="text-xs text-gray-400 mb-3">
                {selectedMuscles.length > 0
                  ? `Filtering: ${selectedMuscles.map(m => muscleLabels[m]).join(', ')}`
                  : 'No filter active'}
              </p>
              <MuscleBodyMap
                selected={selectedMuscles}
                onSelect={handleMuscleSelect}
                highlightedMuscles={highlightedMuscles}
              />
              {selectedMuscles.length > 0 && (
                <button
                  onClick={() => setSelectedMuscles([])}
                  className="mt-2 w-full text-xs text-blue-600 text-center hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(w => (
              <div
                key={w.id}
                className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm transition-shadow hover:shadow-md"
                onMouseEnter={() => setHoveredWorkout(w.id)}
                onMouseLeave={() => setHoveredWorkout(null)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base">{w.name}</h3>
                      {w.isCustom && <span className="flex items-center gap-0.5 text-xs font-medium text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full"><Star size={9} /> Custom</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{w.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${w.levelColor}`}>{w.level}</span>
                    {w.isCustom && (
                      <button onClick={(e) => { e.stopPropagation(); deleteCustomWorkout(w.id) }}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1" title="Delete workout">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Muscle chips */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {w.muscles.map(m => (
                    <span
                      key={m}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${muscleChipColors[m] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {muscleLabels[m] ?? m}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 my-3">
                  {[
                    {
                      bg: 'bg-blue-50',
                      icon: <Dumbbell size={14} className="text-blue-500" />,
                      label: 'Exercises',
                      val: w.exercises,
                    },
                    {
                      bg: 'bg-green-50',
                      icon: <Clock size={14} className="text-green-500" />,
                      label: 'Duration',
                      val: w.duration,
                    },
                    {
                      bg: 'bg-orange-50',
                      icon: <Flame size={14} className="text-orange-500" />,
                      label: 'Calories',
                      val: w.calories,
                    },
                  ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-2 text-center`}>
                      <div className="flex justify-center mb-1">{s.icon}</div>
                      <div className="text-xs text-gray-400">{s.label}</div>
                      <div className="font-bold text-gray-900 text-xs md:text-sm">{s.val}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/workouts/session"
                    className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-xs md:text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-colors"
                  >
                    <Play size={12} /> Start
                  </Link>
                  <button className="flex-1 border border-gray-200 rounded-lg py-2.5 text-xs md:text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Dumbbell size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No workouts match your filters</p>
              <button
                onClick={() => {
                  setActiveCategory('All')
                  setSelectedMuscles([])
                  setSearch('')
                }}
                className="mt-2 text-blue-600 text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Create Custom */}
          <div className="mt-4 border-2 border-dashed border-blue-200 bg-blue-50 rounded-2xl p-6 md:p-8 text-center">
            <Dumbbell size={32} className="text-blue-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">
              Create Custom Workout
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mb-4">
              Build your own workout plan with selected exercises
            </p>
            <Link href="/workouts/custom" className="border border-blue-600 text-blue-600 rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-2 mx-auto hover:bg-blue-600 hover:text-white transition-colors">
              <ChevronRight size={14} /> Build Now
            </Link>
          </div>
        </div>

        {/* Muscle map sidebar — desktop only */}
        <div className="hidden lg:block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-fit">
          <h3 className="font-bold text-gray-900 mb-1 text-sm">Muscle Groups</h3>
          <p className="text-xs text-gray-400 mb-3">
            {hoveredWorkout
              ? 'Hover highlight active'
              : selectedMuscles.length > 0
              ? `Filtering: ${selectedMuscles.map(m => muscleLabels[m]).join(', ')}`
              : 'Click a muscle to filter'}
          </p>
          <MuscleBodyMap
            selected={selectedMuscles}
            onSelect={handleMuscleSelect}
            highlightedMuscles={highlightedMuscles}
          />
          {selectedMuscles.length > 0 && (
            <button
              onClick={() => setSelectedMuscles([])}
              className="mt-3 w-full text-xs text-blue-600 text-center hover:underline border border-blue-200 rounded-lg py-1.5"
            >
              Clear muscle filter
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
