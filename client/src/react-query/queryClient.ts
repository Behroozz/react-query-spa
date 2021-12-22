import { createStandaloneToast } from '@chakra-ui/react';
import { QueryClient } from 'react-query';

import { theme } from '../theme';

// Pre-populating data
// prefetchQuery queryClient option--> data from server --> added to cache
// useQueryClient hook
// setQueryData queryClient option--> data from client --> added to cache
// placeholderData useQuery option--> data from client --> not added to cache
// initialData useQuery option --> data from client --> added to cache

const toast = createStandaloneToast({ theme });

function queryErrorHandler(error: unknown): void {
  // error is type unknown because in js, anything can be an error (e.g. throw(5))
  const id = 'react-query-error';
  const title =
    error instanceof Error ? error.message : 'error connecting to server';

  // prevent duplicate toasts
  toast.closeAll();
  toast({ id, title, status: 'error', variant: 'subtle', isClosable: true });
}

// setQueryData invokes onSuccess callback but removeQueries not

// useErrorBoundry
export const queryClient = new QueryClient({
  defaultOptions: {
    // not necessarily recommanded
    queries: {
      onError: queryErrorHandler,
      staleTime: 600000, // 10 minutes
      // default cache time is 5 min so we should also increate the cache time
      // and state stay fresh
      cacheTime: 900000, // 15 min
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      onError: queryErrorHandler,
    },
  },
});
