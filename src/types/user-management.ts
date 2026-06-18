export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  role: 'admin' | 'cashier' | 'manager';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignIn: string | null;
  profile: Profile | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'cashier' | 'manager';
}

export interface UpdateUserInput {
  id: string;
  email?: string;
  password?: string;
  displayName?: string;
  role?: 'admin' | 'cashier' | 'manager';
  isActive?: boolean;
}
