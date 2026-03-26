# 🔥 Hot Lead Tracking System

## 🎯 Nedir?

Kullanıcı bir ürün kartının üzerinde **10 saniye veya daha fazla** durduğunda, bu "sıcak fırsat" (Hot Lead) olarak algılanır ve dashboard'da **alarm** verir!

---

## 📊 Nasıl Çalışır?

### Katalog Tarafı (index.html / en.html)

```
Kullanıcı Akışı:
─────────────────────────────────────────────────────────────

1. Kullanıcı ürün kartının üzerine geliyor (mouseenter)
   └─> Timer başlatılır (10 saniye)
   └─> 3 saniye sonra: "ilgileniyor" mesajı gönderilir

2. Kullanıcı 10 saniye boyunca durdu
   └─> 🔥 HOT LEAD eventi tetiklenir!
   └─> Dashboard'a özel veri gönderilir:
       {
         source: 'KATALOG_TRACKER',
         payload: {
           page: 2,
           title: "20ft Standart Konteyner",
           action: "🔥 HOT LEAD - 10 saniye baktı!",
           isHotLead: true
         }
       }

3. Kullanıcı ürün kartından ayrılıyor (mouseleave)
   └─> Timer iptal edilir (eğer 10 saniye dolmadıysa)
```

### Dashboard Tarafı (dashboard.js)

```
Hot Lead Tespit Edildiğinde:
─────────────────────────────────────────────────────────────

1. ✅ Console'da: "🔥🔥🔥 HOT LEAD TESPİT EDİLDİ!"

2. 🔊 Alert sesi çalınır (800Hz beep - 200ms)

3. 🚨 Tam ekran uyarı popup açılır:
   ┌─────────────────────────────────┐
   │                                 │
   │            🔥 (yanıp sönüyor)   │
   │                                 │
   │   HOT LEAD TESPİT EDİLDİ!      │
   │                                 │
   │   20ft Standart Konteyner       │
   │   14:35:22                      │
   │                                 │
   │        [ Kapat ]                │
   │                                 │
   └─────────────────────────────────┘

4. 📋 Feed panelinde özel vurgu:
   - Kırmızı arka plan
   - Parlayan (glow) animasyon
   - 🔥 emoji ile işaretlenmiş

5. ⏰ 10 saniye sonra otomatik kapanır
   (Manuel de kapatılabilir)
```

---

## 🧪 Test Etme

### Yöntem 1: Gerçek Test (Tavsiye Edilen)

1. **Katalog sayfasını** aç (`index.html`)
2. **Dashboard'u** aç (`dashboard/index.html`)
3. Bir ürün kartının üzerine gel
4. **10 saniye boyunca bekle** (hareket ettirme!)
5. Dashboard'da alarm göreceksin! 🔥

### Yöntem 2: Console Test (Hızlı)

Dashboard açıkken Console'da:

```javascript
// Hot Lead simülasyonu
window.postMessage({
    source: 'KATALOG_TRACKER',
    payload: {
        page: 2,
        title: "20ft Standart Konteyner",
        action: "🔥 HOT LEAD - 10 saniye baktı!",
        isHotLead: true,
        timestamp: new Date().toLocaleTimeString()
    }
}, '*');
```

✅ **Beklenen Sonuç:**
- Ses çalacak (tarayıcı izin verirse)
- Popup açılacak
- Feed'de kırmızı vurgu

---

## 📈 GTM Entegrasyonu

Hot Lead tespit edildiğinde GTM'e özel event gönderilir:

```javascript
dataLayer.push({
    'event': 'hot_lead_detected',
    'product_name': "20ft Standart Konteyner",
    'dwell_time': 10,
    'lead_quality': 'hot'
});
```

### GTM Trigger Kurulumu:

1. **Trigger Type:** Custom Event
2. **Event Name:** `hot_lead_detected`
3. **Variables:**
   - `{{product_name}}` - Hangi ürün?
   - `{{dwell_time}}` - Kaç saniye?
   - `{{lead_quality}}` - "hot"

### Örnek Kullanım:

- **Facebook Pixel:** Hot Lead'leri özel audience'a ekle
- **Google Ads:** Remarketing için segmente et
- **CRM:** Otomatik email tetikle
- **Slack:** Sales takımına bildirim gönder

---

## ⚙️ Ayarlar

### Süreyi Değiştirme

`script.js` veya `en.html` içinde:

