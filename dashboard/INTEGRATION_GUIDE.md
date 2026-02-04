# 🔗 Dashboard Entegrasyon Kılavuzu

## 📡 Listener Mekanizması

### Global Listener (dashboard.js - EN ÜSTTE)

Dashboard'ın **en başında** global bir listener var:

```javascript
window.addEventListener('message', function(event) {
    // Sadece bizim katalogdan gelen veriyi kabul et
    if (event.data.source !== 'KATALOG_TRACKER') return;
    
    const data = event.data.payload;
    console.log("📥 Dashboard veriyi yakaladı:", data);
    
    // Dashboard fonksiyonlarını çağır
    if (window.dashboard) {
        window.dashboard.addFeedItem(`${data.page}. sayfa: ${data.title}`, 'inceleniyor');
        // ... diğer güncellemeler
    }
});
```

### Veri Gönderen (script.js / en.html)

Katalog sayfalarından veri gönderme:

```javascript
function sendDataToDashboard(pageNumber, productTitle) {
    const data = {
        source: 'KATALOG_TRACKER',  // ← Kritik! Bu source ismi eşleşmeli
        payload: {
            page: pageNumber,
            title: productTitle,
            timestamp: new Date().toLocaleTimeString()
        }
    };
    
    window.parent.postMessage(data, '*');
    window.postMessage(data, '*');
}
```

---

## ✅ Kontrol Listesi

### 1. Dashboard Tarafı Hazır mı?

Dashboard açıkken Console'da şunları görmelisiniz:

```
🎧 Katalog Listener aktif - KATALOG_TRACKER verisi bekleniyor...
✅ Dashboard hazır - Manuel API ve KATALOG_TRACKER dinleniyor...
```

### 2. Katalog Tarafı Hazır mı?

Katalog sayfası (`index.html` veya `en.html`) açıkken Console'da:

```javascript
typeof sendDataToDashboard
// "function" dönmeli
```

### 3. Test Mesajı Gönder

Dashboard'da (F12 → Console):

```javascript
window.postMessage({
    source: 'KATALOG_TRACKER',
    payload: {
        page: 4,
        title: "40' HC Yüksek Konteyner",
        userId: 'test_123'
    }
}, '*');
```

**Beklenen Çıktı:**
```
📥 Dashboard veriyi yakaladı: {page: 4, title: "40' HC Yüksek Konteyner", ...}
✅ Dashboard güncellendi!
```

---

## 🎯 Veri Akış Şeması

```
┌─────────────────────┐
│  Katalog Sayfası    │
│  (index.html)       │
│                     │
│  Kullanıcı ürüne    │
│  tıkladı            │
└──────────┬──────────┘
           │
           │ sendDataToDashboard(4, "40' HC")
           │
           ▼
┌─────────────────────┐
│  window.postMessage │
│  {                  │
│    source: 'KATALOG_│
│    TRACKER',        │
│    payload: {...}   │
│  }                  │
└──────────┬──────────┘
           │
           │ Browser IPC
           │
           ▼
┌─────────────────────┐
│  Dashboard          │
│  (dashboard.js)     │
│                     │
│  Global Listener    │
│  yakalıyor          │
└──────────┬──────────┘
           │
           │ window.dashboard API
           │
           ▼
┌─────────────────────┐
│  UI Güncellemeleri  │
│  - Feed item ekle   │
│  - Chart güncelle   │
│  - Stats artır      │
└─────────────────────┘
```

---

## 🐛 Sorun Giderme

### Dashboard veri almıyor?

**1. Console loglarını kontrol et:**
```javascript
// Dashboard console'unda görmeli:
🎧 Katalog Listener aktif - KATALOG_TRACKER verisi bekleniyor...
```

**2. Source ismi doğru mu?**
```javascript
// Gönderen tarafta:
source: 'KATALOG_TRACKER'  // ✅ Doğru

source: 'CATALOG_TRACKER'  // ❌ Yanlış (farklı isim)
source: 'katalog_tracker'  // ❌ Yanlış (küçük harf)
```

**3. Payload yapısı doğru mu?**
```javascript
// Minimum gereksinimler:
payload: {
    page: 1,        // Number - sayfa numarası
    title: "..."    // String - ürün başlığı
}

// Opsiyonel:
payload: {
    page: 1,
    title: "...",
    userId: "...",     // Kullanıcı tracking için
    timestamp: "..."   // Zaman damgası
}
```

**4. window.dashboard var mı?**
```javascript
// Dashboard console'da:
window.dashboard
// DashboardUI {data: DashboardData, elements: {...}, ...} döner

// Eğer undefined ise, sayfa tam yüklenmedi. Bekleyin.
```

### Feed'e mesaj düşmüyor?

**HTML class isimlerini kontrol et:**

```javascript
// dashboard.js içinde:
document.querySelector('.live-feed')  // ✅ class="live-feed"

// index.html içinde:
<div class="live-feed" id="liveFeed">  // ✅ Eşleşiyor
```

### Grafik güncellenmiyor?

**Başlıkta anahtar kelime var mı?**

```javascript
// Otomatik kategori tespiti:
"20' DC Standart"        → Chart index 0 ✅
"40' HC Yüksek"          → Chart index 1 ✅
"Reefer Soğutmalı"       → Chart index 2 ✅
"Open Top Açık"          → Chart index 3 ✅
"Flat Rack Düz"          → Chart index 4 ✅
"Tank Container"         → Chart index -1 ❌ (tanımsız kategori)
```

---

## 🚀 Canlı Ortam Notları

### Güvenlik (Production)

**Wildcard (*) origin kullanmayın:**

```javascript
// Development ✅
window.postMessage(data, '*');

// Production ⚠️ - Spesifik origin:
window.postMessage(data, 'https://yourdomain.com');
```

### CORS Politikası

Eğer dashboard ve katalog **farklı domainlerde** ise:

```javascript
// Dashboard listener'da origin kontrolü ekle:
window.addEventListener('message', function(event) {
    // Güvenilir origin'leri kontrol et
    const trustedOrigins = [
        'https://yourdomain.com',
        'https://catalog.yourdomain.com'
    ];
    
    if (!trustedOrigins.includes(event.origin)) {
        console.warn('⚠️ Untrusted origin:', event.origin);
        return;
    }
    
    if (event.data.source !== 'KATALOG_TRACKER') return;
    // ... geri kalanı
});
```

---

## 📊 GTM Entegrasyonu Kontrolü

Her veri gönderimi GTM'e de push edilir:

```javascript
// Katalog sayfasında console:
window.dataLayer
// Array döner ve içinde:
[
    {
        event: 'pdf_interaction',
        page_number: 4,
        product_name: "40' HC Yüksek Konteyner"
    },
    // ...
]
```

**GTM'de Trigger Kurulumu:**
1. Trigger Type: **Custom Event**
2. Event Name: `pdf_interaction`
3. Variables:
   - `{{page_number}}`
   - `{{product_name}}`

---

## 🎉 Başarı Kriteri

✅ Dashboard açıldığında Console'da listener mesajı görünüyor  
✅ Katalogda ürüne tıklandığında Console'da "veri gönderildi" mesajı  
✅ Dashboard'da feed panelinde yeni item görünüyor  
✅ Grafik çubukları artıyor  
✅ Sayaçlar (Toplam Görüntülenme, Canlı Kullanıcı) güncelleniyor  
✅ GTM dataLayer'a event push ediliyor  

**Hepsi tamamsa entegrasyon başarılı! 🚀**

---

**Son Güncelleme:** 2026-02-04  
**Versiyon:** 1.0  
**Durum:** Production Ready ✅
