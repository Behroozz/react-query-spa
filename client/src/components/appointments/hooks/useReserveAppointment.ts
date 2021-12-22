import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';

import { Appointment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from '../../user/hooks/useUser';

// for when we need functions for useMutation
async function setAppointmentUser(
  appointment: Appointment,
  userId: number | undefined,
): Promise<void> {
  if (!userId) return;
  const patchOp = appointment.userId ? 'replace' : 'add';
  const patchData = [{ op: patchOp, path: '/userId', value: userId }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

// useMutation
// no cache data
// no retries
// no referch
// no isLoading --> fetching and there is no cache data vs isFetching
// return mutate function
// onMutate callback for optimistic queries

// Typescript for mutation
// useMutateFunction<TData = unknown, TError, TVariables, TContext>
// TData: Data tyoe returned by mutation function void
// TError: Error type by mutation Error
// TVariables: mutate function variable
// TContext: Context type set onMutate function for optimistic update rollback

// invalidateQuery
// mark query as stale
// trigger refetch

// mutate --> onSuccess --> inValidateQueries --> refetch

export function useReserveAppointment(): UseMutateFunction<
  void,
  unknown,
  Appointment,
  unknown
> {
  const { user } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  const { mutate } = useMutation(
    (appointment: Appointment) => setAppointmentUser(appointment, user?.id),
    {
      onSuccess: () => {
        // invaliate all the queries with prefix
        // invalidate all queries with prefix
        // { exact: true } --> make it exact
        queryClient.invalidateQueries([queryKeys.appointments]);
        toast({
          title: ' You have reserverd an appointment!',
          status: 'success',
        });
      },
    },
  );

  return mutate;
}