```javascript
const HOT_LEAD_THRESHOLD = 10000; // 10 saniye

// Daha kısa yapmak için:
const HOT_LEAD_THRESHOLD = 5000;  // 5 saniye

// Daha uzun yapmak için:
const HOT_LEAD_THRESHOLD = 15000; // 15 saniye
```

### İlk "İlgileniyor" Mesajı

3 saniyede "ilgileniyor" mesajı gönderilir:

```javascript
setTimeout(() => {
    sendDataToDashboard(index + 2, productTitle, 'ilgileniyor');
}, 3000); // ← Bunu değiştirebilirsin
```

### Sesi Kapatma

`dashboard.js` içinde `playAlertSound()` metodunu boş yap:

```javascript
playAlertSound() {
    // Ses kapalı
    return;
}
```

---

## 🎨 Visual Customization

### Alert Rengi Değiştirme

`style.css` içinde:

```css
.hot-lead-content {
    /* Kırmızı-Turuncu gradient (default) */
    background: linear-gradient(135deg, #ff0000, #ff6b00);
    
    /* Alternatif: Mavi */
    background: linear-gradient(135deg, #00d4ff, #0066ff);
    
    /* Alternatif: Yeşil */
    background: linear-gradient(135deg, #00ff88, #00cc66);
}
```

### Alert Boyutu

```css
.hot-lead-content {
    max-width: 500px; /* Default */
    
    /* Daha büyük yapmak için: */
    max-width: 700px;
    
    /* Tam ekran: */
    max-width: 90vw;
}
```

---

## 📊 Kullanım Senaryoları

### 1. Sales Takımı İçin

- Dashboard'u sales ofisinde **büyük ekranda** göster
- Hot Lead geldiğinde herkes görsün
- Anında müşteriye ulaşma şansı!

### 2. A/B Testing

- Hangi ürünler daha fazla Hot Lead üretiyor?
- Görseller mi yoksa açıklamalar mı daha etkili?
- Dashboard grafiğinden analiz et

### 3. Real-Time Remarketing

- Hot Lead → GTM → Facebook Pixel
- Anında remarketing kampanyası başlat
- Kullanıcı hala sitedeyken göster!

### 4. Lead Scoring

```
Normal görüntüleme: 1 puan
3 sn hover: 2 puan
Tıklama: 3 puan
10 sn hover (Hot Lead): 10 puan ← Yüksek değer!
```

---

## 🐛 Sorun Giderme

### Ses Çalmıyor

- Tarayıcı ses iznini engelliyor olabilir
- Kullanıcı sayfa ile etkileşime geçmeden ses çalmaz
- Test: Bir yere tıkla, sonra Hot Lead tetikle

### Alert Açılmıyor

Console'da hata var mı kontrol et:

```javascript
// Dashboard hazır mı?
window.dashboard
// DashboardUI objesi dönmeli

// showHotLeadAlert metodu var mı?
typeof window.dashboard.showHotLeadAlert
// "function" dönmeli
```

### Hot Lead Tetiklenmiyor (Katalog)

Console'da şunu kontrol et:

```javascript
// Hover tracking aktif mi?
// Ürün kartına hover et ve console'u izle:
// "👀 Hover başladı: ..." mesajını görmelisin
```

10 saniye bekle:

```javascript
// "🔥 HOT LEAD TESPİT EDİLDİ: ..." mesajını göreceksin
```

---

## 📈 ROI Impact

### Neden Önemli?

1. **Erken Tespit:** Kullanıcı hala sitede → Müdahale şansı var
2. **Yüksek Intent:** 10 saniye bakmak = Gerçek ilgi
3. **Proaktif Satış:** Sales takımı anında devreye girebilir
4. **Remarketing:** Daha akıllı segmentasyon

### Örnek Senaryo:

```
Normal ziyaretçi: %2 dönüşüm
Hot Lead: %15-25 dönüşüm (5-10x daha yüksek!)

Aylık 1000 Hot Lead x %20 dönüşüm = 200 yeni müşteri
Ortalama sipariş: $5,000
Ekstra gelir: $1,000,000/ay 🚀
```

---

## ✅ Checklist

- [ ] Katalog sayfası hover tracking çalışıyor
- [ ] Dashboard Hot Lead alert açılıyor
- [ ] Ses çalıyor (opsiyonel)
- [ ] Feed'de kırmızı vurgu görünüyor
- [ ] GTM'e hot_lead_detected eventi gidiyor
- [ ] Sales takımı bilgilendirildi

**Hepsi tamamsa sistem aktif! 🔥**

---

**Son Güncelleme:** 2026-02-04  
**Feature:** Hot Lead Tracking v1.0  
**Status:** Production Ready ✅
