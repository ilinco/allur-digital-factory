import { useEffect, useState } from 'react';
import { toast } from '@/context/notificationStore';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Подключение к сети восстановлено', {
        title: 'Сеть доступна',
        duration: 3500,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Потеряно соединение с сетью. Сервер завода недоступен.', {
        title: 'Автономный режим',
        duration: 6000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
