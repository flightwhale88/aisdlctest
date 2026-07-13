const fs = require('fs');
const html = `<div class="container">
  <h1>Snip</h1>
  <p class="tagline">Paste a long URL, get a short one.</p>

  <form class="shorten-form" (ngSubmit)="submit()">
    <input
      type="url"
      placeholder="https://example.com/very/long/url"
      [(ngModel)]="urlInput"
      name="url"
      required
      autocomplete="off"
    />
    <button type="submit" [disabled]="loading()">Shorten</button>
  </form>

  @if (error()) {
    <p class="error">{{ error() }}</p>
  }

  @if (newLink()) {
    <div class="result">
      <span>Short URL:&#160;</span>
      <a [href]="newLink()!.shortUrl" target="_blank">{{ newLink()!.shortUrl }}</a>
    </div>
  }

  @if (links().length > 0) {
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Original URL</th>
          <th>Hits</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        @for (link of links(); track link.code) {
          <tr>
            <td><a [href]="link.shortUrl" target="_blank">{{ link.code }}</a></td>
            <td class="url-cell"><a [href]="link.url" target="_blank">{{ link.url }}</a></td>
            <td>{{ link.hits }}</td>
            <td>{{ link.createdAt | date:'short' }}</td>
          </tr>
        }
      </tbody>
    </table>
  }
</div>
`;
fs.writeFileSync(
  'C:/Users/ddc2localadmin/aisdlctest/snip-demo/src/app/app.component.html',
  html
);
console.log('Written app.component.html');
