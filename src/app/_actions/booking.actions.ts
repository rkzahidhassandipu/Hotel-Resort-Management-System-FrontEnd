'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

async function callApi(endpoint: string, method: string = 'PATCH', body?: unknown) {
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

export async function confirmBookingAction(id: string) {
  try {
    await callApi(`/bookings/${id}/confirm`);
    revalidatePath('/admin/dashboard/bookings');
    revalidatePath('/manager/dashboard/bookings');
    return { success: true };
  } catch { return { success: false, error: 'Failed to confirm booking' }; }
}

export async function cancelBookingAction(id: string) {
  try {
    await callApi(`/bookings/${id}/cancel`);
    revalidatePath('/admin/dashboard/bookings');
    revalidatePath('/manager/dashboard/bookings');
    return { success: true };
  } catch { return { success: false, error: 'Failed to cancel booking' }; }
}

export async function checkInAction(id: string) {
  try {
    await callApi(`/bookings/${id}/check-in`);
    revalidatePath('/admin/dashboard/bookings');
    return { success: true };
  } catch { return { success: false, error: 'Failed to check in' }; }
}

export async function checkOutAction(id: string) {
  try {
    await callApi(`/bookings/${id}/check-out`);
    revalidatePath('/admin/dashboard/bookings');
    return { success: true };
  } catch { return { success: false, error: 'Failed to check out' }; }
}
