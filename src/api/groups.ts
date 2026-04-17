import apiClient from "../apiClient/apiClient";
import type { Group } from "../types/types";

export type GroupPayload = {
  name: string;
  course_id: string;
  teacher_id?: string | null;
  room_id?: string | null;
  monthly_fee: number | string;
  start_date: string;
  end_date?: string | null;
  status?: string;
  schedule_summary?: string | null;
  notes?: string | null;
};

export async function listGroups() {
  const { data } = await apiClient.get<Group[]>("/groups/");
  return data;
}

export async function createGroup(payload: GroupPayload) {
  const { data } = await apiClient.post<Group>("/groups/", payload);
  return data;
}

export async function updateGroup(groupId: string, payload: Partial<GroupPayload>) {
  const { data } = await apiClient.patch<Group>(`/groups/${groupId}`, payload);
  return data;
}

export async function deleteGroup(groupId: string) {
  await apiClient.delete(`/groups/${groupId}`);
}
