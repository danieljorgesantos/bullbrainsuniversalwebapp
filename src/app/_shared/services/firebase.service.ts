// import { Injectable } from '@angular/core';
// import { getMessaging, getToken, onMessage } from 'firebase/messaging';
// import { getFirestore } from 'firebase/firestore';
// import { initializeApp } from 'firebase/app';
// import { environment } from '../enviroments/enviroment';

// @Injectable({
//   providedIn: 'root'
// })
// export class FirebaseService {
//   private apiUrl = `${environment.apiBaseUrl}/api/firebase`;


//   firebaseApp = initializeApp(environment.firebase);
//   messaging = getMessaging(this.firebaseApp);
//   firestore = getFirestore(this.firebaseApp);

//   constructor() {}

//   async requestPermission(): Promise<string | null> {
//     try {
//       // Check current notification permission status
//       const permission = await Notification.requestPermission();
  
//       if (permission === 'denied') {
//         return null;
//       }
  
//       if (permission !== 'granted') {
//         return null;
//       }
  
//       // Check registered service workers
//       const registrations = await navigator.serviceWorker.getRegistrations();
  
//       // Fetch FCM Token
//       const token = await getToken(this.messaging, {
//         vapidKey: 'BPK11BgjbpGLuGd5xymb_WsgEFp-ilVMkTKzgTx2UgU0Abo11cXsCw-Yepuyx571uGu5LI6lx0THHjIQgogzHR8' // Replace with your VAPID key
//       });
  
//       if (!token) {
//         return null;
//       }
  
//       return token;
  
//     } catch (error: any) {
//       if (error.code === 'messaging/permission-blocked') {
//         return error.code;
//       }
  
//       if (error.code === 'messaging/unsupported-browser') {
//         return error.code;
//       }
  
//       return error.message;
//     }
//   }
  
  


//   // Listen for messages
//   listenForMessages() {
//     onMessage(this.messaging, (payload) => {
//       alert(`🚀 ${payload.notification?.title}\n${payload.notification?.body}`);
//     });
//   }

// async sendTestNotification() {
//     console.log('📤 Sending test notification to .NET API...');

//     // 🔥 Backend API URL (Now dynamically retrieved from environment.ts)
//     const backendUrl = `${this.apiUrl}/send-notification`;

//     // 🔥 Hardcoded FCM Device Token (Replace with a real token)
//     const testDeviceToken = 'cMNwwMYozCDx0ACLVPNlqK:APA91bHPJQojzPBQV2yTJ4lSbL-vTm6Cm1b-58M4s-qsG4azATRHDJVYv7n-iT2Hh3sZ32rCDrjxIpqIbQSZ5-CfN1VjPLD-KccWgkvZfXmoc83ztwui5fU';

//     // 🔥 Message Payload
//     const requestBody = {
//       fcmToken: testDeviceToken,
//       title: '🚀 Test Notification from .NET API',
//       body: 'Hello! This is a test notification from your .NET backend.'
//     };

//     try {
//       const response = await fetch(backendUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(requestBody)
//       });

//       const result = await response.json();
//       console.log('✅ Request Sent to .NET API:', result);
//     } catch (error) {
//       console.error('❌ Error sending request to .NET API:', error);
//     }
//   }
  
// }
