import { supabase } from './supabase'

const API_BASE = 'http://localhost:8080/api'

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
  }
}

export async function submitWorkoutConfig(data: {
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
  const headers = await getAuthHeaders()
  const formData = new FormData()
  files.forEach((f) => formData.append('files', f))
  const res = await fetch(`${API_BASE}/detect`, {
    method: 'POST',
    headers,
    body: formData,
  })
  if (!res.ok) throw new Error('Equipment detection failed')
  return res.json()
}

export async function updateProfile(data: any) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}
