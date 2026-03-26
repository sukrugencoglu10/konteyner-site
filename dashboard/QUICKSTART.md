# ⚡ Hızlı Başlangıç - Dashboard

## 🎯 3 Adımda Test Et

### 1️⃣ Dashboard'u Aç
```bash
# Dosya yolu:
C:\Users\sukru\Desktop\one drive 10\OneDrive\google ads\asd\dashboard\index.html
```
Tarayıcıda sağ tık → "Birlikte Aç" veya direkt çift tıkla.

### 2️⃣ Console'u Aç
`F12` tuşuna bas → **Console** sekmesine geç

### 3️⃣ Test Mesajı Gönder
Aşağıdaki kodu yapıştır ve Enter'a bas:

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

---

## ✅ Başarı Göstergeleri

Console'da şunları görmelisiniz:
```
🎧 Katalog Listener aktif - KATALOG_TRACKER verisi bekleniyor...
📥 Dashboard veriyi yakaladı: {...}
✅ Dashboard güncellendi!
```

Dashboard'da şunlar değişmeli:
- ✅ **Canlı Aktivite** panelinde yeni bir satır
- ✅ **Popüler Katalog Sayfaları** grafiğinde çubuk yükseldi
- ✅ **Toplam Görüntülenme** sayısı arttı

---

## 🔥 Hızlı Test (Otomatik 5 Mesaj)

```javascript
['20\' DC', '40\' HC', 'Reefer', 'Open Top', 'Flat Rack'].forEach((title, i) => {
    setTimeout(() => {
        window.postMessage({
            source: 'KATALOG_TRACKER',
            payload: { page: i + 1, title: title }
        }, '*');
    }, i * 1000);
});
```

5 saniye içinde dashboard dolacak! 🚀

---

## 📚 Daha Fazla Bilgi

- **Detaylı Kullanım:** `README.md`
- **Entegrasyon:** `INTEGRATION_GUIDE.md`
- **Sorun mu var?** Console'da hata mesajlarını kontrol et

---

**Dashboard Hazır! Test et ve keyif al! 🎉**
