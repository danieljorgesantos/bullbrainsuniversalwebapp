import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class priceSignal {
    private _state = signal<any>({
        distance: 0,
        tax: 0,
        pickupLocationText: '',
        dropoffLocationText: '',
        pickupLatitude: null,
        pickupLongitude: null,
        dropoffLatitude: null,
        dropoffLongitude: null
    });

    // Getter for the signal
    get state() {
        return this._state();
    }

    // Method to update the state
    updateState(newState: Partial<any>) {
        this._state.set({
            ...this._state(),
            ...newState
        });
    }
}
