// src/app/api/profile/business/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

const businessProfileSchema = z.object({
  businessName: z.string().min(1, 'El nombre del negocio es requerido.'),
  contactEmail: z.string().email('Ingresa un correo electrónico válido.'),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

export async function PUT(request: Request) {
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

  const formData = await request.json();

  try {
    const parsedData = businessProfileSchema.parse(formData);

    const { data, error } = await supabase
      .from('business_profiles')
      .upsert(
        {
          user_id: user.id,
          business_name: parsedData.businessName,
          contact_email: parsedData.contactEmail,
          contact_phone: parsedData.contactPhone || null,
          address: parsedData.address || null,
          tax_id: parsedData.taxId || null,
        },
        { onConflict: 'user_id' }
      ) // Upsert based on user_id
      .select()
      .single();

    if (error) {
      console.error('Error saving business profile:', error);
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, profile: data }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: error.errors[0].message } },
        { status: 400 }
      );
    }
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Error interno del servidor.' } },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

  try {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found
      console.error('Error fetching business profile:', error);
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: { message: 'Perfil no encontrado.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, profile: data }, { status: 200 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Error interno del servidor.' } },
      { status: 500 }
    );
  }
}
