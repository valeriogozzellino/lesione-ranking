'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitVote(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const votedId = formData.get('votedId') as string
  const score = parseInt(formData.get('score') as string, 10)
  const comment = formData.get('comment') as string

  // Get active serata
  const { data: activeSerata } = await supabase
    .from('serate')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!activeSerata) {
    redirect('/vote?error=' + encodeURIComponent('Nessuna serata attiva trovata'))
  }

  // Insert vote
  const { error } = await supabase
    .from('lesione_votes')
    .insert({
      serata_id: activeSerata.id,
      voter_id: user.id,
      voted_user_id: votedId,
      score: score,
      comment: comment
    })

  if (error) {
    // maybe user already voted for this person
    if (error.code === '23505') { // unique constraint violation
      redirect(`/vote/${votedId}?error=` + encodeURIComponent('Hai già votato questo utente per la serata corrente.'))
    }
    redirect(`/vote/${votedId}?error=` + encodeURIComponent('Errore nel salvataggio: ' + error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/?message=' + encodeURIComponent('Voto registrato con successo!'))
}
