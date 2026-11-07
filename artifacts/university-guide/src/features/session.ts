import { useQueryClient } from '@tanstack/react-query';
import {
  getGetCampassFavoritesQueryKey,
  getGetCampassMeQueryKey,
  getGetCampassPlansQueryKey,
  useGetCampassFavorites,
  useGetCampassMe,
  useGetCampassPlans,
  type CampassUser,
} from '@workspace/api-client-react';
import { useCallback } from 'react';

export function useSession() {
  const query = useGetCampassMe({ query: { queryKey: getGetCampassMeQueryKey(), staleTime: 60_000, retry: 1 } });
  return {
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export const favoritesKey = (userId: string | undefined) => [...getGetCampassFavoritesQueryKey(), userId ?? 'guest'] as const;
export const plansKey = (userId: string | undefined) => [...getGetCampassPlansQueryKey(), userId ?? 'guest'] as const;

/** Private lists are scoped by user ID so one account never sees another's cache. */
export function useFavorites(userId: string | undefined) {
  return useGetCampassFavorites({ query: { enabled: Boolean(userId), queryKey: favoritesKey(userId) } });
}

export function usePlans(userId: string | undefined) {
  return useGetCampassPlans({ query: { enabled: Boolean(userId), queryKey: plansKey(userId) } });
}

/** Call after login / registration / logout to drop every private cache entry. */
export function useIdentityChange() {
  const queryClient = useQueryClient();
  return useCallback(async (user: CampassUser | null) => {
    await Promise.all([
      queryClient.cancelQueries({ queryKey: getGetCampassMeQueryKey() }),
      queryClient.cancelQueries({ queryKey: getGetCampassFavoritesQueryKey() }),
      queryClient.cancelQueries({ queryKey: getGetCampassPlansQueryKey() }),
    ]);
    queryClient.removeQueries({ queryKey: getGetCampassFavoritesQueryKey() });
    queryClient.removeQueries({ queryKey: getGetCampassPlansQueryKey() });
    queryClient.setQueryData(getGetCampassMeQueryKey(), { user });
  }, [queryClient]);
}

export function useInvalidatePrivate() {
  const queryClient = useQueryClient();
  return useCallback((which: 'favorites' | 'plans') => {
    return queryClient.invalidateQueries({
      queryKey: which === 'favorites' ? getGetCampassFavoritesQueryKey() : getGetCampassPlansQueryKey(),
    });
  }, [queryClient]);
}
