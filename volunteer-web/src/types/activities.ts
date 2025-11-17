export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface ParticipantSlot {
  id: string;
  timeSlotId: string;
  mealWanted: boolean | null;
  mealReason: string | null;
  transportWanted: boolean | null;
  transportReason: string | null;
  arrivalTime: string | null;
  leaveTime: string | null;
  statusCode: number | null;
}

export interface ParticipantUser {
  id: string;
  username: string | null;
  email: string;
}

export interface ActivityParticipant {
  id: string;
  user: ParticipantUser;
  slots: ParticipantSlot[];
}

export interface ActivityTimeSlot {
  id: string;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export interface ActivityDetails {
  id: string;

  // Basic
  title: string;
  description: string;
  createdAt: string;

  // Work type
  workTypeCode: number | null;

  // Participants
  minParticipants: number;
  maxParticipants: number;

  // Meeting location
  meetingLocation: string;
  meetingLat: number | null;
  meetingLng: number | null;

  // Volunteer location
  volunteerLocation: string;
  volunteerLat: number | null;
  volunteerLng: number | null;

  // Facilities
  meal: ActivityMeal | null;
  transport: ActivityTransport | null;

  // Slots
  timeSlots: TimeSlot[];
}

export interface UserRole {
  id: number;
  name: string;
}

export interface ActivityMeal {
  id: string;
  provided: boolean;
  isPaid: boolean;
  fee: number | null;
  currency: string | null;
}

export interface ActivityTransport {
  id: string;
  provided: boolean;
  isPaid: boolean;
  fee: number | null;
  currency: string | null;
}

export interface TimeSlot {
  id: string;
  dayCode: number;
  date: string;
  startTime: string;
  endTime: string;
}


