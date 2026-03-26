'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Note } from '@/types'
import { isMockMode, MOCK_USER } from '@/lib/isMock'
import fs from 'fs/promises'
import path from 'path'
import { extractText } from 'unpdf'

const MOCK_DB_PATH = path.join(process.cwd(), 'mock_db.json')

export async function parsePDF(formData: FormData): Promise<string> {
  try {
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    
    // Using unpdf which works better in server-side/Next.js/Turbopack environments
    const { text } = await extractText(buffer, { mergePages: true })
    return text
  } catch (error: any) {
    console.error('PDF parsing error:', error)
    throw new Error(`Failed to parse PDF: ${error.message}`)
  }
}

async function getMockNotes(): Promise<Note[]> {
  try {
    const data = await fs.readFile(MOCK_DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function saveMockNotes(notes: Note[]) {
  await fs.writeFile(MOCK_DB_PATH, JSON.stringify(notes, null, 2))
}

export async function getNotes(): Promise<Note[]> {
  try {
    if (isMockMode()) {
      return await getMockNotes()
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.warn('Auth check failed or not logged in, returning empty notes.')
      return []
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      // Don't log full error object to console to avoid Next.js error overlay
      console.warn(`Note database not ready (${error.message || 'unknown'}). returning empty list.`)
      return []
    }

    return (data as Note[]) || []
  } catch (err) {
    console.warn('Unexpected error in getNotes. Falling back to empty list.')
    return []
  }
}

export async function getNoteById(id: string): Promise<Note | null> {
  if (isMockMode()) {
    const notes = await getMockNotes()
    return notes.find(n => n.id === id) || null
  }

  try {
    const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

    if (error) {
      console.warn('Note fetch failed. Returning null.', error.message)
      return null
    }
    return data as Note
  } catch (err) {
    console.warn('Unexpected error in getNoteById.')
    return null
  }
}

export async function createNote(): Promise<Note | null> {
  if (isMockMode()) {
    const notes = await getMockNotes()
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: MOCK_USER.id,
      title: 'Untitled Note',
      content: '',
      is_pinned: false,
      is_favorite: false,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    notes.unshift(newNote)
    await saveMockNotes(notes)
    revalidatePath('/notes')
    return newNote
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('CreateNote failed: Unauthorized user.')
      return null
    }

    // Try a full insert first (requires updated schema)
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: 'Untitled Note',
        content: '',
        is_pinned: false,
        is_favorite: false,
        tags: [],
      })
      .select()
      .single()

    if (error) {
      console.warn('Initial createNote failed, trying minimal fallback...', error.message)
      
      // Fallback: minimal insert (only user_id, title, content)
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: 'Untitled Note',
          content: '',
        })
        .select()
        .single()
      
      if (fallbackError) {
        console.error('CRITICAL: Fallback createNote failed too.', fallbackError.message)
        return null
      }
      
      revalidatePath('/notes')
      return fallbackData as Note
    }

    revalidatePath('/notes')
    return data as Note
  } catch (err) {
    console.error('Unexpected error in createNote catch block:', err)
    return null
  }
}

export async function updateNote(id: string, updates: Partial<Note>) {
  if (isMockMode()) {
    const notes = await getMockNotes()
    const index = notes.findIndex(n => n.id === id)
    if (index !== -1) {
      notes[index] = { 
        ...notes[index], 
        ...updates, 
        updated_at: new Date().toISOString() 
      }
      await saveMockNotes(notes)
    }
    revalidatePath('/notes')
    revalidatePath(`/notes/${id}`)
    return
  }

  try {
    const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('notes')
    .update({ 
      ...updates, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .eq('user_id', user.id)

    if (error) {
      console.warn('Error updating note:', error.message)
      return
    }

    revalidatePath(`/notes`)
    revalidatePath(`/notes/${id}`)
  } catch (err) {
    console.warn('Unexpected error in updateNote.')
  }
}

export async function deleteNote(id: string) {
  if (isMockMode()) {
    const notes = await getMockNotes()
    const updatedNotes = notes.filter(n => n.id !== id)
    await saveMockNotes(updatedNotes)
    revalidatePath('/notes')
    return
  }

  try {
    const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

    if (error) {
      console.warn('Error deleting note:', error.message)
      return
    }

    revalidatePath('/notes')
  } catch (err) {
    console.warn('Unexpected error in deleteNote.')
  }
}
