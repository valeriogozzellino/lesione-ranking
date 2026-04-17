import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import styles from './vote-detail.module.css'
import { redirect } from 'next/navigation'
import { submitVote } from './actions'

export const dynamic = 'force-dynamic'

export default async function VoteFormPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ error?: string }> }) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const votedId = resolvedParams.id
  const errorMsg = resolvedSearchParams.error
  
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', votedId)
    .single()

  if (!profile) {
    redirect('/vote?error=' + encodeURIComponent('Utente non trovato'))
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/vote" className={styles.backBtn}>
            <ArrowLeft size={24} />
          </Link>
          <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: '1.2rem', color: '#9f9ea7' }}>
            Nuovo Voto
          </div>
          <div style={{ width: 42 }}></div> {/* balancer */}
        </div>

        {errorMsg && (
          <div className={styles.errorInfo}>
            {errorMsg}
          </div>
        )}

        <div className={styles.profileInfo}>
          <div className={styles.avatar}>
            {profile.full_name?.charAt(0) || 'U'}
          </div>
          <h2 className={styles.name}>{profile.full_name}</h2>
        </div>

        <form action={submitVote} style={{ display: 'flex', flexDirection: 'column' }}>
          <input type="hidden" name="votedId" value={votedId} />
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="score">
              Livello di Lesione (1-10)
            </label>
            <div className={styles.sliderContainer}>
              <input 
                type="range" 
                id="score" 
                name="score" 
                min="1" 
                max="10" 
                defaultValue="5" 
                style={{ flex: 1, accentColor: '#f093fb', height: '6px', cursor: 'pointer' }} 
                className={styles.input}
              />
            </div>
            <div className={styles.sliderLabels}>
              <span>1 (Leggera)</span>
              <span>10 (Gravissima)</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="comment">
              Commento (Opzionale)
            </label>
            <textarea
              id="comment"
              name="comment"
              className={styles.textarea}
              placeholder="Descrivi la lesione... perché merita questo voto?"
              maxLength={500}
            ></textarea>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Conferma Voto
          </button>
        </form>
      </div>
    </div>
  )
}
