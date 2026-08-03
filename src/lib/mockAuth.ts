export type DemoUser = { name: string; email: string; password: string };
const USERS_KEY = "stockflow-demo-users";
const SESSION_KEY = "stockflow-demo-session";
const demoUser: DemoUser = { name: "Inventory Admin", email: "admin@stockflow.demo", password: "demo1234" };

export function getUsers(): DemoUser[] {
  try { const rows = JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as DemoUser[]; return [demoUser, ...rows.filter(x => x.email !== demoUser.email)]; } catch { return [demoUser]; }
}
export function registerUser(user: DemoUser) { const users = getUsers(); if (users.some(x => x.email.toLowerCase() === user.email.toLowerCase())) return false; localStorage.setItem(USERS_KEY, JSON.stringify([...users.filter(x => x.email !== demoUser.email), user])); return true; }
export function signIn(email: string, password: string, remember: boolean) { const user = getUsers().find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === password); if (!user) return null; const storage = remember ? localStorage : sessionStorage; storage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email })); return user; }
export function signOut() { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); }
