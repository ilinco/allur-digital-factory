import { useState } from 'react';
import { RouterProvider } from 'react-router';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import router from '@/routing/Routes';
import { parseApiError } from '@/api/errorParser';
import { toast } from '@/context/notificationStore';
import { ErrorBoundary } from '@/components/ui/error/ErrorBoundary';
import { ToastContainer } from '@/components/ui/notification/ToastContainer';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const NetworkWatcher = () => {
  useNetworkStatus();
  return null;
};

export const RootProvider = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            // Only notify if query explicitly opted in or on critical network failure
            if (query.meta?.notifyOnError) {
              const parsed = parseApiError(error);
              toast.error(parsed.message, { title: parsed.title });
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            // Unless specifically suppressed, show error toast for failed mutations
            if (!mutation.meta?.suppressToast) {
              const parsed = parseApiError(error);
              toast.error(parsed.message, { title: parsed.title });
            }
          },
        }),
      }),
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NetworkWatcher />
        <RouterProvider router={router} />
        <ToastContainer />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
