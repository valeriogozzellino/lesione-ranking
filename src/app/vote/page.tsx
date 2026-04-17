import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import styles from './vote.module.css'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function VoteListPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get active serata
  const { data: activeSerata } = await supabase
    .from('serate')
    .select('name')
    .eq('is_active', true)
    .single()

  // Get all users except current user
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', user.id)

  return (
    <div className={styles.container}>
      <div className={styles.maxW}>
        <div className={styles.header}>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={24} />
          </Link>
          <h1 className={styles.title}>Vota Lesione</h1>
        </div>
        
        {activeSerata ? (
          <p style={{ color: '#9f9ea7', marginBottom: '2rem' }}>
            Serata attiva: <strong>{activeSerata.name}</strong>. Seleziona chi ha commesso la lesione:
          </p>
        ) : (
          <div style={{ padding: '1rem', background: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.2)', borderRadius: '12px', marginBottom: '2rem', color: '#ff3b30' }}>
            Nessuna serata in corso. Non puoi votare in questo momento.
          </div>
        )}

        <div className={styles.userGrid}>
          {profiles?.map((profile) => (
            <Link key={profile.id} href={activeSerata ? `/vote/${profile.id}` : '#'} className={styles.userCard} style={{ opacity: activeSerata ? 1 : 0.5, pointerEvents: activeSerata ? 'auto' : 'none' }}>
              <div className={styles.avatar}>
                {profile.full_name?.charAt(0) || 'U'}
              </div>
              <h3 className={styles.name}>{profile.full_name || 'Utente Sconosciuto'}</h3>
            </Link>
          ))}
          {profiles?.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#888' }}>
              Nessun altro utente trovato.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
