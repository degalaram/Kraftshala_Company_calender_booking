import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });
}

// Keep backward compat alias
export function useUsers() {
  const query = useCurrentUser();
  return {
    ...query,
    data: query.data ? [query.data] : [],
  };
}
