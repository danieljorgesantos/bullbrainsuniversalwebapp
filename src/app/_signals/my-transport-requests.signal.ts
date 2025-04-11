import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MyTransportRequestsSignal {
    private _transportRequests = signal<any[]>([]); // Signal to store transport requests

    get transportRequests() {
        return this._transportRequests();
    }

    setTransportRequests(requests: any[]) {
        this._transportRequests.set(requests);
    }

    addTransportRequest(request: any) {
        this._transportRequests.set([...this._transportRequests(), request]);
    }

    clearTransportRequests() {
        this._transportRequests.set([]);
    }
}
