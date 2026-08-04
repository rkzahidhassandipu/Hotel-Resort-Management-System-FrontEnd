'use client';
import { Suspense } from 'react';
import BookingConfirmPage from '@/components/booking/BookingConfirmPage';

export default function Page() {
  return (
    <Suspense>
      <BookingConfirmPage />
    </Suspense>
  );
}