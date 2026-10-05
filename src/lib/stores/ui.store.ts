import { writable } from 'svelte/store';

// Sidebar selalu dalam keadaan expanded (tidak bisa di-collapse).
// Store tetap disediakan sebagai read-only agar komponen lama tidak error.
export const sidebarCollapsed = {
  subscribe: (run: (value: boolean) => void) => {
    run(false);
    return () => {};
  },
  set: () => {},
  update: () => {}
};
export const darkMode = writable(false);

if (typeof window !== 'undefined') {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  darkMode.set(isDark);

  darkMode.subscribe((val) => {
    if (val) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  });
}
