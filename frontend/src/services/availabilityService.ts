import api from './api';

export interface AvailabilitySlotDto {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  booked: boolean;
}

// Get all slots for the logged-in tutor (used in AvailabilityScreen)
export async function getMyAvailabilitySlots(): Promise<AvailabilitySlotDto[]> {
  const response = await api.get('/api/availability/slots');
  console.log('GET /api/availability/slots response:', response.data);
  return response.data;
}

// Add a new slot
export async function addAvailabilitySlot(date: string, startTime: string, endTime: string): Promise<AvailabilitySlotDto> {
  const response = await api.post('/api/availability/slots', { date, startTime, endTime });
  return response.data;
}

// Delete a slot
export async function deleteAvailabilitySlot(slotId: string): Promise<void> {
  await api.delete(`/api/availability/slots/${slotId}`);
}

// For students: get available slots for a tutor on a specific date
export async function getAvailableSlotsForTutor(tutorId: string, date: string): Promise<AvailabilitySlotDto[]> {
  const response = await api.get(`/api/availability/tutor/${tutorId}`, { params: { date } });
  return response.data;
}