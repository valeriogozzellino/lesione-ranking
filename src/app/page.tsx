import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Trophy, ChevronRight, AlertCircle, LogOut } from 'lucide-react'

// Forza il rendering dinamico per essere sicuro di avere sempre i dati freschi
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Ottenere la serata attiva
  const { data: activeSerata } = await supabase
    .from('serate')
    .select('*')
    .eq('is_active', true)
    .single()

  // Se c'è una serata attiva, ottieni la classifica
  let ranking: any[] = []
  
  if (activeSerata) {
    // Si calcola il punteggio aggregato o lo teniamo semplice?
    // Useremo un raggruppamento per ottenere la somma dei voti della serata
    const { data: scores } = await supabase
      .from('lesione_votes')
      .select(`
        score,
        voted_user_id,
        voted:profiles!lesione_votes_voted_user_id_fkey(id, full_name, avatar_url)
      `)
      .eq('serata_id', activeSerata.id)

    if (scores && scores.length > 0) {
      // Aggregazione in Javascript (poiché non c'è una view o rpc complessa impostata nel db per ora)
      const userScores = scores.reduce((acc: any, curr: any) => {
        const uid = curr.voted_user_id
        if (!acc[uid]) {
          acc[uid] = {
            id: uid,
            full_name: curr.voted?.full_name || 'Utente Sconosciuto',
            avatar: curr.voted?.avatar_url,
            total_score: 0,
            vote_count: 0
          }
        }
        acc[uid].total_score += curr.score
        acc[uid].vote_count += 1
        return acc
      }, {})

      ranking = Object.values(userScores).sort((a: any, b: any) => b.total_score - a.total_score)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #f093fb, #f5576c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Lesione Ranking
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <form action="/auth/logout" method="post" style={{ margin: 0 }}>
              <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={16} /> Esci
              </button>
            </form>
          ) : (
            <Link href="/login" style={{ color: '#fff', textDecoration: 'none' }}>Accedi</Link>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>🏆 Classifica Lesione</h2>
            <p style={{ color: '#9f9ea7', margin: 0 }}>
              {activeSerata ? `Serata Attiva: ${activeSerata.name}` : 'Nessuna serata in corso'}
            </p>
          </div>
          {activeSerata && (
            <Link href="/vote" style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
              color: '#fff', 
              padding: '0.8rem 1.5rem', 
              borderRadius: '12px', 
              textDecoration: 'none', 
              fontWeight: 700,
              boxShadow: '0 10px 20px rgba(245, 87, 108, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s'
            }}>
              Vota Lesione <ChevronRight size={18} />
            </Link>
          )}
        </div>

        {activeSerata ? (
          ranking.length > 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              {ranking.map((player: any, idx: number) => (
                <div key={player.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1.5rem', 
                  borderBottom: idx !== ranking.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: idx === 0 ? 'rgba(240, 147, 251, 0.05)' : 'transparent'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: idx === 0 ? '#f093fb' : '#666', width: '40px' }}>
                    {idx + 1}
                  </div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #333, #111)', marginRight: '1rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#888' }}>
                    {player.full_name?.charAt(0) || 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{player.full_name}</div>
                    <div style={{ color: '#888', fontSize: '0.85rem' }}>{player.vote_count} voti ricevuti</div>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f5576c' }}>
                    {player.total_score}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Trophy size={48} color="#444" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem' }}>Nessun voto registrato</h3>
              <p style={{ color: '#888', margin: 0 }}>Sii il primo a votare per questa serata!</p>
            </div>
          )
        ) : (
          <div style={{ padding: '2rem', background: 'rgba(255, 159, 10, 0.1)', border: '1px solid rgba(255, 159, 10, 0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertCircle color="#ff9f0a" size={24} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: '0 0 0.2rem', color: '#ff9f0a', fontWeight: 600 }}>Nessuna serata in corso</h4>
              <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>Il gestore deve creare e attivare una serata dal database per poter visualizzare le classifiche.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
