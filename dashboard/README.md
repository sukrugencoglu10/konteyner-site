# 📊 Pekcon Real-Time Catalog Insights Dashboard

## 🚀 Kurulum ve Kullanım

### 1️⃣ Dashboard'u Açma
Dashboard'u tarayıcınızda açmak için:
```bash
# Dosya yolundan direkt açın:
asd/dashboard/index.html
```

Veya tarayıcıda: `file:///C:/Users/sukru/Desktop/one%20drive%2010/OneDrive/google%20ads/asd/dashboard/index.html`

---

### 2️⃣ Test Etme (Console'da) ⭐ ÖNERİLEN

Dashboard açıkken **F12** basın ve Console'da şu komutu girin:

```javascript
window.postMessage({
    source: 'KATALOG_TRACKER',
    payload: {
        page: 4,
        title: "40' HC Yüksek Konteyner",
        userId: 'test_user_123',
        timestamp: new Date().toLocaleTimeString()
    }
}, '*');
```

✅ **Beklenen Sonuçlar:**
1. Console'da: `📥 Dashboard veriyi yakaladı: {...}`
2. Console'da: `✅ Dashboard güncellendi!`
3. **Canlı Aktivite** panelinde yeni feed item görünecek
4. **Popüler Katalog Sayfaları** grafiğinde ilgili çubuk yükselecek
5. **Toplam Görüntülenme** sayacı artacak

**Birden Fazla Test İçin:**
```javascript
// Farklı sayfaları test et
['20\' DC Standart', '40\' HC Yüksek', 'Reefer Soğutmalı', 'Open Top Açık', 'Flat Rack Düz'].forEach((title, i) => {
    setTimeout(() => {
        window.postMessage({
            source: 'KATALOG_TRACKER',
            payload: { page: i + 1, title: title, userId: 'test_' + i }
        }, '*');
    }, i * 1000); // Her saniye bir tane
});
```

---

### 3️⃣ Gerçek Entegrasyon

#### Ana Katalog Sayfaları (`index.html` ve `en.html`)
Artık **otomatik tracking** aktif! 

**Ne zaman veri gönderilir:**
- ✅ Sayfa yüklendiğinde (Ana sayfa görüntüleme)
- ✅ Ürün kartlarına tıklandığında
- ✅ `sendDataToDashboard()` fonksiyonu manuel çağrıldığında

**Örnek Kullanım:**
```javascript
// İstediğiniz yerde çağırın:
sendDataToDashboard(5, "Reefer Soğutmalı Konteyner");
```

---

### 4️⃣ Dashboard + Katalog İkilisi (Önerilen Kullanım)

**Senaryo 1: Yan Yana Sekmeler**
1. **Sekme 1:** `asd/index.html` (Katalog sayfası) aç
2. **Sekme 2:** `asd/dashboard/index.html` (Dashboard) aç
3. Katalog sayfasındaki ürünlere tıkla
4. Dashboard sekmesinde canlı güncelleme gör!

**Senaryo 2: İki Monitör (Profesyonel)**
- Sol ekran: Dashboard (`dashboard/index.html`)
- Sağ ekran: Katalog (`index.html`)
- Katalogda gezinirken dashboard'u canlı izle!

---

## 📂 Dosya Yapısı

```
asd/
├── index.html              # Ana katalog (TR) - tracking aktif ✅
├── en.html                 # İngilizce katalog - tracking aktif ✅
├── script.js               # İçinde sendDataToDashboard() var ✅
└── dashboard/
    ├── index.html          # Dashboard ana sayfa
    ├── style.css           # Industrial dark mode tasarım
    └── dashboard.js        # KATALOG_TRACKER dinleyicisi ✅
```

---

## 🎯 Dashboard Özellikleri

### 📊 İstatistik Kartları
- **Toplam Görüntülenme:** Katalog sayfalarının toplam görüntülenme sayısı
- **Ortalama Okuma Derinliği:** Kullanıcıların kaç sayfa incelediği
- **Canlı Kullanıcı:** Aktif kullanıcı sayısı (yeşil pulse efekti)

### 📋 Canlı Aktivite Feed
- Son 20 aktiviteyi gösterir
- Her yeni aktivite üste eklenir (slideIn animasyonu)
- Zaman damgalı (HH:MM:SS)

### 📈 Popüler Katalog Sayfaları (Chart)
Vanilla CSS ile çizilmiş dikey bar chart:
- 20' DC
- 40' HC
- Reefer
- Open Top
- Flat Rack

Her kategori başlığa göre otomatik tespit edilir!

---

## 🔧 Gelişmiş Kullanım

### Manuel Veri Gönderme API

```javascript
// Manuel stats güncelleme
window.DashboardAPI.updateStats(500, 5.3, 12);

// Feed'e yeni item ekleme
window.DashboardAPI.addFeedItem("40' HC sayfası", "pdf indirdi");

// Chart güncelleme (index 0-4)
window.DashboardAPI.updateChart(1, 95); // 40' HC'yi 95 yap
```

---

## 🎨 Tasarım Renkleri

- **Arka Plan:** `#0f0f0f` (Siyah)
- **Kartlar:** `#1a1a1a` (Koyu Gri)
- **Pekcon Turuncu:** `#FF6B00` (Vurgu)
- **Elektrik Mavisi:** `#00d4ff` (Hover)
- **Canlı Yeşil:** `#00ff88` (Live indicator)

---

## 🐛 Troubleshooting

**Dashboard veri almıyor?**
1. Console'da hata var mı kontrol edin (F12)
2. `✅ Dashboard hazır - KATALOG_TRACKER verisi dinleniyor...` mesajını görüyor musunuz?
3. Her iki sayfayı da `file://` protokolünde açtığınızdan emin olun
4. Test mesajını console'dan göndererek dashboard'un çalıştığını doğrulayın

**Grafik güncellenmiyor?**
- Ürün başlıklarında anahtar kelimeler olmalı: "20", "40", "HC", "Reefer", "Open Top", "Flat Rack"
- Console'da hangi kategori tespit edildiğini görebilirsiniz

---

## 📊 GTM DataLayer Entegrasyonu

Her katalog etkileşimi GTM'e de gönderilir:

```javascript
dataLayer.push({
    'event': 'pdf_interaction',
    'page_number': 4,
    'product_name': "40' HC Yüksek Konteyner"
});
```

**GTM'de trigger oluşturmak için:**
- Event Name: `pdf_interaction`
- Değişkenler: `{{page_number}}`, `{{product_name}}`

---

## 🚀 Canlıya Alma

**Localhost veya Server'da çalıştırmak için:**

```bash
# Python ile basit server
python -m http.server 8000

# Node.js ile
npx http-server -p 8000
```

Sonra:
- Katalog: `http://localhost:8000/index.html`
- Dashboard: `http://localhost:8000/dashboard/index.html`

**Not:** Canlı ortamda `window.postMessage(data, '*')` yerine spesifik origin kullanın:
```javascript
window.postMessage(data, 'https://yourdomain.com');
```

---

## 👨‍💻 Geliştirici: Growth Engineer
- ✅ Vanilla JS/CSS/HTML (Dış kütüphane yok)
- ✅ Responsive tasarım
- ✅ GTM entegrasyonu
- ✅ Real-time data tracking
- ✅ Industrial dark mode

---

**Başarılar! 🎉**
