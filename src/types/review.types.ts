export interface Review {
  id: string;
  overallRating: number;
  title?: string;
  comment?: string;
  isAnonymous: boolean;
  createdAt: string;
  status: string;
  managerResponse?: string;
  booking?: {
    bookingNumber: string;
    room?: {
      roomNumber: string;
    };
  };
}

export interface ReviewableBooking {
  id: string;
  bookingNumber: string;
  status: string;
  room?: {
    roomNumber: string;
  };
}