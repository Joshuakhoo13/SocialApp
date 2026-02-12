import { useEffect } from 'react';
import { router } from 'expo-router';

/**
 * Intermediary route to navigate from nested (tabs) back to root index.
 * From root level, router.replace('/') correctly resolves to app/index.tsx.
 */
export default function ResetToRootScreen() {
  useEffect(() => {
    router.replace('/');
  }, []);

  return null;
}
