# 🚀 Köstebek Tüneli 2.0 - Pencereler Arası İletişim

## 🎯 Nedir?

Dashboard'u **ayrı bir pencerede** açıp, katalog sayfası ile `window.postMessage()` üzerinden **gerçek zamanlı veri akışı** sağlar!

```
Katalog Sayfası  ──postMessage──>  Dashboard (Ayrı Pencere)
   (index.html)                      (1400x900px)
```

---

## 🚀 Nasıl Kullanılır?

### 1. Dashboard'u Aç

Katalog sayfasında **sağ alt köşede turuncu buton:**

```
📊 Canlı Takip
```

**Tıkla** → Dashboard yeni pencerede açılır!

### 2. Otomatik Veri Akışı

- Ürün kartına **hover** yap → Dashboard feed'e düşer
- **10 saniye** hover → 🔥 Hot Lead alarm!
- **Tıklama** → Grafik yükselir

### 3. Gerçek Zamanlı Takip

Dashboard penceresinde **anında** görürsün:
- Feed'de yeni aktivite
- Chart'ta çubuk yükselir
- Stats güncellenir

---

## ✨ Özellikler

### 3 Veri Yolu

1. **Embedded iframe** (Sağ alt - 400×300px)
2. **Köstebek Tüneli 2.0** (Ayrı pencere - 1400×900px) ← YENİ!
3. **Parent/Child windows** (Backward compatible)

### Akıllı Pencere Yönetimi

```javascript
// Dashboard zaten açıksa focus ver:
if (dashboardWindow && !dashboardWindow.closed) {
    dashboardWindow.focus();
}

// Yoksa yeni aç:
dashboardWindow = window.open(...);
```

### Pop-up Engelleyici Kontrolü

```javascript
if (!dashboardWindow) {
    alert('⚠️ Pop-up engelleyici aktif!');
}
```

---

## 🧪 Test Etme

1. `index.html` sayfasını aç
2. Sağ alttaki **📊 Canlı Takip** butonuna tıkla
3. Dashboard ayrı pencerede açılır
4. Katalog sayfasında ürüne hover yap
5. Dashboard'da **anında** feed'e düşer!

**Console Test:**
```javascript
openExecutiveDashboard(); // Dashboard'u aç

setTimeout(() => {
    sendDataToDashboard(4, "40' HC", "🔥 HOT LEAD");
}, 2000);
```

---

## 🎨 UI Detayları

### Dashboard Launch Button

- **Konum:** Sağ alt (WhatsApp'ın üstünde)
- **Boyut:** 60×60px yuvarlak
- **Renk:** Pekcon turuncu (#FF6B00)
- **Hover:** Scale + glow efekti
- **Mobilde:** Gizli

### Dashboard Pencere

- **Boyut:** 1400×900px
- **Resize:** Evet
- **Scrollbars:** Evet
- **İsim:** PekconExecutiveDashboard

---

## 🐛 Sorun Giderme

### Dashboard Açılmıyor

**Pop-up engelleyici kontrolü:**
- Tarayıcı ayarlarından pop-up iznini ver
- Chrome: Settings → Privacy → Pop-ups

### Veri Gitmiyor

**Dashboard kapalı mı?**
```javascript
console.log(dashboardWindow.closed); // true ise kapalı
```

**Timing sorunu:**
```javascript
// Dashboard yüklenmeden mesaj gönderme!
// 1-2 saniye bekle:
setTimeout(() => {
    sendDataToDashboard(...);
}, 1500);
```

### Cross-Origin Hatası

**Local server kullan:**
```bash
python -m http.server 8000
# http://localhost:8000/index.html
```

---

## 📊 Kullanım Senaryoları

### 1. Sales Office
- **Monitor 1:** Katalog (müşteri)
- **Monitor 2:** Dashboard (sales team)
- Müşteri bakar → Dashboard alarm verir!

### 2. Client Demo
- Projeksiyon/TV'de dashboard
- Laptop'ta katalog
- "Bakın gerçek zamanlı!"

### 3. A/B Testing
- Hangi ürün daha çok Hot Lead?
- Hover süresi analizi
- Click-through rate

---

## 🚀 İleri Seviye

### Multi-Dashboard

```javascript
let dashboards = {
    main: window.open('dashboard/index.html'),
    hotLeads: window.open('dashboard/hot-leads.html')
};
```

### İki Yönlü İletişim

Dashboard'dan kataloga mesaj:
```javascript
window.opener.postMessage({
    command: 'highlight_product',
    productId: 3
}, '*');
```

---

## ✅ Checklist

- [x] `openExecutiveDashboard()` fonksiyonu
- [x] Dashboard launch butonu (sağ alt)
- [x] `sendDataToDashboard()` 3 yol desteği
- [x] Pop-up engelleyici kontrolü
- [x] Console logları
- [x] Responsive (mobilde gizli)
- [x] Tooltip + hover effects

---

## 🎉 Sonuç

**Köstebek Tüneli 2.0 Hazır!**

1. Katalog aç
2. 📊 butonuna tıkla
3. Dashboard ayrı pencerede açılır
4. **Gerçek zamanlı takip!** 🚀

**3 veri yolu çalışıyor:**
- Embedded iframe ✅
- Köstebek Tüneli 2.0 ✅ (YENİ!)
- Backward compatible ✅

---

**Güncelleme:** 2026-02-04
**Feature:** Köstebek Tüneli 2.0
**Status:** Production Ready ✅
