export type ChangeValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Record<string, unknown>
  | VolunteerSchedule[]
  | VolunteerLocation[]
  | null;

  
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
  profilePrivate?: boolean;        // renamed from profilePrivate
  receiveNotifications?: boolean;

  // ⛓ Relations
  locations?: VolunteerLocation[];
  schedules?: VolunteerSchedule[];

  createdAt?: string;
  updatedAt?: string;
}


export type RoleStatusCode =
  | 0 // never had
  | 1 // pending
  | 2 // active
  | 3 // rejected
  | 4 // expired
  | 5 // renewable
  | 9; // unknown

export interface RoleDetails {
  active_until?: string | null;
  created_at?: string | null;
  expiry_date?: string | null;
  downtime_until?: string | null;
  rejection_reason?: string | null;
}

export interface RoleWithStatus {
  id: number;
  name: string;
  description?: string | null;

  userStatus: RoleStatusCode;
  details: RoleDetails | null;
  canApply: boolean;
}

