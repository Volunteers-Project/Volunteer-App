
// ENUM LABELS
export const GenderMap: Record<number, string> = {
  1: 'Male',
  2: 'Female',
  3: 'Other',
};

export const StatusMap: Record<number, string> = {
  1: 'Active',
  2: 'Inactive',
};

export const ScaleMap: Record<number, string> = {
  1: 'Local',
  2: 'Regional',
  3: 'National',
  4: 'International',
  5: 'Major Disaster Response',
};

export const DayMap: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

export const WorkTypeMap: Record<number, string> = {
  1: "Cooking",
  2: "Hard Labor",
  3: "Medical Assistance",
  4: "Distribution",
  5: "Logistics",
};


// ──────────────────────────────────────────────
// Relational child tables
// ──────────────────────────────────────────────
export interface VolunteerLocation {
  id?: string;
  region: string;
  area: string;
}

export interface VolunteerSchedule {
  id?: string;
  dayCode: number;      // 1–7
  startTime: string;    // "08:00"
  endTime: string;      // "12:00"
}

// ──────────────────────────────────────────────
// Main volunteer profile
// ──────────────────────────────────────────────
export interface VolunteerProfile {
  id?: string;
  userId?: string;
  name?: string;
  genderCode?: number;
  dateOfBirth?: string;
  statusCode?: number;
  phone?: string;
  workPhone?: string;
  lineId?: string;
  whatsapp?: string;
  wechat?: string;
  email?: string;
  volunteerScaleCode?: number;

  // 🧩 New fields
  preferredWorks?: number[];  // formerly string[], now int[]
  isPrivate?: boolean;        // renamed from profilePrivate
  receiveNotifications?: boolean;

  // ⛓ Relations
  locations?: VolunteerLocation[];
  schedules?: VolunteerSchedule[];

  createdAt?: string;
  updatedAt?: string;
}