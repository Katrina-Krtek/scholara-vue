<template>
  <div class="auth-page">
    <section class="brand-panel">
      <img
        src="/ScholaroryLogo1.png"
        alt="Scholarory logo"
        class="auth-logo"
      />

      <div class="welcome-copy">
        <p class="eyebrow">Welcome to Scholarory</p>
        <h1>Your academic workspace, organized by Rory.</h1>
        <p>
          Jot it down. Fetch it later. Keep your sources, notes, citations,
          and study workflow together in one place.
        </p>
      </div>
    </section>

    <section class="auth-card">
      <h2>Sign in</h2>
      <p class="subtitle">Continue to your research workspace.</p>

      <div v-if="authError" class="error-box">
        {{ authError }}
      </div>

      <div class="form-group">
        <label>Email</label>
        <input
          v-model="email"
          type="email"
          placeholder="you@example.com"
        />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input
          v-model="password"
          type="password"
          placeholder="Password"
        />
      </div>

      <button class="primary-btn" @click="handleSignIn">
        {{ isAuthLoading ? 'Working...' : 'Sign In' }}
      </button>

      <button class="secondary-btn" @click="handleSignUp">
        Create Account
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()

const {
  signIn,
  signUp,
  isAuthLoading,
  authError
} = useAuth()

const email = ref('')
const password = ref('')

async function handleSignIn() {
  await signIn(email.value, password.value)
  router.push('/')
}

async function handleSignUp() {
  await signUp(email.value, password.value)
  router.push('/')
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(360px, 440px);
  gap: 2rem;
  align-items: center;
  background:
    radial-gradient(circle at top left, rgba(212, 175, 55, 0.14), transparent 32%),
    radial-gradient(circle at bottom right, rgba(15, 35, 70, 0.22), transparent 34%),
    var(--bg-primary);
  color: var(--text-primary);
  padding: 3rem;
}

.brand-panel {
  max-width: 760px;
  justify-self: center;
}

.auth-logo {
  width: min(620px, 100%);
  height: auto;
  display: block;
  margin-bottom: 2rem;
}

.welcome-copy {
  max-width: 620px;
}

.eyebrow {
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 0.75rem;
}

.welcome-copy h1 {
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: 1.02;
  letter-spacing: -0.055em;
  margin: 0;
}

.welcome-copy p:last-child {
  color: var(--text-secondary);
  font-size: 1.05rem;
  line-height: 1.7;
  margin: 1rem 0 0;
}

.auth-card {
  width: min(440px, 100%);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 22px;
  padding: 1.6rem;
  box-shadow: var(--shadow);
  justify-self: center;
}

.auth-card h2 {
  margin: 0;
  font-size: 1.6rem;
}

.subtitle {
  color: var(--text-secondary);
  margin: 0.4rem 0 1.2rem;
}

.error-box {
  border: 1px solid #ef4444;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border-radius: 10px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.9rem;
}

.form-group label {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.form-group input {
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.8rem;
  color: var(--text-primary);
  font: inherit;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
}

.primary-btn,
.secondary-btn {
  width: 100%;
  border-radius: 10px;
  padding: 0.8rem;
  cursor: pointer;
  font-weight: 700;
  margin-top: 0.5rem;
}

.primary-btn {
  background: var(--accent);
  color: white;
  border: none;
}

.secondary-btn {
  background: var(--btn-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.secondary-btn:hover {
  border-color: var(--accent);
}

@media (max-width: 900px) {
  .auth-page {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }

  .brand-panel {
    text-align: center;
  }

  .auth-logo {
    margin-left: auto;
    margin-right: auto;
  }

  .welcome-copy {
    margin: 0 auto;
  }
}
</style>
