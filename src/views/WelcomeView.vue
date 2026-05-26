<template>
  <div class="app">
    <header class="app-header">
      <a class="logo-link" href="#" @click.prevent="goToStudentDashboard">
        <img :src="logoSrc" alt="Scholarory logo" class="logo-image" />
        <span class="username">@{{ username }}</span>
      </a>

      <p class="tagline">Welcome back, let's get you ready to study.</p>
    </header>

    <main class="dashboard">
      <section class="card">
        <h2>Today's Focus</h2>
        <p>Set one main goal for this session.</p>
        <button type="button" @click="addFocus">Add focus</button>

        <p v-if="focusGoal" class="focus-goal">
          Current focus: {{ focusGoal }}
        </p>
      </section>

      <section class="card">
        <h2>Quick Links</h2>

        <ul>
          <li><a href="#" @click.prevent="goToNotes">Notes</a></li>
          <li><a href="#" @click.prevent="goToTasks">Tasks</a></li>
          <li><a href="#" @click.prevent="goToStudyPlan">Study plan</a></li>
        </ul>
      </section>

      <section class="card">
        <h2>Encouragement</h2>
        <p>You don't have to do everything today, just the next right thing.</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getStoredUsername, saveUsername } from '../lib/userPreferences';

const logoSrc = '/scholarory-logo.png';
const router = useRouter();

const username = ref('Student');
const focusGoal = ref('');

function askForUsername() {
  const name = window.prompt(
    'What name should Scholarory use for you?',
    username.value
  );

  if (name && name.trim().length > 0) {
    const trimmed = name.trim();
    username.value = trimmed;
    saveUsername(trimmed);
  }
}

function addFocus() {
  const goal = window.prompt('What is your main focus for this study session?');

  if (goal && goal.trim().length > 0) {
    focusGoal.value = goal.trim();
  }
}

function goToStudentDashboard() {
  router.push({ name: 'StudentDashboard' });
}

function goToNotes() {
  router.push({ name: 'Notes' });
}

function goToTasks() {
  router.push({ name: 'Tasks' });
}

function goToStudyPlan() {
  router.push({ name: 'StudyPlan' });
}

onMounted(() => {
  const stored = getStoredUsername();

  if (stored) {
    username.value = stored;
  } else {
    askForUsername();
  }
});
</script>

<style scoped>
.app {
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 2rem;
  background: radial-gradient(circle at top left, #1e293b, #020617);
  color: #f9fafb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Segoe UI", sans-serif;
  box-sizing: border-box;
}

.app-header {
  margin-bottom: 2rem;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
  margin-bottom: 0.5rem;
}

.logo-image {
  height: 72px;
  width: auto;
  max-width: 360px;
  object-fit: contain;
  display: block;
}

.username {
  font-size: 0.85rem;
  color: #cbd5f5;
}

.tagline {
  margin: 0.75rem 0 0;
  font-size: 1rem;
  color: #cbd5f5;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.card {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgba(148, 163, 184, 0.4);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.7);
}

.card h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.card p {
  margin: 0.25rem 0 0.75rem;
}

.card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.card li + li {
  margin-top: 0.25rem;
}

.card a {
  color: #a5b4fc;
  text-decoration: none;
}

.card a:hover {
  text-decoration: underline;
}

.focus-goal {
  margin-top: 1rem;
  color: #e0e7ff;
  font-weight: 500;
}

button {
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: none;
  background: #4f46e5;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

button:hover {
  background: #4338ca;
}
</style>