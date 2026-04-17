import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "../api/auth";
import { createRoom, deleteRoom, listRooms, updateRoom, type RoomPayload } from "../api/rooms";
import type { Room } from "../types/types";

export default function useRooms() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: listRooms,
  });

  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: (createdRoom) => {
      toast.success("Xona yaratildi");
      queryClient.setQueryData<Room[]>(["rooms"], (previous = []) => [createdRoom, ...previous]);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Xona yaratib bo'lmadi")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ roomId, payload }: { roomId: string; payload: Partial<RoomPayload> }) => updateRoom(roomId, payload),
    onSuccess: (updatedRoom) => {
      toast.success("Xona yangilandi");
      queryClient.setQueryData<Room[]>(
        ["rooms"],
        (previous = []) => previous.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)),
      );
    },
    onError: (error) => toast.error(getErrorMessage(error, "Xonani yangilab bo'lmadi")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: (_, deletedRoomId) => {
      toast.success("Xona o'chirildi");
      queryClient.setQueryData<Room[]>(["rooms"], (previous = []) => previous.filter((room) => room.id !== deletedRoomId));
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
