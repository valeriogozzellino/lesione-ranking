'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { login, signup } from './actions'
import styles from './login.module.css'
import { Sparkles } from 'lucide-react'

function LoginContent() {
  const [isLogin, setIsLogin] = useState(true)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Sparkles size={40} color="#f093fb" />
        </div>
        <h1 className={styles.title}>Lesione Ranking</h1>
        <p className={styles.subtitle}>
          {isLogin ? 'Bentornato, inserisci le credenziali' : 'Crea il tuo profilo Lesione'}
        </p>

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.message}>{message}</div>}

        <form className={styles.form} action={isLogin ? login : signup}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="fullName">Nome Completo</label>
              <input
                className={styles.input}
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Mario Rossi"
                required
              />
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              className={styles.input}
              id="email"
              name="email"
              type="email"
              placeholder="mario@example.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              className={styles.input}
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button className={styles.button} type="submit">
            {isLogin ? 'Accedi' : 'Registrati'}
          </button>
        </form>

        <button 
          type="button" 
          className={styles.toggleBtn}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin 
            ? "Non hai un account? Registrati ora." 
            : "Hai già un account? Accedi qui."}
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Caricamento...</div>}>
      <LoginContent />
    </Suspense>
  )
}
