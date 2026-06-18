import { supabase } from '@/lib/supabase';
import type { AdminUser, CreateUserInput, UpdateUserInput } from '@/types/user-management';

const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`;

async function callAdminApi<T>(action: string, options?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${functionUrl}/${action}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...options?.headers,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

export const adminApi = {
  listUsers: () => callAdminApi<AdminUser[]>('users'),

  createUser: (input: CreateUserInput) =>
    callAdminApi<{ id: string; email: string }>('create-user', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateUser: (input: UpdateUserInput) =>
    callAdminApi<{ success: boolean }>('update-user', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
};
