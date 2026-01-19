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

  selectLocation(location: Location): void {
    this.selectedLocation.set(location);
  }
}
