import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UserVotesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const userId = resolvedParams.id
  
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
    .select('id, name')
    .eq('is_active', true)
    .single()

  if (!activeSerata) {
    redirect('/?error=' + encodeURIComponent('Nessuna serata attiva'))
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) {
    redirect('/?error=' + encodeURIComponent('Utente non trovato'))
  }

  // Get all votes for this user in the active serata
  const { data: votes } = await supabase
    .from('lesione_votes')
    .select(`
      id,
      score,
      comment,
      created_at,
      voter:profiles!lesione_votes_voter_id_fkey(id, full_name, avatar_url)
    `)
    .eq('serata_id', activeSerata.id)
    .eq('voted_user_id', userId)
    .order('created_at', { ascending: false })

  const totalScore = votes?.reduce((acc, curr) => acc + curr.score, 0) || 0

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'Inter, sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/" style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            color: '#fff', 
            padding: '0.5rem', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none'
          }}>
            <ArrowLeft size={24} />
          </Link>
          <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: '1.2rem', color: '#9f9ea7' }}>
            Dettaglio Voti
          </div>
          <div style={{ width: 42 }}></div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '24px', 
          padding: '2.5rem 2rem', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #f093fb, #f5576c)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '2.5rem', 
            color: '#fff', 
            marginBottom: '1rem',
            boxShadow: '0 10px 20px rgba(245, 87, 108, 0.3)'
          }}>
            {profile.full_name?.charAt(0) || 'U'}
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>{profile.full_name}</h2>
          <div style={{ color: '#9f9ea7', fontSize: '1rem', marginBottom: '1rem' }}>
            Punteggio totale: <b style={{ color: '#f5576c', fontSize: '1.2rem' }}>{totalScore}</b>
          </div>
        </div>

        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} color="#f093fb" /> I Voti Ricevuti
        </h3>

        {votes && votes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {votes.map((vote: any) => (
              <div key={vote.id} style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.05)', 
                borderRadius: '16px', 
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ 
                      width: '36px', height: '36px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #333, #111)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: '#888', fontWeight: 600, fontSize: '0.9rem' 
                    }}>
                      {vote.voter?.full_name?.charAt(0) || 'V'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{vote.voter?.full_name || 'Utente Anonimo'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        {new Date(vote.created_at).toLocaleString('it-IT')}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(240, 147, 251, 0.1)', 
                    color: '#f093fb', 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '8px', 
                    fontWeight: 800, 
                    fontSize: '1.2rem' 
                  }}>
                    {vote.score}
                  </div>
                </div>
                {vote.comment ? (
                  <p style={{ color: '#ccc', margin: 0, fontSize: '0.95rem', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                    "{vote.comment}"
                  </p>
                ) : (
                  <p style={{ color: '#666', margin: 0, fontSize: '0.9rem', fontStyle: 'italic' }}>Nessun commento lasciato.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem', background: 'rgba(255, 159, 10, 0.1)', border: '1px solid rgba(255, 159, 10, 0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertCircle color="#ff9f0a" size={24} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: '0 0 0.2rem', color: '#ff9f0a', fontWeight: 600 }}>Nessun voto</h4>
              <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>Nessuno ha ancora votato per questo utente.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
