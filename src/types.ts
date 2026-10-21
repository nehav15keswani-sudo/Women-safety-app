export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  notifyOnSos: boolean;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
  address?: string;
}

export interface CheckInTrip {
  id: string;
  destination: string;
  estimatedMinutes: number;
  startedAt: number;
  expectedEndAt: number;
  checkInIntervalMinutes: number;
  lastCheckInAt: number;
  status: 'active' | 'completed' | 'alert_triggered';
  breadcrumbs: LocationCoordinates[];
}

export interface HelplineItem {
  id: string;
  name: string;
  number: string;
  category: 'women' | 'police' | 'domestic' | 'cyber' | 'medical';
  region: string;
  description: string;
  hours: string;
  tollFree: boolean;
}

export interface SafeZone {
  id: string;
  name: string;
  type: 'police' | 'hospital' | 'metro' | 'pharmacy';
  address: string;
  phone: string;
  open24x7: boolean;
  distanceKm: number;
  lat: number;
  lng: number;
}

export interface AudioRecording {
  id: string;
  timestamp: number;
  durationSeconds: number;
  blobUrl: string;
  title: string;
  location?: LocationCoordinates;
}

export interface FakeCallSettings {
  callerName: string;
  callerNumber: string;
  delaySeconds: number;
  scenario: 'guardian_pickup' | 'father_waiting' | 'colleague_nearby' | 'police_officer';
}
