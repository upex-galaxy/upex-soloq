// src/app/api/profile/logo/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames
import path from 'path';

// This is required for Next.js to parse FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: { message: 'No autenticado.' } },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json(
      { success: false, error: { message: 'No se ha proporcionado ningún archivo.' } },
      { status: 400 }
    );
  }

  // Basic validation (more robust validation should be client-side too)
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: { message: 'Tipo de archivo no permitido. Solo PNG, JPEG, WEBP.' } },
      { status: 400 }
    );
  }

  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { success: false, error: { message: 'El archivo es demasiado grande. Máximo 2MB.' } },
      { status: 400 }
    );
  }

  try {
    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`; // Generate unique filename
    const filePath = `${user.id}/${fileName}`; // Store under user's ID folder

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos') // Assuming a 'logos' bucket exists
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      return NextResponse.json(
        { success: false, error: { message: 'Error al subir el logo.' } },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      return NextResponse.json(
        { success: false, error: { message: 'No se pudo obtener la URL pública del logo.' } },
        { status: 500 }
      );
    }

    // Update user's business profile with the new logo URL
    const { error: updateError } = await supabase
      .from('business_profiles')
      .upsert({ user_id: user.id, logo_url: publicUrlData.publicUrl }, { onConflict: 'user_id' });

    if (updateError) {
      console.error('Error updating business profile with logo URL:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Error al actualizar el perfil con la URL del logo.' },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl }, { status: 200 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Error interno del servidor.' } },
      { status: 500 }
    );
  }
}
