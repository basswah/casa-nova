import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../rootStore';

describe('UI Slice', () => {
  beforeEach(() => {
    useAppStore.setState({
      isSidebarOpen: true,
    });
  });

  it('has correct initial state', () => {
    const state = useAppStore.getState();
    expect(state.isSidebarOpen).toBe(true);
  });

  it('toggles sidebar', () => {
    const { toggleSidebar } = useAppStore.getState();
    toggleSidebar();
    expect(useAppStore.getState().isSidebarOpen).toBe(false);
    toggleSidebar();
    expect(useAppStore.getState().isSidebarOpen).toBe(true);
  });

  it('closes sidebar', () => {
    useAppStore.setState({ isSidebarOpen: true });
    const { closeSidebar } = useAppStore.getState();
    closeSidebar();
    expect(useAppStore.getState().isSidebarOpen).toBe(false);
  });
});

describe('Auth Slice', () => {
  beforeEach(() => {
    useAppStore.setState({
      user: null,
      loading: false,
    });
  });

  it('has correct initial state', () => {
    const state = useAppStore.getState();
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('sets user', () => {
    const { setUser } = useAppStore.getState();
    const mockUser = { id: '123', email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: '', created_at: '' } as import('@supabase/supabase-js').User;
    setUser(mockUser);
    expect(useAppStore.getState().user).toEqual(mockUser);
    expect(useAppStore.getState().loading).toBe(false);
  });

  it('sets loading', () => {
    useAppStore.setState({ loading: true });
    expect(useAppStore.getState().loading).toBe(true);
  });
});