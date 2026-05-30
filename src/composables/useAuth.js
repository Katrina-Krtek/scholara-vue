import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const user = ref(null)
const isAuthLoading = ref(false)
const authError = ref(null)

export function useAuth() {
  async function loadUser() {
    isAuthLoading.value = true
    authError.value = null

    const { data, error } = await supabase.auth.getUser()

    if (error) {
      authError.value = error.message
      user.value = null
    } else {
      user.value = data.user
    }

    isAuthLoading.value = false
  }

  async function signUp(email, password) {
    isAuthLoading.value = true
    authError.value = null

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      authError.value = error.message
    } else {
      user.value = data.user
    }

    isAuthLoading.value = false
  }

  async function signIn(email, password) {
    isAuthLoading.value = true
    authError.value = null

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      authError.value = error.message
    } else {
      user.value = data.user
    }

    isAuthLoading.value = false
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null
  })

  return {
    user,
    isAuthLoading,
    authError,
    loadUser,
    signUp,
    signIn,
    signOut
  }
}