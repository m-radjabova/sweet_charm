import apiClient from "../apiClient/apiClient";

export interface BirthdayGreetingResponse {
  show: boolean;
  name?: string | null;
  message?: string | null;
}

export interface BirthdayGreetingMarkShownResponse {
  success: boolean;
  year: number;
}

export async function getBirthdayGreeting() {
  const { data } = await apiClient.get<BirthdayGreetingResponse>("/birthday-greeting");
  return data;
}

export async function markBirthdayGreetingShown() {
  const { data } = await apiClient.post<BirthdayGreetingMarkShownResponse>("/birthday-greeting/mark-shown");
  return data;
}
