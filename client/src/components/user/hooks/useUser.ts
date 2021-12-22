import { AxiosResponse } from 'axios';
import { useQuery, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../user-storage';

// Aborting via signal
// useQuery --> manage AbortController --> pass signal --> getUser --> Signal --> Axios
// queryClient.cancelQuery(key) do the same

// Cancalable user query
async function getUser(
  user: User | null,
  signal: AbortSignal,
): Promise<User | null> {
  if (!user) return null;
  const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(
    `/user/${user.id}`,
    {
      headers: getJWTHeader(user),
      signal,
    },
  );
  return data.user;
}

interface UseUser {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

// use abortAcontroller to cancel queries
export function useUser(): UseUser {
  const queryClient = useQueryClient();

  // cancel signal
  const { data: user } = useQuery(
    queryKeys.user,
    ({ signal }) => getUser(user, signal),
    {
      initialData: getStoredUser,
      // wither from getUser call or queryClient.setQueriesData
      onSuccess: (received: User | null) => {
        if (!received) {
          clearStoredUser();
        } else {
          setStoredUser(received);
        }
      },
    },
  );

  // meant to be called from useAuth
  function updateUser(newUser: User): void {
    // store response in user cache
    queryClient.setQueriesData(queryKeys.user, newUser);
    // TODO: update the user in the query cache
  }

  // meant to be called from useAuth
  function clearUser() {
    // this will trigger unsuccess and go to line 38 and clear the local storage
    queryClient.setQueryData(queryKeys.user, null);
    // use prefix
    queryClient.removeQueries([queryKeys.appointments, queryKeys.user]);

    // TODO: reset user to null in query cache
  }

  return { user, updateUser, clearUser };
}
