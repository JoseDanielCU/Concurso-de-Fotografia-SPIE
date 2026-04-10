
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const { fileName } = await req.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .storage
    .from('categories')
    .createSignedUploadUrl(fileName)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/categories/${fileName}`

  return Response.json({
    uploadUrl: data.signedUrl,
    publicUrl
  })
}