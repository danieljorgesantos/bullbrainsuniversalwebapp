import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthManagerSignal } from '../../../_signals/authManager.signal';
import { RequesterTransportsSignal } from '../../../_signals/requesterTransports.signal';

@Component({
  selector: 'app-requester-my-transports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './requester-my-transports.component.html'
})
export class RequesterMyTransportsComponent implements OnInit, OnDestroy {
  currentLanguage: string = 'pt-PT';




  isSidebarOpen: boolean = false;
  transportRequests: any[] = [];
  userId: number | null = null;
  expandedIndex: number | null = null;
  dots: string = '';
  private interval: any;

  constructor(
    private router: Router,
    public authManagerSignal: AuthManagerSignal,
    public requesterTransportsSignal: RequesterTransportsSignal
  ) { }

  ngOnInit(): void {

    // ✅ Retrieve the user ID safely
    this.userId = this.authManagerSignal.currentUser?.id ?? null;
    if (!this.userId) {
      console.error("⚠️ User ID is missing. Cannot fetch transport requests.");
      return;
    }

    // ✅ Check if transport requests are already loaded
    if (this.requesterTransportsSignal.requesterTransports.length > 0) {
      console.log("✅ Using cached transport requests:", this.requesterTransportsSignal.requesterTransports);
      this.transportRequests = this.requesterTransportsSignal.requesterTransports;
    } else {
      this.loadRequesterTransports();
    }

    // ✅ Show loading animation (three dots)
    this.interval = setInterval(() => {
      this.dots = this.dots.length < 3 ? this.dots + '.' : '';
    }, 500);
  }

  /**
   * ✅ Fetch transport requests only if they haven't been loaded
   */
  async loadRequesterTransports() {
    try {
      console.log("🚀 Fetching transport requests...");
      await this.requesterTransportsSignal.loadRequesterTransports();
      this.transportRequests = this.requesterTransportsSignal.requesterTransports;
    } catch (error) {
      console.error("🚨 Error loading transport requests:", error);
    }
  }

  ngOnDestroy() {
    clearInterval(this.interval); // ✅ Clean up interval on component destruction
  }

  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  toggleAccordion(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'; // Gray
      case 'Going to Pickup':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'; // Blue
      case 'Going to Dropoff':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'; // Yellow
      case 'Delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'; // Green
      default:
        return 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-300'; // Default
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'Pending':
        return 'A aguardar condutor';
      case 'Going to Pickup':
        return 'Condutor a Recolher';
      case 'Going to Dropoff':
        return 'A Caminho do Local de Entrega';
      case 'Delivered':
        return 'Entregue - Finalizado';
      default:
        return 'Desconhecido'; // Unexpected case
    }
  }

  getAlertClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      case 'Going to Pickup':
        return 'bg-blue-100 text-blue-800';
      case 'Going to Dropoff':
        return 'bg-yellow-100 text-yellow-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-200 text-gray-900';
    }
  }

  getPulseColor(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-gray-500';
      case 'Going to Pickup':
        return 'bg-blue-500';
      case 'Going to Dropoff':
        return 'bg-yellow-500';
      case 'Delivered':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  }


  isLiveStatus(status: string): boolean {
    return status === 'Going to Pickup' || status === 'Going to Dropoff';
  }

}
