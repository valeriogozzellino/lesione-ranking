'use client'

import { useState } from 'react'
import { submitVote } from './actions'
import styles from './vote-detail.module.css'

export default function VoteClientForm({ votedId }: { votedId: string }) {
  const [score, setScore] = useState(5)

  return (
    <form action={submitVote} style={{ display: 'flex', flexDirection: 'column' }}>
      <input type="hidden" name="votedId" value={votedId} />

      <div className={styles.formGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
          <label className={styles.label} htmlFor="score" style={{ margin: 0 }}>
            Livello di Lesione (1-10)
          </label>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 800, 
            color: '#f093fb',
            backgroundColor: 'rgba(240, 147, 251, 0.1)',
            padding: '0.2rem 0.8rem',
            borderRadius: '8px'
          }}>
            {score}
          </div>
        </div>
        
        <div className={styles.sliderContainer}>
          <input 
            type="range" 
            id="score" 
            name="score" 
            min="1" 
            max="10" 
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
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
  )
}
