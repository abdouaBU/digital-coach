'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useAppContext } from '@/lib/store'
import { updateProfile as apiUpdateProfile } from '@/lib/api'
import {
  Activity,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Layers,
  Ruler,
  Sparkles,
  Target,
  User,
} from 'lucide-react'

const TOTAL_STEPS = 7

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes']

export default function OnboardingPage() {
  const router = useRouter()
  const { user, completeOnboarding } = useAuth()
  const { updateProfile, setGoalType } = useAppContext()

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [fullName, setFullName] = useState(user?.name ?? '')
  const [age, setAge] = useState<number | ''>('')
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('')

  const [height, setHeight] = useState<number>(170)
  const [currentWeight, setCurrentWeight] = useState<number | ''>('')
  const [targetWeight, setTargetWeight] = useState<number | ''>('')
  const [bodyFat, setBodyFat] = useState<number | ''>('')

  const [goalTypeLocal, setGoalTypeLocal] = useState<'cutting' | 'bulking' | 'maintain' | ''>('')
  const [fitnessLevel, setFitnessLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | ''>('')
  const [trainingDays, setTrainingDays] = useState<number>(4)
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return true
      case 2:
        return fullName.trim().length > 0 && age !== '' && Number(age) > 0 && gender !== ''
      case 3:
        return height > 0 && currentWeight !== '' && Number(currentWeight) > 0 && targetWeight !== '' && Number(targetWeight) > 0
      case 4:
        return goalTypeLocal !== ''
      case 5:
        return fitnessLevel !== '' && trainingDays >= 1
      case 6:
        return true
      case 7:
        return true
      default:
        return false
    }
  }

  function handleNext() {
    if (step < TOTAL_STEPS && canProceed()) {
      setStep((prev) => prev + 1)
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep((prev) => prev - 1)
    }
  }

  function toggleMuscle(muscle: string) {
    setSelectedMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((item) => item !== muscle) : [...prev, muscle],
    )
  }

  function selectAll() {
    setSelectedMuscles((prev) => (prev.length === MUSCLE_GROUPS.length ? [] : [...MUSCLE_GROUPS]))
  }

  async function handleComplete() {
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitError('')

    const localProfile = {
      name: fullName.trim(),
      email: user?.email ?? '',
      height: Number(height) || 0,
      currentWeight: Number(currentWeight) || 0,
      targetWeight: Number(targetWeight) || 0,
      bodyFat: Number(bodyFat) || 0,
      level: fitnessLevel || 'Beginner',
    } as const

    try {
      await apiUpdateProfile({
        name: fullName.trim(),
        age: Number(age),
        height: Number(height),
        currentweight: Number(currentWeight),
        targetweight: Number(targetWeight),
        bodyfat: bodyFat === '' ? null : Number(bodyFat),
        level: fitnessLevel,
        goaltype: goalTypeLocal,
        workoutdaysperweek: trainingDays,
      })
    } catch (error) {
      console.error('Failed to save profile:', error)
      setSubmitError('Profile save failed on the backend, but your onboarding will still continue locally.')
    } finally {
      updateProfile(localProfile)
      if (goalTypeLocal) setGoalType(goalTypeLocal)
      completeOnboarding()
      router.replace('/')
    }
  }

  const progress = `${Math.round((step / TOTAL_STEPS) * 100)}%`

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff_0%,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Onboarding</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Build your plan in a few quick steps</h1>
            <p className="mt-2 text-sm text-slate-600">We’ll use this to personalize your dashboard, goals, and training recommendations.</p>
          </div>
          <div className="hidden rounded-3xl border border-blue-100 bg-white/80 px-4 py-3 text-right shadow-sm md:block">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step</p>
            <p className="text-2xl font-bold text-slate-900">{step}/{TOTAL_STEPS}</p>
          </div>
        </div>

        <div className="mb-8 h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-400 transition-all duration-300" style={{ width: progress }} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="inline-flex rounded-2xl bg-blue-50 p-4 text-blue-600">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Let&apos;s set up your fitness identity</h2>
                  <p className="mt-3 text-slate-600">This onboarding will help tailor workouts, goals, and your dashboard so it feels like your coach, not a generic template.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ['Profile', 'Basic details and body stats'],
                    ['Goals', 'Choose the direction you want'],
                    ['Plan', 'Finish and jump into your dashboard'],
                  ].map(([title, text]) => (
                    <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">{title}</p>
                      <p className="mt-1 text-sm text-slate-600">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="inline-flex rounded-2xl bg-blue-50 p-4 text-blue-600">
                  <User size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Tell us about you</h2>
                  <p className="mt-2 text-slate-600">These details help personalize profile setup and future recommendations.</p>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Alex Carter"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Age</span>
                    <input
                      type="number"
                      min="1"
                      value={age}
                      onChange={(event) => setAge(event.target.value === '' ? '' : Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="22"
                    />
                  </label>

                  <div>
                    <span className="mb-2 block text-sm font-medium text-slate-700">Gender</span>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(['Male', 'Female', 'Other'] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setGender(option)}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                            gender === option
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="inline-flex rounded-2xl bg-cyan-50 p-4 text-cyan-600">
                  <Ruler size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Lock in your body metrics</h2>
                  <p className="mt-2 text-slate-600">We’ll use these as the baseline for goals, progress, and calorie planning.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Height (cm)</span>
                    <input
                      type="number"
                      min="100"
                      value={height}
                      onChange={(event) => setHeight(Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Body fat % (optional)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={bodyFat}
                      onChange={(event) => setBodyFat(event.target.value === '' ? '' : Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="18"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Current weight (kg)</span>
                    <input
                      type="number"
                      min="1"
                      value={currentWeight}
                      onChange={(event) => setCurrentWeight(event.target.value === '' ? '' : Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="78"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Target weight (kg)</span>
                    <input
                      type="number"
                      min="1"
                      value={targetWeight}
                      onChange={(event) => setTargetWeight(event.target.value === '' ? '' : Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="72"
                    />
                  </label>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="inline-flex rounded-2xl bg-amber-50 p-4 text-amber-600">
                  <Target size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">What’s your main goal?</h2>
                  <p className="mt-2 text-slate-600">Choose the path that best fits what you want your training to optimize for.</p>
                </div>

                <div className="grid gap-4">
                  {[
                    { key: 'cutting', title: 'Cutting', copy: 'Lose body fat while preserving strength and muscle.', icon: Flame },
                    { key: 'bulking', title: 'Bulking', copy: 'Add size and strength with a growth-focused plan.', icon: Dumbbell },
                    { key: 'maintain', title: 'Maintain', copy: 'Stay lean, consistent, and performance-focused.', icon: Activity },
                  ].map(({ key, title, copy, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setGoalTypeLocal(key as 'cutting' | 'bulking' | 'maintain')}
                      className={`flex items-start gap-4 rounded-[1.5rem] border p-5 text-left transition ${
                        goalTypeLocal === key
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                        <Icon size={22} />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{title}</p>
                        <p className="mt-1 text-sm text-slate-600">{copy}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="inline-flex rounded-2xl bg-emerald-50 p-4 text-emerald-600">
                  <Layers size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Training experience</h2>
                  <p className="mt-2 text-slate-600">We’ll use this to calibrate your intensity and weekly structure.</p>
                </div>

                <div>
                  <span className="mb-3 block text-sm font-medium text-slate-700">Fitness level</span>
                  <div className="grid gap-3 md:grid-cols-3">
                    {(['Beginner', 'Intermediate', 'Advanced'] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFitnessLevel(option)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          fitnessLevel === option
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <p className="font-semibold">{option}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Training days per week</span>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    value={trainingDays}
                    onChange={(event) => setTrainingDays(Number(event.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-600">Current selection</span>
                    <span className="text-lg font-bold text-slate-900">{trainingDays} day{trainingDays === 1 ? '' : 's'}</span>
                  </div>
                </label>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                <div className="inline-flex rounded-2xl bg-violet-50 p-4 text-violet-600">
                  <Dumbbell size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Focus muscle groups</h2>
                  <p className="mt-2 text-slate-600">Optional, but helpful if you want more tailored recommendations later.</p>
                </div>

                <button
                  type="button"
                  onClick={selectAll}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                >
                  {selectedMuscles.length === MUSCLE_GROUPS.length ? 'Clear all' : 'Select all'}
                </button>

                <div className="grid gap-3 sm:grid-cols-2">
                  {MUSCLE_GROUPS.map((muscle) => {
                    const active = selectedMuscles.includes(muscle)
                    return (
                      <button
                        key={muscle}
                        type="button"
                        onClick={() => toggleMuscle(muscle)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          active
                            ? 'border-violet-500 bg-violet-50 text-violet-800'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{muscle}</span>
                          {active && <CheckCircle size={18} />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-6">
                <div className="inline-flex rounded-2xl bg-emerald-50 p-4 text-emerald-600">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Ready to launch your dashboard</h2>
                  <p className="mt-2 text-slate-600">Here’s a quick summary before we save your setup and send you to the dashboard.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ['Name', fullName || 'Not set'],
                    ['Age', age === '' ? 'Not set' : String(age)],
                    ['Goal', goalTypeLocal || 'Not set'],
                    ['Level', fitnessLevel || 'Not set'],
                    ['Current weight', currentWeight === '' ? 'Not set' : `${currentWeight} kg`],
                    ['Target weight', targetWeight === '' ? 'Not set' : `${targetWeight} kg`],
                    ['Training days', `${trainingDays} / week`],
                    ['Focus groups', selectedMuscles.length ? selectedMuscles.join(', ') : 'General balance'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>

                {submitError && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {submitError}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1 || isSubmitting}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} />
                Back
              </button>

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed() || isSubmitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting ? 'Finishing...' : 'Go to dashboard'}
                  {!isSubmitting && <ChevronRight size={18} />}
                </button>
              )}
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/30">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Preview</p>
              <h3 className="mt-3 text-2xl font-bold">{fullName.trim() || 'Your future athlete profile'}</h3>
              <p className="mt-3 text-sm text-slate-300">
                Goal: <span className="font-semibold text-white">{goalTypeLocal || 'Choose one soon'}</span>
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Weekly plan: <span className="font-semibold text-white">{trainingDays} training day{trainingDays === 1 ? '' : 's'}</span>
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Level: <span className="font-semibold text-white">{fitnessLevel || 'Still deciding'}</span>
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Current</p>
                  <p className="mt-2 text-xl font-bold">{currentWeight === '' ? '--' : currentWeight}</p>
                  <p className="text-sm text-slate-400">kg</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Target</p>
                  <p className="mt-2 text-xl font-bold">{targetWeight === '' ? '--' : targetWeight}</p>
                  <p className="text-sm text-slate-400">kg</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Checklist</p>
              <div className="mt-4 space-y-3">
                {[
                  ['Basics', fullName.trim().length > 0 && age !== '' && gender !== ''],
                  ['Metrics', currentWeight !== '' && targetWeight !== ''],
                  ['Goal', goalTypeLocal !== ''],
                  ['Plan', fitnessLevel !== ''],
                ].map(([label, done]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="font-medium text-slate-700">{label}</span>
                    <span className={done ? 'text-emerald-600' : 'text-slate-300'}>
                      <CheckCircle size={18} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
