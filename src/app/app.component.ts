import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { SnipService, Link } from './snip.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly snip = inject(SnipService);

  urlInput = signal('');
  links    = signal<Link[]>([]);
  newLink  = signal<Link | null>(null);
  error    = signal<string | null>(null);
  loading  = signal(false);

  ngOnInit(): void {
    this.loadLinks();
  }

  isValidUrl(value: string): boolean {
    try {
      const u = new URL(value);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  submit(): void {
    const url = this.urlInput().trim();
    if (!this.isValidUrl(url)) {
      this.error.set('Please enter a valid http or https URL.');
      return;
    }
    this.error.set(null);
    this.newLink.set(null);
    this.loading.set(true);

    this.snip.createLink(url).subscribe({
      next: (link) => {
        this.newLink.set(link);
        this.urlInput.set('');
        this.loading.set(false);
        this.loadLinks();
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.error ?? err.message ?? 'Unknown error';
        this.error.set(`API error: ${msg}`);
        this.loading.set(false);
      },
    });
  }

  private loadLinks(): void {
    this.snip.getLinks().subscribe({
      next: (list) => this.links.set(list),
      error: () => { /* table stays empty on network error */ },
    });
  }
}
