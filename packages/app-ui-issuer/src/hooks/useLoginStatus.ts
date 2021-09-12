import { useEffect, useState } from 'react';

export function useLoginStatus(): boolean {
  const [loginStatus, setLoginStatus] = useState(false);
  const updateLoginStatus = () => {
    const jwt = localStorage.getItem('authorization');
    if (!jwt) {
      setLoginStatus(false);
      return;
    }
    const payload = jwt.split('.')[1] || '';
    const exp = JSON.parse(atob(payload)).exp * 1000; //second to ms
    setLoginStatus(Date.now() <= exp);
  };

  useEffect(() => {
    updateLoginStatus();
    window.addEventListener('storage', updateLoginStatus);
  }, []);

  return loginStatus;
}
