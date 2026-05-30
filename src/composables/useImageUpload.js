import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'

const BUCKET_NAME = 'research-images'

export function useImageUpload() {
  const isUploadingImage = ref(false)
  const imageUploadError = ref(null)

  async function uploadResearchImage(file, folder = 'research') {
    imageUploadError.value = null

    if (!file) return ''

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      imageUploadError.value = 'You must be signed in to upload images.'
      return ''
    }

    isUploadingImage.value = true

    const fileExt = file.name.split('.').pop()
    const safeFileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `${user.id}/${folder}/${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      imageUploadError.value = uploadError.message
      isUploadingImage.value = false
      return ''
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    isUploadingImage.value = false

    return data.publicUrl
  }

  return {
    isUploadingImage,
    imageUploadError,
    uploadResearchImage
  }
}