# 📊 GTM + GA4 + Looker Studio Kurulum Rehberi

Bu rehber, Pekcon web sitesi için tracking sisteminin kalıcı raporlama altyapısını kurmak içindir.

---

## 📋 Veri Akışı

```
Kullanıcı Etkileşimi
        ↓
    script.js (dataLayer.push)
        ↓
    Google Tag Manager (GTM)
        ↓
    Google Analytics 4 (GA4)
        ↓
    Looker Studio (Rapor)
        ↓
    Otomatik PDF E-posta (Her Pazartesi 09:00)
```

---

## 1️⃣ GOOGLE TAG MANAGER (GTM) KURULUMU

### Adım 1.1: GTM Container Oluştur
1. https://tagmanager.google.com adresine git
2. "Hesap Oluştur" > Hesap adı: `Pekcon`
3. Container adı: `pekcon-web`
4. Platform: `Web`
5. GTM kodunu al (GTM-XXXXXXX)

### Adım 1.2: GTM Kodunu Siteye Ekle
`index.html` dosyasının `<head>` bölümüne ekle:

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

`<body>` etiketinin hemen altına ekle:

```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### Adım 1.3: DataLayer Değişkenleri Oluştur

GTM'de **Variables** > **User-Defined Variables** > **New**:

| Değişken Adı | Tipi | DataLayer Variable Name |
|--------------|------|-------------------------|
| `DL - Event Category` | Data Layer Variable | `event_category` |
| `DL - Event Action` | Data Layer Variable | `event_action` |
| `DL - Event Label` | Data Layer Variable | `event_label` |
| `DL - Event Timestamp` | Data Layer Variable | `event_timestamp` |
| `DL - Is Hot Lead` | Data Layer Variable | `is_hot_lead` |
| `DL - Scroll Depth` | Data Layer Variable | `scroll_depth` |
| `DL - Dwell Time` | Data Layer Variable | `dwell_time` |
| `DL - Section Name` | Data Layer Variable | `section_name` |
| `DL - Platform` | Data Layer Variable | `platform` |
| `DL - Lead Quality` | Data Layer Variable | `lead_quality` |

### Adım 1.4: Trigger Oluştur

**Triggers** > **New** > **Custom Event**

| Trigger Adı | Event Name | Koşul |
|-------------|------------|-------|
| `CE - User Interaction` | `user_interaction` | Tüm custom eventler |
| `CE - Hot Lead` | `user_interaction` | `is_hot_lead` equals `true` |

### Adım 1.5: GA4 Event Tag Oluştur

**Tags** > **New** > **Google Analytics: GA4 Event**

```
Tag Adı: GA4 - User Interaction
Tag Tipi: Google Analytics: GA4 Event
Measurement ID: G-XXXXXXXXXX (GA4'ten alınacak)
Event Name: user_interaction

Event Parameters:
├── event_category: {{DL - Event Category}}
├── event_action: {{DL - Event Action}}
├── event_label: {{DL - Event Label}}
├── event_timestamp: {{DL - Event Timestamp}}
├── is_hot_lead: {{DL - Is Hot Lead}}
├── scroll_depth: {{DL - Scroll Depth}}
├── dwell_time: {{DL - Dwell Time}}
├── section_name: {{DL - Section Name}}
├── platform: {{DL - Platform}}
└── lead_quality: {{DL - Lead Quality}}

Trigger: CE - User Interaction
```

### Adım 1.6: Test Et
1. GTM'de **Preview** modunu aç
2. Siteyi yeni sekmede aç
3. Navbar, form, ürün kartlarına tıkla
4. GTM Debug panelinde eventlerin geldiğini doğrula

---

## 2️⃣ GOOGLE ANALYTICS 4 (GA4) KURULUMU

### Adım 2.1: GA4 Property Oluştur
1. https://analytics.google.com adresine git
2. **Admin** > **Create Property**
3. Property adı: `Pekcon Website`
4. **Data Streams** > **Web** > URL'nizi girin
5. **Measurement ID**'yi kopyalayın (G-XXXXXXXXXX)

### Adım 2.2: Custom Dimensions Oluştur (⚠️ KRİTİK!)

> **NEDEN ÖNEMLİ:** Custom Dimensions olmadan Looker Studio'da sadece "etkinlik sayısı" görürsünüz. Hangi ürün, hangi sayfa olduğunu göremezsiniz. Bu adım olmadan raporlar anlamsız olur!

**Admin** > **Custom Definitions** > **Custom Dimensions** > **Create**

| Dimension Adı | Scope | Event Parameter | Açıklama |
|---------------|-------|-----------------|----------|
| Etkileşim Kategorisi | Event | `event_category` | navbar, form, product, scroll, whatsapp, social |
| Etkileşim Tipi | Event | `event_action` | tıklandı, seçildi, görüntülendi, HOT LEAD |
| Etkileşim Detayı | Event | `event_label` | "20' DC", "Ana Sayfa", "%50 scroll" |
| Hot Lead Durumu | Event | `is_hot_lead` | true/false |
| Scroll Derinliği | Event | `scroll_depth` | 25, 50, 75, 100 |
| Bekleme Süresi | Event | `dwell_time` | 3, 10 (saniye) |
| Bölüm Adı | Event | `section_name` | Sayfa bölümü |
| Platform | Event | `platform` | LinkedIn, Instagram |
| Lead Kalitesi | Event | `lead_quality` | hot |

### Adım 2.3: DebugView ile Test Et
1. GA4'te **Admin** > **DebugView**
2. Sitede etkileşim yap
3. Eventlerin geldiğini ve parametrelerin doğru olduğunu doğrula

---

## 3️⃣ LOOKER STUDIO "PEKCON ROI" DASHBOARD

### Adım 3.1: Looker Studio'ya Bağlan
1. https://lookerstudio.google.com adresine git
2. **Create** > **Report**
3. **Google Analytics** > GA4 property'nizi seçin

### Adım 3.2: Rapor Sayfaları

---

### 📄 SAYFA 1: Executive Summary (Yönetici Özeti)

**Amaç:** Müşterinin hızlıca durumu görmesi

```
┌─────────────────────────────────────────────────────────────┐
│  🏢 PEKCON - Haftalık Performans Raporu                     │
│  [Tarih Aralığı Seçici]                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  1,234   │  │   456    │  │    23    │  │   8.2%   │   │
│  │ Ziyaret  │  │ Katalog  │  │ Hot Lead │  │ Dönüşüm  │   │
│  │          │  │ İnceleme │  │          │  │  Oranı   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  📈 İLGİ HUNİSİ (Funnel)                                   │
│  ═══════════════════════════════════════════════════════   │
│  Giriş (1234) → Katalog (456) → Hot Lead (23)              │
│  [███████████████████████████████████████] 100%            │
│  [█████████████████                      ]  37%            │
│  [████                                   ]   5%            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Looker Studio Yapılandırması:**

| Widget | Dimension | Metric | Filtre |
|--------|-----------|--------|--------|
| Scorecard 1 | - | Sessions | - |
| Scorecard 2 | event_category | Event Count | `event_category = "product"` |
| Scorecard 3 | is_hot_lead | Event Count | `is_hot_lead = "true"` |
| Scorecard 4 | - | Calculated Field | `Hot Lead / Katalog * 100` |
| Funnel Chart | event_category | Event Count | Sıralı: page → product → hot_lead |

---

### 📄 SAYFA 2: Ürün Performansı (Reklam Stratejisi)

**Amaç:** "Hangi ürüne reklam çıkmalı?" sorusunun cevabı

```
┌─────────────────────────────────────────────────────────────┐
│  📦 ÜRÜN PERFORMANS ANALİZİ                                 │
│  "Hangi ürüne reklam çıkmalı?" sorusunun cevabı            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🏆 EN ÇOK HOT LEAD ÜRETEN ÜRÜNLER                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. 20' DC Konteyner      ████████████████  45 lead  │   │
│  │ 2. 40' HC Konteyner      ██████████████    38 lead  │   │
│  │ 3. Reefer Konteyner      ████████          22 lead  │   │
│  │ 4. Open Top              █████             15 lead  │   │
│  │ 5. Flat Rack             ███                9 lead  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💡 ÖNERİ: 20' DC ve 40' HC için Google Ads bütçesini      │
│  artırın - bu ürünler en yüksek ilgiyi çekiyor.            │
│                                                             │
│  ┌────────────────────┬────────────────────┐               │
│  │ [Pie Chart]        │ [Heat Map]         │               │
│  │ Ürün İlgi Dağılımı │ Gün/Saat Analizi   │               │
│  └────────────────────┴────────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Looker Studio Yapılandırması:**

| Widget | Dimension | Metric | Filtre |
|--------|-----------|--------|--------|
| Bar Chart | event_label | Event Count | `event_category = "product"` AND `is_hot_lead = "true"` |
| Pie Chart | event_label | Event Count | `event_category = "product"` |
| Heat Map | Day of Week + Hour | Event Count | `event_category = "product"` |
| Text Box | - | - | Strateji önerileri (manuel) |

---

### 📄 SAYFA 3: Coğrafi Dağılım (İhracat Fırsatları)

**Amaç:** İlginin hangi ülke/şehirlerden geldiğini görmek

```
┌─────────────────────────────────────────────────────────────┐
│  🌍 COĞRAFİ İLGİ ANALİZİ                                    │
│  "İlgi hangi ülke/şehirlerden geliyor?"                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                    │    │
│  │              [DÜNYA HARİTASI]                      │    │
│  │         İlgi yoğunluğuna göre renklendirme        │    │
│  │                                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  📊 TOP 10 ÜLKE                 📊 TOP 10 ŞEHİR            │
│  ┌──────────────────┐          ┌──────────────────┐        │
│  │ 1. Türkiye  45%  │          │ 1. İstanbul 32%  │        │
│  │ 2. Almanya  15%  │          │ 2. İzmir    18%  │        │
│  │ 3. İngiltere 12% │          │ 3. Mersin   15%  │        │
│  │ 4. Hollanda  8%  │          │ 4. Hamburg  10%  │        │
│  │ 5. Fransa    6%  │          │ 5. Rotterdam 8%  │        │
│  └──────────────────┘          └──────────────────┘        │
│                                                             │
│  💡 ÖNERİ: Almanya ve İngiltere'de Google Ads kampanyası   │
│  açmayı düşünün - organik ilgi var.                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Looker Studio Yapılandırması:**

| Widget | Dimension | Metric | Filtre |
|--------|-----------|--------|--------|
| Geo Map | Country | Sessions | - |
| Table 1 | Country | Sessions, % | Sıralama: Descending |
| Table 2 | City | Sessions, % | Sıralama: Descending |
| Text Box | - | - | İhracat önerileri (manuel) |

---

### 📄 SAYFA 4: Engagement & Scroll Analizi

**Amaç:** Kullanıcıların sayfa ile nasıl etkileşime girdiğini anlamak

```
┌─────────────────────────────────────────────────────────────┐
│  📜 SAYFA ETKİLEŞİM ANALİZİ                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎯 SCROLL DERİNLİĞİ HUNİSİ                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Sayfa Girişi    [████████████████████████████] 100% │   │
│  │ %25 Scroll      [████████████████████████    ]  85% │   │
│  │ %50 Scroll      [████████████████            ]  62% │   │
│  │ %75 Scroll      [██████████                  ]  41% │   │
│  │ %100 Scroll     [█████                       ]  23% │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📍 BÖLÜM GÖRÜNTÜLENME SIRASI                              │
│  Ana Sayfa → Hizmetler → Ürünler → Hakkımızda → İletişim   │
│                                                             │
│  ⚡ DÖNÜŞÜM NOKTALARI                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ WhatsApp tıklama:  156 kez  ████████████████████    │   │
│  │ Form seçimi:        89 kez  ███████████             │   │
│  │ LinkedIn:           23 kez  ███                     │   │
│  │ Instagram:          18 kez  ██                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Looker Studio Yapılandırması:**

| Widget | Dimension | Metric | Filtre |
|--------|-----------|--------|--------|
| Bar Chart | scroll_depth | Event Count | `event_category = "scroll"` |
| Bar Chart | section_name | Event Count | `event_action = "görüntülendi"` |
| Scorecard | - | Event Count | `event_category = "whatsapp"` |
| Bar Chart | event_category | Event Count | `event_category IN ("whatsapp", "social", "form")` |

---

## 4️⃣ OTOMATİK PDF E-POSTA AYARI

### Adım 4.1: E-posta Zamanlaması

**Looker Studio > Share > Schedule email delivery**

```
┌─────────────────────────────────────────┐
│  📧 E-POSTA AYARLARI                    │
├─────────────────────────────────────────┤
│                                         │
│  Alıcılar:                              │
│  ├── musteri@firma.com                  │
│  └── siz@ajansiniz.com                  │
│                                         │
│  Sıklık: Haftalık                       │
│  Gün: Pazartesi                         │
│  Saat: 09:00 (Türkiye saati)            │
│                                         │
│  Format: PDF                            │
│  Sayfalar: Tümü                         │
│                                         │
│  Konu:                                  │
│  "Pekcon Haftalık Performans Raporu"    │
│                                         │
│  Gövde:                                 │
│  "Merhaba,                              │
│                                         │
│  Ekteki raporda geçen haftanın web      │
│  sitesi performansını bulabilirsiniz.   │
│                                         │
│  Öne Çıkan Bilgiler:                    │
│  • Toplam etkileşim sayısı              │
│  • Hot Lead tespitleri                  │
│  • En popüler ürünler                   │
│                                         │
│  Sorularınız için bize ulaşın.          │
│                                         │
│  İyi çalışmalar,                        │
│  [Ajans Adı]"                           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 5️⃣ HIZLI KONTROL LİSTESİ

### GTM Kontrol
- [ ] GTM container kodu siteye eklendi
- [ ] 10 adet DataLayer değişkeni oluşturuldu
- [ ] 2 adet Trigger oluşturuldu
- [ ] GA4 Event tag'i oluşturuldu (10 parametre)
- [ ] Preview modda test edildi
- [ ] Container yayınlandı

### GA4 Kontrol
- [ ] Property oluşturuldu
- [ ] Data stream aktif
- [ ] 9 adet Custom Dimension tanımlandı
- [ ] DebugView'da eventler görünüyor
- [ ] Parametreler doğru geliyor

### Looker Studio Kontrol
- [ ] GA4 bağlantısı kuruldu
- [ ] Sayfa 1: Executive Summary oluşturuldu
- [ ] Sayfa 2: Ürün Performansı oluşturuldu
- [ ] Sayfa 3: Coğrafi Dağılım oluşturuldu
- [ ] Sayfa 4: Engagement Analizi oluşturuldu
- [ ] Otomatik e-posta zamanlandı (Pazartesi 09:00)

---

## 6️⃣ MÜŞTERİYE SUNULACAK DEĞER

| Rapor Bölümü | Müşteri İçin Anlam |
|--------------|-------------------|
| **İlgi Hunisi** | Kaç ziyaretçi → Kaç katalog inceleme → Kaç Hot Lead |
| **Ürün Sıralaması** | Hangi ürüne daha fazla reklam bütçesi ayrılmalı |
| **Coğrafi Dağılım** | Yeni ihracat pazarı fırsatları |
| **Scroll Analizi** | Sayfa tasarımı iyileştirme önerileri |
| **Haftalık PDF** | Profesyonel raporlama, güven oluşturma |

---

## 🔧 SORUN GİDERME

### Event Gelmiyorsa
1. Tarayıcı Console'da `dataLayer` yazın, eventleri kontrol edin
2. GTM Preview modunda "Tags Fired" bölümünü kontrol edin
3. Ad blocker'ları devre dışı bırakın

### GA4'te Veri Yoksa
1. GTM tag'inin doğru Measurement ID kullandığını doğrulayın
2. GA4 DebugView'ı kontrol edin
3. 24-48 saat bekleyin (veri gecikmesi olabilir)

### Looker'da Dimension Görünmüyorsa
1. GA4'te Custom Dimension'ların "Active" olduğunu kontrol edin
2. Event parameter adlarının tam eşleştiğini doğrulayın
3. Looker'da data source'u refresh edin
4. En az 24 saat veri toplanmasını bekleyin

### Hot Lead Görünmüyorsa
1. Bir ürün kartının üzerinde 10 saniye durun
2. Console'da "🔥 HOT LEAD" mesajını kontrol edin
3. `is_hot_lead` parametresinin `true` geldiğini doğrulayın

---

## 📞 DESTEK

Bu rehberle ilgili sorularınız için:
- Google Tag Manager Yardım: https://support.google.com/tagmanager
- GA4 Yardım: https://support.google.com/analytics
- Looker Studio Yardım: https://support.google.com/looker-studio

---

*Son güncelleme: Şubat 2024*
*Versiyon: 3.1 - Stratejik ROI Dashboard Eklendi*
