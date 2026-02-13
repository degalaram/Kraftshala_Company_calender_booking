import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMeetings, createMeeting, updateMeeting, deleteMeeting } from "@/lib/api";
import { toast } from "sonner";

export function useMeetings(filters?: {
  userId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["meetings", filters],
    queryFn: () => getMeetings(filters),
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; start_time?: string; end_time?: string } }) =>
      updateMeeting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
