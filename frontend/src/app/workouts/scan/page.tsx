'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Camera,
  Upload,
  X,
  Loader2,
  Dumbbell,
  Plus,
  Check,
  AlertCircle,
  RefreshCw,
  Database,
  ChevronRight,
  Play,
} from 'lucide-react'
import { detectEquipment } from '@/lib/api'

// ─── Equipment → muscle mapping ───────────────────────────────────────────────
const equipmentMuscleMap: Record<string, string[]> = {
  barbell: ['chest', 'back', 'shoulders', 'legs', 'biceps', 'triceps'],
  dumbbell: ['chest', 'shoulders', 'biceps', 'triceps', 'back'],
  bench: ['chest', 'triceps', 'shoulders'],
  'cable machine': ['chest', 'back', 'triceps', 'biceps', 'shoulders'],
  cable: ['chest', 'back', 'triceps', 'biceps', 'shoulders'],
  'pull-up bar': ['back', 'biceps', 'core'],
  'pull up bar': ['back', 'biceps', 'core'],
  'squat rack': ['legs', 'glutes', 'shoulders', 'back'],
  'leg press': ['legs', 'glutes'],
  'smith machine': ['chest', 'legs', 'shoulders'],
  'lat pulldown': ['back', 'biceps'],
  'rowing machine': ['back', 'core'],
  treadmill: ['legs'],
  elliptical: ['legs', 'core'],
  kettlebell: ['shoulders', 'core', 'legs', 'glutes'],
  'resistance band': ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs'],
  'medicine ball': ['core', 'shoulders'],
  'foam roller': [],
  'yoga mat': ['core'],
  'exercise ball': ['core'],
  'ez bar': ['biceps', 'triceps'],
  'preacher curl bench': ['biceps'],
  'pec deck': ['chest'],
  'chest press': ['chest', 'triceps'],
  'shoulder press': ['shoulders', 'triceps'],
  'leg curl': ['legs'],
  'leg extension': ['legs'],
  'calf raise': ['legs'],
  'hip thrust': ['glutes'],
  'ab roller': ['core'],
}

