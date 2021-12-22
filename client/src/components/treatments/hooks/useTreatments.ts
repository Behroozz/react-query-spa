import { useQuery, useQueryClient } from 'react-query';

import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
// import { useCustomToast } from '../../app/hooks/useCustomToast';

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get('/treatments');
  return data;
}

// Loading spinner when any query isFetching --> useIsFetching
// isLoainding = isFethcing plus not cached data
export function useTreatments(): Treatment[] {
  // const toast = useCustomToast();
  const fallback = [];
  // const { data = fallback } = useQuery(queryKeys.treatments, getTreatments, {
  //   onError: (error) => {
  //     const title =
  //       error instanceof Error ? error.message : 'error connecting to server';
  //     toast({ title, status: 'error' });
  //   },
  // });
  // surpass the referch
  const { data = fallback } = useQuery(queryKeys.treatments, getTreatments);
  return data;
}

export function usePrefetchTreatment(): void {
  const queryClient = useQueryClient();
  queryClient.prefetchQuery(queryKeys.treatments, getTreatments);
}

// Auto fetching
// refetchOnMount, refetchPnWindowFocus, refetchOnReconnect, refetchOnInterval
// refetch function

// surpess refetch
// increase stale time
// refetchOnMount, refetchPnWindowFocus, refetchOnReconnect == false
