import jsonpatch from 'fast-json-patch';
import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

// TODO: update type to UseMutateFunction type
export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  const { mutate: patchUser } = useMutation(
    (newUserData: User) => patchUserOnServer(newUserData, user),
    {
      // onMutate returns context that is passed to onError
      onMutate: async (newData: User | null) => {
        // cancel any outgoing queryies for user data, so old server data doesn't overwrite our optimistic update
        queryClient.cancelQueries(queryKeys.user);
        // snapshot of previous user value
        const previousUserData: User = queryClient.getQueryData(queryKeys.user);
        // optimistily update the cahce with new value
        updateUser(newData);
        // return context object with snapshotted value
        return { previousUserData };
      },
      onError: (error, newData, context) => {
        // roll back the cache to saved value
        if (context.previousUserData) {
          console.log('context.previousUserData', context.previousUserData);
          updateUser(context.previousUserData);
          toast({
            title: 'Update failed: restoring previous values',
            status: 'warning',
          });
        }
      },
      // take the response from mutation function
      onSuccess: (userData: User | null) => {
        if (user) {
          // updateUser(userData);
          toast({
            title: 'User updated!',
            status: 'success',
          });
        }
      },
      // after error or success
      onSettled: () => {
        // invalidate user query to make sure we are in sync with server, and trigger a refetch
        queryClient.invalidateQueries(queryKeys.user);
      },
    },
  );

  // Optimistic Update
  // user trigger update with mutate -->
  // send update to server, onMutatel - (cancel queries in progress, update query cache, save previous cache value)
  // --> if success --> invalidate query
  // --> if fail --> onError use context to rollback the cache to before, invalidate the query

  // in order to be able to cancel query
  // return a promise that have a cancel property

  return patchUser;
}
