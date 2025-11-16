import { supabase } from '../lib/supabase'
import type { CVData } from '../types/cv'
import type { PostgrestSingleResponse } from '@supabase/supabase-js'

export interface CVRecord {
  id: string
  user_id: string
  cv_data: CVData
  template: string
  title: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CVResponse {
  success: boolean
  data?: CVRecord | CVRecord[]
  error?: string
}

// Helper function to timeout async operations
const withTimeout = async <T>(promise: Promise<T> | PromiseLike<T>, timeoutMs = 10000): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
  )
  return Promise.race([Promise.resolve(promise), timeout])
}

class CVDataService {
  // Check if user is authenticated and provide better error messages
  private async ensureAuthenticated() {
    try {
      // Add timeout to authentication check
      const { data: { user }, error } = await withTimeout(
        supabase.auth.getUser(),
        5000 // 5 second timeout for auth check
      )

      if (error) {
        console.error('Authentication error:', error)
        return { user: null, error: 'Authentication failed. Please log in again.' }
      }

      if (!user) {
        return { user: null, error: 'You must be logged in to perform this action.' }
      }

      return { user, error: null }
    } catch (error) {
      console.error('Error checking authentication:', error)
      if (error instanceof Error && error.message === 'Operation timed out') {
        return { user: null, error: 'Connection timeout. Saving locally only.' }
      }
      return { user: null, error: 'Unable to verify authentication. Check your connection.' }
    }
  }

  // Save CV data
  async saveCVData(cvData: CVData, template: string, title = 'My CV'): Promise<CVResponse> {
    try {
      const authResult = await this.ensureAuthenticated()
      if (!authResult.user) {
        return { success: false, error: authResult.error }
      }

      // Check if user has existing CV data with timeout
      const selectResult: PostgrestSingleResponse<CVRecord | null> = await withTimeout(
        supabase
          .from('cv_data')
          .select('*')
          .eq('user_id', authResult.user.id)
          .eq('is_active', true)
          .maybeSingle(),
        10000 // 10 second timeout
      )

      const { data: existing, error: selectError } = selectResult

      if (selectError) {
        console.error('Error checking existing CV:', selectError)
        return { success: false, error: `Database error: ${selectError.message}` }
      }

      let result: PostgrestSingleResponse<CVRecord>

      if (existing) {
        // Update existing CV with timeout
        result = await withTimeout(
          supabase
            .from('cv_data')
            .update({
              cv_data: cvData,
              template,
              title,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select()
            .single(),
          10000 // 10 second timeout
        )
      } else {
        // Create new CV with timeout
        result = await withTimeout(
          supabase
            .from('cv_data')
            .insert([{
              user_id: authResult.user.id,
              cv_data: cvData,
              template,
              title,
              is_active: true
            }])
            .select()
            .single(),
          10000 // 10 second timeout
        )
      }

      if (result.error) {
        console.error('Error saving CV data:', result.error)
        return { success: false, error: `Failed to save CV: ${result.error.message}` }
      }

      return { success: true, data: result.data }
    } catch (error) {
      console.error('Unexpected error saving CV data:', error)
      if (error instanceof Error && error.message === 'Operation timed out') {
        return { success: false, error: 'Connection timeout. Your changes are saved locally.' }
      }
      return { success: false, error: 'An unexpected error occurred while saving your CV.' }
    }
  }

  // Load CV data for current user
  async loadCVData(): Promise<CVResponse> {
    try {
      const authResult = await this.ensureAuthenticated()
      if (!authResult.user) {
        return { success: false, error: authResult.error }
      }

      const { data, error } = await supabase
        .from('cv_data')
        .select('*')
        .eq('user_id', authResult.user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          return { success: true, data: undefined }
        }
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error loading CV data:', error)
      return { success: false, error: 'Failed to load CV data' }
    }
  }

  // Get all CV versions for current user
  async getAllCVVersions(): Promise<CVResponse> {
    try {
      const authResult = await this.ensureAuthenticated()
      if (!authResult.user) {
        return { success: false, error: authResult.error }
      }

      const { data, error } = await supabase
        .from('cv_data')
        .select('id, user_id, title, template, created_at, updated_at, is_active, cv_data')
        .eq('user_id', authResult.user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error loading CV versions:', error)
      return { success: false, error: 'Failed to load CV versions' }
    }
  }

  // Create new CV version
  async createCVVersion(cvData: CVData, template: string, title: string): Promise<CVResponse> {
    try {
      const authResult = await this.ensureAuthenticated()
      if (!authResult.user) {
        return { success: false, error: authResult.error }
      }

      // Deactivate current active CV
      await supabase
        .from('cv_data')
        .update({ is_active: false })
        .eq('user_id', authResult.user.id)
        .eq('is_active', true)

      // Create new CV version
      const { data, error } = await supabase
        .from('cv_data')
        .insert([{
          user_id: authResult.user.id,
          cv_data: cvData,
          template,
          title,
          is_active: true
        }])
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error creating CV version:', error)
      return { success: false, error: 'Failed to create CV version' }
    }
  }

  // Switch to a specific CV version
  async switchToCVVersion(cvId: string): Promise<CVResponse> {
    try {
      const authResult = await this.ensureAuthenticated()
      if (!authResult.user) {
        return { success: false, error: authResult.error }
      }

      // Deactivate all CVs
      await supabase
        .from('cv_data')
        .update({ is_active: false })
        .eq('user_id', authResult.user.id)

      // Activate selected CV
      const { data, error } = await supabase
        .from('cv_data')
        .update({ is_active: true })
        .eq('id', cvId)
        .eq('user_id', authResult.user.id)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error switching CV version:', error)
      return { success: false, error: 'Failed to switch CV version' }
    }
  }

  // Delete CV version
  async deleteCVVersion(cvId: string): Promise<CVResponse> {
    try {
      const authResult = await this.ensureAuthenticated()
      if (!authResult.user) {
        return { success: false, error: authResult.error }
      }

      const { error } = await supabase
        .from('cv_data')
        .delete()
        .eq('id', cvId)
        .eq('user_id', authResult.user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting CV version:', error)
      return { success: false, error: 'Failed to delete CV version' }
    }
  }

  // Migrate from localStorage to Supabase
  async migrateFromLocalStorage(): Promise<CVResponse> {
    try {
      const authResult = await this.ensureAuthenticated()
      if (!authResult.user) {
        return { success: false, error: authResult.error }
      }

      // Check if user already has data in Supabase
      const { data: existing } = await supabase
        .from('cv_data')
        .select('id')
        .eq('user_id', authResult.user.id)
        .limit(1)

      if (existing && existing.length > 0) {
        return { success: true, data: undefined } // Already migrated
      }

      // Get data from localStorage
      const localCVData = localStorage.getItem('cv-data')
      const localTemplate = localStorage.getItem('selected-template')

      if (localCVData) {
        try {
          const cvData = JSON.parse(localCVData)
          const template = localTemplate || 'modern'

          const result = await this.saveCVData(cvData, template, 'Migrated CV')

          if (result.success) {
            // Clear localStorage after successful migration
            localStorage.removeItem('cv-data')
            localStorage.removeItem('selected-template')
          }

          return result
        } catch (parseError) {
          console.error('Error parsing localStorage data:', parseError)
          return { success: false, error: 'Invalid localStorage data' }
        }
      }

      return { success: true, data: undefined } // No data to migrate
    } catch (error) {
      console.error('Error migrating from localStorage:', error)
      return { success: false, error: 'Failed to migrate data' }
    }
  }
}

export const cvDataService = new CVDataService()
