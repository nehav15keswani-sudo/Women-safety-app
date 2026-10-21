import { LocationCoordinates } from '../types';

export async function getCurrentLocation(): Promise<LocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported on this device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          timestamp: position.timestamp,
        });
      },
      (error) => {
        console.warn('High-accuracy geolocation failed, attempting relaxed options:', error.message);
        // Try fallback with less restrictive timeout
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy),
              timestamp: pos.timestamp,
            });
          },
          (err) => reject(err),
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
}

export function buildGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function formatSosText(
  userName: string,
  coords: LocationCoordinates | null,
  customNote?: string
): string {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const mapLink = coords ? buildGoogleMapsUrl(coords.lat, coords.lng) : 'Location unavailable (GPS offline)';
  const accInfo = coords?.accuracy ? ` [±${coords.accuracy}m accuracy]` : '';

  let text = `🚨 EMERGENCY DISTRESS BEACON FROM ${userName.toUpperCase()}!\n\n`;
  text += `I feel unsafe and require immediate assistance / pickup.\n`;
  if (customNote) {
    text += `Note: ${customNote}\n`;
  }
  text += `⏰ Timestamp: ${timestamp}\n`;
  text += `📍 Live GPS Coordinates:\n${mapLink}${accInfo}\n\n`;
  text += `Please call me immediately or dispatch local emergency services to this location.`;

  return text;
}

export function dispatchWhatsApp(phone: string, text: string): void {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text);
  const url = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;
  window.open(url, '_blank');
}

export function dispatchSms(phone: string, text: string): void {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const encoded = encodeURIComponent(text);
  // iOS uses &body= while Android uses ?body=
  const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
  const separator = isApple ? '&' : '?';
  const url = cleanPhone ? `sms:${cleanPhone}${separator}body=${encoded}` : `sms:${separator}body=${encoded}`;
  window.location.href = url;
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
