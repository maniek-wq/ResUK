import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface OpeningHours {
  open: string;
  close: string;
}

export interface Location {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  phone: string;
  email: string;
  openingHours: {
    monday: OpeningHours;
    tuesday: OpeningHours;
    wednesday: OpeningHours;
    thursday: OpeningHours;
    friday: OpeningHours;
    saturday: OpeningHours;
    sunday: OpeningHours;
  };
  totalTables: number;
  maxCapacity: number;
  isActive: boolean;
  description?: string;
  image?: string;
}

export interface Table {
  _id: string;
  location: string;
  tableNumber: number;
  seats: number;
  zone: 'sala_glowna' | 'ogrodek' | 'vip' | 'bar';
  isActive: boolean;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  locations = signal<Location[]>([]);
  selectedLocation = signal<Location | null>(null);

  constructor(private api: ApiService) {}

  getLocations(): Observable<{ success: boolean; data: Location[] }> {
    return this.api.get<{ success: boolean; data: Location[] }>('/locations').pipe(
      tap(response => {
        if (response.success) {
          this.locations.set(response.data);
        }
      })
    );
  }

  getLocation(id: string): Observable<{ success: boolean; data: Location }> {
    return this.api.get<{ success: boolean; data: Location }>(`/locations/${id}`);
  }

  getLocationTables(locationId: string): Observable<{ success: boolean; data: Table[] }> {
    return this.api.get<{ success: boolean; data: Table[] }>(`/locations/${locationId}/tables`);
  }

  // ========== Stoliki ==========
  
  getTables(locationId?: string): Observable<{ success: boolean; count: number; data: Table[] }> {
    const params = locationId ? { location: locationId } : undefined;
    return this.api.get<{ success: boolean; count: number; data: Table[] }>('/tables', params);
  }

  getTable(id: string): Observable<{ success: boolean; data: Table }> {
    return this.api.get<{ success: boolean; data: Table }>(`/tables/${id}`);
  }

  getTableAvailability(tableId: string, date: string): Observable<TableAvailabilityResponse> {
    return this.api.get<TableAvailabilityResponse>(`/tables/${tableId}/availability`, { date });
  }

  checkAvailability(locationId: string, date: string, time: string, guests: number): Observable<any> {
    return this.api.get('/tables/availability', {
      location: locationId,
      date,
      time,
      guests: guests.toString()
    });
  }

  selectLocation(location: Location): void {
    this.selectedLocation.set(location);
  }
}

export interface TableAvailabilitySlot {
  time: string;
  available: boolean;
  reservation: {
    _id: string;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    status: string;
    timeSlot: {
      start: string;
      end: string;
    };
  } | null;
}

export interface TableAvailabilityResponse {
  success: boolean;
  data: {
    table: {
      _id: string;
      tableNumber: number;
      seats: number;
      location: string;
    };
    date: string;
    timeSlots: TableAvailabilitySlot[];
    available: string[];
    occupied: TableAvailabilitySlot[];
    statistics: {
      total: number;
      available: number;
      occupied: number;
    };
  };
}
