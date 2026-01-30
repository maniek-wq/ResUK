import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface EventDetails {
  name?: string;
  description?: string;
  specialRequirements?: string;
}

export interface Reservation {
  _id: string;
  location: any;
  type: 'table' | 'event' | 'full_venue';
  tables: any[];
  customer: Customer;
  date: string;
  timeSlot: TimeSlot;
  guests: number;
  eventDetails?: EventDetails;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  confirmedBy?: any;
  confirmedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  statusHistory?: Array<{
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    changedBy: any;
    changedAt: string;
    reason?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationFilters {
  location?: string;
  status?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
  availableTables: number;
  totalSeats: number;
}

export interface CreateReservationDto {
  location: string;
  type: 'table' | 'event' | 'full_venue';
  tables?: string[];
  customer: Customer;
  date: string;
  timeSlot: TimeSlot;
  guests: number;
  eventDetails?: EventDetails;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  reservations = signal<Reservation[]>([]);
  loading = signal(false);

  constructor(private api: ApiService) {}

  // Publiczne - tworzenie rezerwacji
  createReservation(data: CreateReservationDto): Observable<{ success: boolean; data: Reservation; message: string }> {
    return this.api.post<{ success: boolean; data: Reservation; message: string }>('/reservations', data);
  }

  // Publiczne - sprawdzenie dostępności
  getAvailability(locationId: string, date: string, guests?: number): Observable<{
    success: boolean;
    data: { location: string; date: string; slots: AvailabilitySlot[] }
  }> {
    const params: any = { date };
    if (guests) params.guests = guests;
    return this.api.get(`/reservations/availability/${locationId}`, params);
  }

  // Admin - lista rezerwacji
  getReservations(filters?: ReservationFilters): Observable<{ success: boolean; count: number; data: Reservation[] }> {
    this.loading.set(true);
    return this.api.get<{ success: boolean; count: number; data: Reservation[] }>('/reservations', filters).pipe(
      tap(response => {
        if (response.success) {
          this.reservations.set(response.data);
        }
        this.loading.set(false);
      })
    );
  }

  // Admin - szczegóły rezerwacji
  getReservation(id: string): Observable<{ success: boolean; data: Reservation }> {
    return this.api.get<{ success: boolean; data: Reservation }>(`/reservations/${id}`);
  }

  // Admin - aktualizacja rezerwacji
  updateReservation(id: string, data: Partial<Reservation>): Observable<{ success: boolean; data: Reservation }> {
    return this.api.put<{ success: boolean; data: Reservation }>(`/reservations/${id}`, data);
  }

  // Admin - zmiana statusu
  updateStatus(id: string, status: string): Observable<{ success: boolean; data: Reservation }> {
    return this.api.patch<{ success: boolean; data: Reservation }>(`/reservations/${id}/status`, { status });
  }

  // Admin - usunięcie rezerwacji
  deleteReservation(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`/reservations/${id}`);
  }
}
