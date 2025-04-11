/**
 * @file pendingRequest.signal.ts
 * @description Temporarily holds a transport request while user completes registration.
 */

import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PendingRequestSignal {
  private _pendingRequest = signal<any>(null);

  // ⬤ Getter
  get pendingRequest() {
    return this._pendingRequest();
  }

  // ⬤ Setter
  setPendingRequest(request: any): void {
    this._pendingRequest.set(request);
  }

  // ⬤ Clearer
  clearPendingRequest(): void {
    this._pendingRequest.set(null);
  }

  // ⬤ Status check
  hasPendingRequest(): boolean {
    return !!this._pendingRequest();
  }
}
