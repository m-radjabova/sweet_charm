import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "../api/auth";
import { createRoom, deleteRoom, listRooms, updateRoom, type RoomPayload } from "../api/rooms";
import { invalidateGroupDependentQueries } from "./queryInvalidation";
import type { Room } from "../types/types";
import useContextPro from "./useContextPro";

export default function useRooms() {
  const queryClient = useQueryClient();
  const {
    state: { user },
  } = useContextPro();
  const [searchTerm, setSearchTerm] = useState("");
  const scopeKey = user?.course_center_id ?? user?.id ?? "guest";

  const roomsQuery = useQuery({
    queryKey: ["rooms", scopeKey],
    queryFn: listRooms,
  });

  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: async (createdRoom) => {
      toast.success("Xona yaratildi");
      queryClient.setQueryData<Room[]>(["rooms", scopeKey], (previous = []) => [createdRoom, ...previous]);
      await invalidateGroupDependentQueries(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Xona yaratib bo'lmadi")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ roomId, payload }: { roomId: string; payload: Partial<RoomPayload> }) => updateRoom(roomId, payload),
    onSuccess: async (updatedRoom) => {
      toast.success("Xona yangilandi");
      queryClient.setQueryData<Room[]>(
        ["rooms", scopeKey],
        (previous = []) => previous.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)),
      );
      await invalidateGroupDependentQueries(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Xonani yangilab bo'lmadi")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: async (_, deletedRoomId) => {
      toast.success("Xona o'chirildi");
      queryClient.setQueryData<Room[]>(["rooms", scopeKey], (previous = []) => previous.filter((room) => room.id !== deletedRoomId));
      await invalidateGroupDependentQueries(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Xonani o'chirib bo'lmadi")),
  });

  const rooms = useMemo(() => {
    const list = roomsQuery.data ?? [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;
    return list.filter((room) =>
      [room.name, room.location_note]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [roomsQuery.data, searchTerm]);

  return {
    rooms,
    loading: roomsQuery.isLoading,
    isFetching: roomsQuery.isFetching,
    searchTerm,
    setSearchTerm,
    createRoom: (payload: RoomPayload) => createMutation.mutateAsync(payload),
    updateRoom: (roomId: string, payload: Partial<RoomPayload>) =>
      updateMutation.mutateAsync({ roomId, payload }),
    deleteRoom: (roomId: string) => deleteMutation.mutateAsync(roomId),
  };
}
