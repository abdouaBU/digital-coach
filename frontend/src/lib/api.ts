import { supabase } from './supabase'

const API_BASE = 'http://localhost:8080/api'

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
  }
}

// Used by the equipment scan page — sends equipment list, returns workout object
export async function submitWorkoutConfig(equipment: string[]) {
  try {
    const res = await fetch(`${API_BASE}/workout`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ equipment }),
    })
    if (!res.ok) throw new Error('Failed to submit workout config')
    return res.json()
  } catch (err) {
    console.error('submitWorkoutConfig error:', err)
    return null
  }
}

// Used by the full workout config form — sends goal/level/days/muscles/equipment
export async function submitFullWorkoutConfig(data: {
  userGoal: string
  userLevel: string
  numDays: number
  targetMuscles: string[]
  availableEquipment: string[]
}) {
  const res = await fetch(`${API_BASE}/workout`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to submit workout config')
  return res.text()
}

export async function detectEquipment(files: File[]): Promise<string[]> {
  const { 'Content-Type': _, ...headersWithoutContentType } = await getAuthHeaders()
  const formData = new FormData()
  files.forEach((f) => formData.append('files', f))
  const res = await fetch(`${API_BASE}/detect`, {
    method: 'POST',
    headers: headersWithoutContentType, // don't set Content-Type for multipart
    body: formData,
  })
  if (!res.ok) throw new Error('Equipment detection failed')
  return res.json()
}

export async function apiRegister(name: string, email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ name, email, password }),
    })
    return res.json()
  } catch {
    return null
  }
}

export async function apiLogin(email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    })
    return res.json()
  } catch {
    return null
  }
}

export async function apiUpdateProfile(email: string, data: Record<string, unknown>) {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ email, ...data }),
    })
    return res.json()
  } catch {
    return null
  }
}

export async function updateProfile(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}