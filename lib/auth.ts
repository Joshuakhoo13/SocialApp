import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';

const LAST_AUTH_KEY = 'last_auth_timestamp';
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

export async function setLastAuthTimestamp(): Promise<void> {
  await AsyncStorage.setItem(LAST_AUTH_KEY, Date.now().toString());
}

export async function getLastAuthTimestamp(): Promise<number | null> {
  const value = await AsyncStorage.getItem(LAST_AUTH_KEY);
  return value ? parseInt(value, 10) : null;
}

export function isWithinTwoWeeks(lastAuthTimestamp: number): boolean {
  return Date.now() - lastAuthTimestamp < TWO_WEEKS_MS;
}

export function shouldAutoLogin(session: Session | null, lastAuthTimestamp: number | null): boolean {
  if (!session) return false;
  if (!lastAuthTimestamp) return false;
  return isWithinTwoWeeks(lastAuthTimestamp);
}
