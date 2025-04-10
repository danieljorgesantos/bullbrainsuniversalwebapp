import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';

declare global {
    interface Window {
        google: any;
    }
}

@Injectable({
    providedIn: 'root',
})
export class GoogleAutocompleteService {
    private googleAutocomplete: any;
    private googlePredictions: any[] = [];
    private currentPickupRequest: number = 0;

    // Observable to expose googlePredictions to components
    public googlePredictions$ = new Subject<any[]>();

    constructor() { }

    /** ✅ Initialize Google Autocomplete for Pickup Point */
    public googleIniPickupAutocomplete(inputElement: HTMLInputElement, googleLocationControl: any): void {
        // Initialize the AutocompleteService
        this.googleAutocomplete = new window.google.maps.places.AutocompleteService();

        googleLocationControl.valueChanges
            .pipe(debounceTime(500), distinctUntilChanged())
            .subscribe((inputValue: string) => {
                if (inputValue.length > 2) {
                    const requestId = ++this.currentPickupRequest; // ✅ Track request ID

                    this.googleAutocomplete.getPlacePredictions(
                        { input: inputValue, componentRestrictions: { country: 'PT' } },
                        (predictions: any[], status: any) => {
                            if (requestId !== this.currentPickupRequest) return; // ✅ Ignore old responses

                            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                                this.googlePredictions = predictions;
                            } else {
                                this.googlePredictions = [];
                            }

                            // Emit the predictions to the component
                            this.googlePredictions$.next(this.googlePredictions);
                        }
                    );
                } else {
                    this.googlePredictions = [];
                    this.googlePredictions$.next(this.googlePredictions);
                }
            });
    }


  // Optimized Test method that returns predictions from Google Autocomplete
  testMethod(input: any): Observable<any> {
    // Check if we are on the client side (browser)
    if (typeof window !== 'undefined' && window.google) {
      // Initialize AutocompleteService from Google Maps API
      const googleAutocomplete = new window.google.maps.places.AutocompleteService();

      // Observable to fetch predictions
      return new Observable((observer) => {
        googleAutocomplete.getPlacePredictions(
          { input, componentRestrictions: { country: 'PT' } },
          (predictions: any[], status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              // We can now fetch the details of the places in parallel
              const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));

              // Limit number of predictions to fetch details for, to improve speed
              const predictionsToFetch = predictions.slice(0, 5); // limit to 5 or as required

              // Map over the predictions and fetch details in parallel
              const placeDetailsPromises = predictionsToFetch.map((prediction) => {
                return new Promise<any>((resolve, reject) => {
                  placesService.getDetails({ placeId: prediction.place_id }, (placeDetails: any, status: any) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                      // Adding lat and lng to the prediction
                      prediction.lat = placeDetails.geometry.location.lat();
                      prediction.lng = placeDetails.geometry.location.lng();
                      resolve(prediction);
                    } else {
                      reject(status);
                    }
                  });
                });
              });

              // Use Promise.all to execute all details fetching in parallel
              Promise.all(placeDetailsPromises)
                .then((detailedPredictions) => {
                  console.log(detailedPredictions); // Log all predictions with lat and lng
                  observer.next(detailedPredictions); // Emit the predictions with lat/lng
                })
                .catch((error) => {
                  console.error('Error fetching place details', error);
                  observer.next([]); // Return empty array if any error occurs
                })
                .finally(() => {
                  observer.complete(); // Ensure the observable completes
                });
            } else {
              // Handle the case where no predictions are found or status isn't OK
              observer.next([]);
              observer.complete();
            }
          }
        );
      }).pipe(
        catchError((err: any) => {
          console.error('Error fetching Google Autocomplete predictions', err);
          return of([]); // Return empty array in case of error
        })
      );
    } else {
      // If not on the client-side, return an empty array
      return of([]);
    }
  }

}
