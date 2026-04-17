import apiClient from "../apiClient/apiClient";
import type { Room } from "../types/types";

export type RoomPayload = {
  name: string;
  capacity: number;
  location_note?: string | null;
};

export async function listRooms() {
  const { data } = await apiClient.get<Room[]>("/rooms/");
  return data;
}

export async function createRoom(payload: RoomPayload) {
  const { data } = await apiClient.post<Room>("/rooms/", payload);
  return data;
}

export async function updateRoom(roomId: string, payload: Partial<RoomPayload>) {
  const { data } = await apiClient.patch<Room>(`/rooms/${roomId}`, payload);
  return data;
}

export async function deleteRoom(roomId: string) {
  await apiClient.delete(`/rooms/${roomId}`);
}
