# Integrare Calculator — Ghid Complet

## 1. Iframe (cel mai simplu)

Integrează calculatorul într-un portal, website, CMS cu iframe:

```html
<!-- Calculator standalone cu iframe -->
<iframe 
  src="cale-spre/calculator/index.html" 
  width="100%" 
  height="950" 
  style="border:none;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.12)"
  title="Calculator Juridic Moldova"
  loading="lazy"
></iframe>
```

**Avantaje:** zero modificări, iframe se încarcă independent, caching automat.
**Dezavantaje:** nu poți comunica cu calculatorul din pagina gazdă.

### Transmitere date din pagina gazdă (postMessage)
Calculatorul ascultă `window.addEventListener('message')` pentru:
```javascript
// Deschide un tab specific și/sau pre-completează date
window.frames[0].postMessage({
  action: 'navigate',     // 'dobanda' | 'pen' | 'taxa' | 'zile'
  prefill: {
    dobanda: { suma: 50000, dataScadenta: '01/03/2024', dataCalcul: '01/06/2024' }
  }
}, '*');
```

## 2. Copiere directă în SPA

Dacă vrei să integrezi calculatorul într-un SPA existent (React, Vue, Angular):

1. Copiază `index.html`, `logo.png`, `qr-calc.png` în proiect
2. Încarcă `index.html` într-un container:

```javascript
// Vanilla JS — încarcă calculatorul într-un div
const container = document.getElementById('calc-container');
container.innerHTML = '<object data="calculator/index.html" style="width:100%;height:900px;border:none"></object>';
```

```jsx
// React
function CalculatorWidget() {
  return <iframe src="/calculator/index.html" style={{border:'none',width:'100%',height:950}} />;
}
```

## 3. Capacitor — Build iOS/Android

Calculatorul poate fi transformat în aplicație mobilă nativă:

### Setup

```bash
# 1. Instalează Capacitor
npm install @capacitor/core @capacitor/cli

# 2. Inițializează proiectul
npx cap init "myAVVO Calc" "com.myavvo.calculator" --web-dir=.

# 3. Adaugă platforme
npx cap add ios
npx cap add android

# 4. Sincronizează și deschide Xcode/Android Studio
npx cap sync
npx cap open ios    # sau: npx cap open android
```

### Configurare iOS (opțional)

Editează `ios/App/App/Info.plist` pentru a permite încărcarea:
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

### Build release

```bash
# iOS
npx cap build ios
# -> deschide Xcode: Product > Archive > Distribute App Store

# Android
npx cap build android
# -> APK în android/app/build/outputs/apk/
```

### Configurare Android (opțional)

Editează `android/app/src/main/res/xml/network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">bnm-proxy.myavvo.md</domain>
  </domain-config>
</network-security-config>
```

## 4. PWA (Progressive Web App)

Adaugă `manifest.json` și service worker pentru instalare pe mobil:

### manifest.json
```json
{
  "name": "Calculator Juridic Moldova",
  "short_name": "Calc Juridic",
  "start_url": "/calculator/index.html",
  "display": "standalone",
  "background_color": "#f7fafc",
  "theme_color": "#1a365d",
  "icons": [
    { "src": "logo.png", "sizes": "192x192", "type": "image/png" },
    { "src": "logo.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### service-worker.js (minimal)
```javascript
const CACHE = 'calc-v1';
const urls = ['/calculator/index.html', '/calculator/logo.png', '/calculator/qr-calc.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(urls))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
```

## 5. Customizare

### Schimbă culorile
Editează CSS variables în `<style>`:
```css
:root {
  --primary: #1a365d;        /* header */
  --accent: #38b2ac;         /* butoane, accent */
  --accent-dark: #2c9490;    /* hover */
}
[data-theme="dark"] { ... }
```

### Schimbă logo/titlu în PDF
Editează funcția `_pdfHdr()` în `index.html` pentru a schimba textul/logo-ul din header-ul PDF.

### Adaugă analytics
```html
<!-- Adaugă în <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXX');
</script>
```

## 6. Configurare server pentru rate BNM actualizate

Calculatorul face fetch la `https://bnm-proxy.myavvo.md` pentru rate BNM live. Dacă vrei propriul proxy:

1. Deploy `workers/cloudflare-worker-bnm.js` pe Cloudflare Workers
2. Înlocuiește `BU` în `index.html` cu URL-ul worker-ului tău:
```javascript
var BU = 'https://bnm-proxy.tau-domeniu.md';