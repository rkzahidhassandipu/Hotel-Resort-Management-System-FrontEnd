'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

async function callApi(endpoint: string, method: string = 'PUT', body?: unknown) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateRoomStatusAction(id: string, status: string) {
  try {
    await callApi(`/rooms/${id}`, 'PUT', { status });
    revalidatePath('/admin/dashboard/rooms');
    return { success: true };
  } catch { return { success: false, error: 'Failed to update room status' }; }
}
