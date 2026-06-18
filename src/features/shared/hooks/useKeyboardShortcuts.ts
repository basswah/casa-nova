import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        switch (e.key) {
          case '1':
            navigate('/inventory');
            break;
          case '2':
            navigate('/pos');
            break;
          case '3':
            navigate('/purchases');
            break;
          case '4':
            navigate('/sales');
            break;
          case '5':
            navigate('/reports');
            break;
          case '6':
            navigate('/settings');
            break;
          case '7':
            navigate('/admin/users');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
};