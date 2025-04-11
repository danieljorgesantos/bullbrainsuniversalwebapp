/**
 * @file requesterTransports.signal.ts
 * @description This signal manages transport request operations for requester users and handles state management.
 *
 * @getter requesterTransports
 * Retrieves all transport requests for the currently authenticated requester user.
 *
 * @getter loadingStatus
 * A boolean signal indicating whether transport requests are currently being loaded.
 *
 * @getter error
 * Retrieves any error messages that occur during transport request operations.
 *
 * @method loadRequesterTransports
 * Fetches all transport requests associated with the logged-in requester user.
 * Updates the state with the retrieved transport requests.
 *
 * @method createTransportRequest
 * Creates a new transport request and appends it to the current list.
 *
 * @method updateTransportRequest
 * Updates an existing transport request by applying modifications to its data.
 *
 * @method deleteTransportRequest
 * Deletes a transport request and removes it from the list.
 *
 * @howToUse
 * 1. Import the signal: `import { RequesterTransportsSignal } from '../../../_signals/requesterTransports.signal';`
 * 2. Inject it into the constructor: `public requesterTransportsSignal: RequesterTransportsSignal`
 * 3. Use it as needed: `this.requesterTransportsSignal.loadRequesterTransports();`
 *
 * @date 14-03-2025
 */

import { Injectable, signal } from '@angular/core';
import { AuthManagerSignal } from '../_signals/authManager.signal';
import { firstValueFrom } from 'rxjs';
import { TransportRequestService } from '../_shared/services/transport-request.service';

@Injectable({ providedIn: 'root' })
export class RequesterTransportsSignal {
  private _requesterTransports = signal<any[]>([]); // Stores transport requests for the requester
  private isLoading = signal<boolean>(false);
  private errorMessage = signal<string | null>(null);

  constructor(
    private transportRequestService: TransportRequestService,
    private authManagerSignal: AuthManagerSignal
  ) { }

  // ⬤ Getter: Retrieve all transport requests for the user
  get requesterTransports() {
    return this._requesterTransports();
  }

  // ⬤ Getter: Check if data is loading
  get loadingStatus() {
    return this.isLoading();
  }

  // ⬤ Getter: Retrieve error messages
  get error() {
    return this.errorMessage();
  }

  // ⬤ Getter: Retrieve the count of transport requests
  get requesterTransportsCount(): number {
    return this._requesterTransports().length;
  }


  // ⬤ Fetch all transport requests for the logged-in user
  async loadRequesterTransports() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const userId = this.authManagerSignal.currentUser?.id; // ✅ Ensure we fetch the logged-in user's ID
      if (!userId) {
        throw new Error('User ID is missing. Cannot fetch transport requests.');
      }

      // ✅ Fetch the transport requests for the user
      const response = await firstValueFrom(this.transportRequestService.getUserTransportRequests(userId));
      console.log('response', response)
      this._requesterTransports.set(response);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to fetch transport requests.');
      console.error('🚨 Error fetching transport requests:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ⬤ Create a new transport request
  async createTransportRequest(transportData: any) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(this.transportRequestService.createTransportRequest(transportData));
      this._requesterTransports.set([...this._requesterTransports(), response]); // ✅ Append new request
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to create transport request.');
      console.error('🚨 Error creating transport request:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ⬤ Update an existing transport request
  async updateTransportRequest(id: number, updatedData: any) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await firstValueFrom(this.transportRequestService.updateTransportRequest(id, updatedData));

      // ✅ Update the transport request in the list
      this._requesterTransports.set(
        this._requesterTransports().map(req => (req.id === id ? { ...req, ...updatedData } : req))
      );
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to update transport request.');
      console.error('🚨 Error updating transport request:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ⬤ Delete a transport request
  async deleteTransportRequest(id: number) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await firstValueFrom(this.transportRequestService.deleteTransportRequest(id));

      // ✅ Remove the deleted request from the list
      this._requesterTransports.set(this._requesterTransports().filter(req => req.id !== id));
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to delete transport request.');
      console.error('🚨 Error deleting transport request:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
