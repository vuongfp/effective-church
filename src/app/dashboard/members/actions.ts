'use server'

import { createClient } from '@/lib/supabase/server'

import { revalidatePath } from 'next/cache'

export async function addMember(formData: FormData) {
    const supabase = await createClient()

    const newMember = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        status: formData.get('status') as string || 'active',
    }

    const { error } = await supabase.from('members').insert([newMember])

    if (error) {
        throw new Error('Failed to create member: ' + error.message)
    }

    revalidatePath('/members')
}

export async function deleteMember(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('members').delete().eq('id', id)

    if (error) {
        throw new Error('Failed to delete member: ' + error.message)
    }

    revalidatePath('/members')
}