// ─── Exercise database ────────────────────────────────────────────────────────
const exerciseDB = [
  { name: 'Bench Press', muscles: ['chest', 'triceps', 'shoulders'], equipment: ['barbell', 'bench'] },
  { name: 'Incline Dumbbell Press', muscles: ['chest', 'shoulders'], equipment: ['dumbbell', 'bench'] },
  { name: 'Cable Flyes', muscles: ['chest'], equipment: ['cable machine', 'cable'] },
  { name: 'Push-ups', muscles: ['chest', 'triceps'], equipment: [] },
  { name: 'Chest Dips', muscles: ['chest', 'triceps'], equipment: ['dip station'] },
  { name: 'Barbell Row', muscles: ['back', 'biceps'], equipment: ['barbell'] },
  { name: 'Lat Pulldown', muscles: ['back', 'biceps'], equipment: ['cable machine', 'lat pulldown'] },
  { name: 'Pull-ups', muscles: ['back', 'biceps'], equipment: ['pull-up bar', 'pull up bar'] },
  { name: 'Seated Row', muscles: ['back'], equipment: ['cable machine'] },
  { name: 'Deadlift', muscles: ['back', 'legs', 'glutes'], equipment: ['barbell'] },
  { name: 'Overhead Press', muscles: ['shoulders', 'triceps'], equipment: ['barbell', 'dumbbell'] },
  { name: 'Lateral Raises', muscles: ['shoulders'], equipment: ['dumbbell'] },
  { name: 'Front Raises', muscles: ['shoulders'], equipment: ['dumbbell'] },
  { name: 'Face Pulls', muscles: ['shoulders', 'back'], equipment: ['cable machine', 'cable'] },
  { name: 'Bicep Curl', muscles: ['biceps'], equipment: ['dumbbell', 'barbell', 'ez bar'] },
  { name: 'Hammer Curl', muscles: ['biceps'], equipment: ['dumbbell'] },
  { name: 'Preacher Curl', muscles: ['biceps'], equipment: ['ez bar', 'preacher curl bench'] },
  { name: 'Tricep Pushdown', muscles: ['triceps'], equipment: ['cable machine', 'cable'] },
  { name: 'Skull Crushers', muscles: ['triceps'], equipment: ['barbell', 'ez bar', 'bench'] },
  { name: 'Squats', muscles: ['legs', 'glutes'], equipment: ['barbell', 'squat rack'] },
  { name: 'Leg Press', muscles: ['legs'], equipment: ['leg press'] },
  { name: 'Romanian Deadlift', muscles: ['legs', 'glutes'], equipment: ['barbell', 'dumbbell'] },
  { name: 'Lunges', muscles: ['legs', 'glutes'], equipment: ['dumbbell', 'barbell'] },
  { name: 'Leg Curl', muscles: ['legs'], equipment: ['leg curl'] },
  { name: 'Calf Raises', muscles: ['legs'], equipment: ['barbell', 'dumbbell', 'smith machine', 'calf raise'] },
  { name: 'Planks', muscles: ['core'], equipment: [] },
  { name: 'Crunches', muscles: ['core'], equipment: [] },
  { name: 'Russian Twists', muscles: ['core'], equipment: ['medicine ball'] },
  { name: 'Hanging Leg Raise', muscles: ['core'], equipment: ['pull-up bar', 'pull up bar'] },
  { name: 'Hip Thrusts', muscles: ['glutes'], equipment: ['barbell', 'bench'] },
  { name: 'Glute Bridges', muscles: ['glutes'], equipment: [] },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const muscleIcons: Record<string, string> = {
  chest: '🏋️',
  back: '🔙',
  shoulders: '💪',
  legs: '🦵',
  biceps: '💪',
  triceps: '🤳',
  core: '🎯',
  glutes: '🍑',
}

const muscleChipColors: Record<string, string> = {
  chest: 'bg-red-100 text-red-700',
  shoulders: 'bg-purple-100 text-purple-700',
  biceps: 'bg-blue-100 text-blue-700',
  triceps: 'bg-indigo-100 text-indigo-700',
  core: 'bg-yellow-100 text-yellow-700',
  back: 'bg-green-100 text-green-700',
  legs: 'bg-orange-100 text-orange-700',
  glutes: 'bg-pink-100 text-pink-700',
}

const DEMO_EQUIPMENT = ['Barbell', 'Dumbbell', 'Bench', 'Cable Machine', 'Pull-up Bar', 'Squat Rack']

type Phase = 'upload' | 'scanning' | 'results' | 'exercises'

function matchEquipmentToMuscles(detectedLabels: string[]): string[] {
  const muscles = new Set<string>()
  for (const label of detectedLabels) {
    const lower = label.toLowerCase()
    for (const [key, groups] of Object.entries(equipmentMuscleMap)) {
      if (lower.includes(key) || key.includes(lower)) {
        groups.forEach((m) => muscles.add(m))
      }
    }
  }
  return Array.from(muscles)
}

function equipmentMatchesExercise(detectedLabels: string[], exerciseEquipment: string[]): boolean {
  if (exerciseEquipment.length === 0) return true // bodyweight
  const lowerDetected = detectedLabels.map((l) => l.toLowerCase())
  return exerciseEquipment.some((eq) =>
    lowerDetected.some((det) => det.includes(eq) || eq.includes(det))
  )
}

export default function EquipmentScanPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>('upload')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [detectedEquipment, setDetectedEquipment] = useState<string[]>([])
  const [availableMuscles, setAvailableMuscles] = useState<string[]>([])
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // ─── File handling ────────────────────────────────────────────────────────
  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (newFiles.length === 0) return
    setImages((prev) => [...prev, ...newFiles])
    newFiles.forEach((f) => {
      const url = URL.createObjectURL(f)
      setPreviews((prev) => [...prev, url])
    })
  }, [])

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx])
    setImages((prev) => prev.filter((_, i) => i !== idx))
    setPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  // ─── Scan ─────────────────────────────────────────────────────────────────
  const handleScan = async () => {
    if (images.length === 0) return
    setPhase('scanning')
    setError(null)
    try {
      const result = await detectEquipment(images)
      setDetectedEquipment(result)
      const muscles = matchEquipmentToMuscles(result)
      setAvailableMuscles(muscles)
      setSelectedMuscles(muscles)
      setPhase('results')
    } catch {
      setError('Could not connect to the server. Make sure the backend is running on localhost:8080')
      setPhase('results')
    }
  }

  const handleDemoData = () => {
    setError(null)
    setDetectedEquipment(DEMO_EQUIPMENT)
    const muscles = matchEquipmentToMuscles(DEMO_EQUIPMENT)
    setAvailableMuscles(muscles)
    setSelectedMuscles(muscles)
    setPhase('results')
  }

  const toggleMuscle = (m: string) => {
    setSelectedMuscles((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
  }

  const toggleExercise = (name: string) => {
    setSelectedExercises((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  // ─── Filtered exercises ───────────────────────────────────────────────────
  const filteredExercises = exerciseDB.filter(
    (ex) =>
      ex.muscles.some((m) => selectedMuscles.includes(m)) &&
      equipmentMatchesExercise(detectedEquipment, ex.equipment)
  )

  // ─── Exercise counts per muscle ───────────────────────────────────────────
  const exerciseCountByMuscle = (muscle: string) =>
    exerciseDB.filter(
      (ex) =>
        ex.muscles.includes(muscle) &&
        equipmentMatchesExercise(detectedEquipment, ex.equipment)
    ).length

  // ─── Reset ────────────────────────────────────────────────────────────────
  const reset = () => {
    previews.forEach((url) => URL.revokeObjectURL(url))
    setImages([])
    setPreviews([])
    setDetectedEquipment([])
    setAvailableMuscles([])
    setSelectedMuscles([])
    setSelectedExercises([])
    setError(null)
    setPhase('upload')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/workouts"
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Equipment Scanner</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Take a photo of your gym equipment for personalized exercises
          </p>
        </div>
      </div>

      {/* ── Phase: Upload ─────────────────────────────────────────────────── */}
      {phase === 'upload' && (
        <div className="max-w-2xl mx-auto">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-100'
                : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
            }`}
          >
            <Upload size={40} className="mx-auto text-blue-400 mb-4" />
            <p className="text-gray-700 font-semibold text-base md:text-lg mb-1">
              Drag &amp; drop images here
            </p>
            <p className="text-gray-400 text-sm">or click to browse your gallery</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>

          {/* Camera button */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-3 font-semibold text-sm hover:bg-gray-800 transition-colors"
          >
            <Camera size={18} /> Take Photo
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files)
              e.target.value = ''
            }}
          />

          {/* Image previews */}
          {previews.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Uploaded Images ({previews.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(i)
                      }}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scan button */}
          <button
            onClick={handleScan}
            disabled={images.length === 0}
            className={`mt-6 w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
              images.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Camera size={16} /> Scan Equipment
          </button>

          <p className="text-center text-gray-400 text-xs mt-4">
            Take a photo of your gym equipment and we&apos;ll suggest exercises
          </p>
        </div>
      )}

      {/* ── Phase: Scanning ───────────────────────────────────────────────── */}
      {phase === 'scanning' && (
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden border-2 border-blue-400"
              >
                <img src={src} alt={`Scanning ${i + 1}`} className="w-full h-full object-cover" />
                {/* Scanning overlay */}
                <div className="absolute inset-0 bg-blue-500/10">
                  <div className="absolute left-0 right-0 h-1 bg-blue-500/70 animate-scan-line" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 text-blue-600">
            <Loader2 size={24} className="animate-spin" />
            <span className="font-semibold text-lg">Analyzing your equipment...</span>
          </div>
          <style jsx>{`
            @keyframes scanLine {
              0% {
                top: 0%;
              }
              100% {
                top: 100%;
              }
            }
            :global(.animate-scan-line) {
              animation: scanLine 1.5s ease-in-out infinite;
            }
          `}</style>
        </div>
      )}

      {/* ── Phase: Results ────────────────────────────────────────────────── */}
      {phase === 'results' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: images + equipment */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-gray-200"
                >
                  <img src={src} alt={`Scanned ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Error state */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 mb-1">Connection Error</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={handleScan}
                        className="flex items-center gap-2 bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <RefreshCw size={14} /> Try Again
                      </button>
                      <button
                        onClick={handleDemoData}
                        className="flex items-center gap-2 bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <Database size={14} /> Use Demo Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Equipment detected */}
            {detectedEquipment.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Dumbbell size={18} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900">Equipment Detected</h3>
                  <span className="ml-auto text-xs text-gray-400">
                    {detectedEquipment.length} items
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {detectedEquipment.map((eq) => (
                    <span
                      key={eq}
                      className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Muscle groups */}
            {availableMuscles.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-1">Available Muscle Groups</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Select the muscle groups you want to train
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableMuscles.map((m) => {
                    const selected = selectedMuscles.includes(m)
                    const count = exerciseCountByMuscle(m)
                    return (
                      <button
                        key={m}
                        onClick={() => toggleMuscle(m)}
                        className={`relative rounded-xl p-3 text-left border-2 transition-colors ${
                          selected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        {selected && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-0.5">
                            <Check size={10} />
                          </div>
                        )}
                        <span className="text-xl">{muscleIcons[m] ?? '💪'}</span>
                        <div className="font-semibold text-gray-900 text-sm mt-1 capitalize">
                          {m}
                        </div>
                        <div className="text-xs text-gray-400">{count} exercises</div>
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => {
                    setPhase('exercises')
                    setSelectedExercises([])
                  }}
                  disabled={selectedMuscles.length === 0}
                  className={`mt-5 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                    selectedMuscles.length > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  View Exercises <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Reset */}
            <button
              onClick={reset}
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw size={14} /> Scan different equipment
            </button>
          </div>

          {/* Right sidebar — summary (desktop) */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-3">Scan Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Equipment</span>
                  <span className="font-semibold">{detectedEquipment.length} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Muscle groups</span>
                  <span className="font-semibold">{selectedMuscles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Exercises available</span>
                  <span className="font-semibold">{filteredExercises.length}</span>
                </div>
              </div>
              {detectedEquipment.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">Detected equipment</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detectedEquipment.map((eq) => (
                      <span
                        key={eq}
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Phase: Exercises ──────────────────────────────────────────────── */}
      {phase === 'exercises' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Back to results */}
            <button
              onClick={() => setPhase('results')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              <ArrowLeft size={14} /> Back to equipment results
            </button>

            {/* Muscle filter pills */}
            <div className="flex flex-wrap gap-2">
              {availableMuscles.map((m) => {
                const active = selectedMuscles.includes(m)
                return (
                  <button
                    key={m}
                    onClick={() => toggleMuscle(m)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                )
              })}
            </div>

            {/* Exercise list */}
            <div className="space-y-3">
              {filteredExercises.length > 0 ? (
                filteredExercises.map((ex) => {
                  const added = selectedExercises.includes(ex.name)
                  return (
                    <div
                      key={ex.name}
                      className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-colors ${
                        added ? 'border-blue-300 bg-blue-50/30' : 'border-gray-100 shadow-sm'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm md:text-base">{ex.name}</h4>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {ex.muscles.map((m) => (
                            <span
                              key={m}
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                muscleChipColors[m] ?? 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {m.charAt(0).toUpperCase() + m.slice(1)}
                            </span>
                          ))}
                        </div>
                        {ex.equipment.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1.5">
                            Equipment: {ex.equipment.join(', ')}
                          </p>
                        )}
                        {ex.equipment.length === 0 && (
                          <p className="text-xs text-gray-400 mt-1.5">Bodyweight</p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleExercise(ex.name)}
                        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                          added
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {added ? <Check size={16} /> : <Plus size={16} />}
                      </button>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Dumbbell size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No exercises match your selection</p>
                  <button
                    onClick={() => setSelectedMuscles(availableMuscles)}
                    className="mt-2 text-blue-600 text-sm hover:underline"
                  >
                    Select all muscle groups
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar — workout builder */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-3">Your Workout</h3>
              {selectedExercises.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {selectedExercises.map((name, i) => (
                    <div
                      key={name}
                      className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <span className="text-xs text-gray-400 font-mono w-5">{i + 1}.</span>
                      <span className="text-sm text-gray-700 flex-1">{name}</span>
                      <button
                        onClick={() => toggleExercise(name)}
                        className="text-gray-300 hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-4">
                  Tap the + button to add exercises to your workout
                </p>
              )}

              <button
                onClick={() => router.push('/workouts/session')}
                disabled={selectedExercises.length === 0}
                className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                  selectedExercises.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Play size={14} /> Start Workout with {selectedExercises.length} exercises
              </button>

              <button
                onClick={reset}
                className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 text-center"
              >
                Start over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
