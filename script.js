// ===== KÖSTEBEK TÜNELİ 2.0 - Dashboard Pencere Referansı =====
let dashboardWindow = null;

// Dashboard'u yeni pencerede aç ve hafızaya al
function openExecutiveDashboard() {
    // Eğer dashboard zaten açıksa, sadece focus ver
    if (dashboardWindow && !dashboardWindow.closed) {
        dashboardWindow.focus();
        console.log('🎯 Dashboard zaten açık, focus verildi');
        return;
    }

    // Dashboard'u aç ve 'dashboardWindow' değişkenine ata
    dashboardWindow = window.open(
        'dashboard/index.html',
        'PekconDashboard',
        'width=1400,height=900,resizable=yes,scrollbars=yes'
    );

    if (!dashboardWindow) {
        alert('⚠️ Pop-up engelleyici aktif! Dashboard açılamadı.\n\nLütfen tarayıcı ayarlarından pop-up iznini verin.');
        console.error('❌ Pop-up blocked!');
        return;
    }

    console.log('🚀 Dashboard penceresi açıldı ve hafızaya alındı.');

    // Dashboard yüklenene kadar bekle (handshake)
    dashboardWindow.addEventListener('load', function() {
        console.log('✅ Dashboard yüklendi, veri akışı hazır!');
    });
}

// KRİTİK FONKSİYON: Dashboard'a veri fırlat
function sendDataToDashboard(pageNumber, productTitle, action = 'inceleniyor') {
    const data = {
        source: 'KATALOG_TRACKER',
        payload: {
            page: pageNumber,
            title: productTitle,
            action: action,
            timestamp: new Date().toLocaleTimeString(),
            isHotLead: action.includes('HOT LEAD')
        }
    };

    // KRİTİK KONTROL: Eğer pencere açıksa veriyi fırlat
    if (dashboardWindow && !dashboardWindow.closed) {
        dashboardWindow.postMessage(data, '*');
        console.log('📤 Veri fırlatıldı:', productTitle);
    } else {
        console.warn('⚠️ Dashboard kapalı! Lütfen önce turuncu butona basıp açın.');
    }

    // GTM'e de gönder (mevcut sistem ile uyumluluk için)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'event': 'pdf_interaction',
        'page_number': pageNumber,
        'product_name': productTitle
    });
}

// ===== OTOMATİK TETİKLEYİCİLER =====
// Resimlerin üzerine gelince veri gönderen otomatik tetikleyici
document.addEventListener('DOMContentLoaded', () => {
    console.log('📢 Katalog Tracker başlatılıyor...');

    // ===== ÜRÜN RESİMLERİ İÇİN HOVER TRACKING =====
    const images = document.querySelectorAll('.product-img');
    console.log(`✅ ${images.length} adet ürün resmi bulundu`);

    images.forEach((img, index) => {
        const productTitle = img.alt || 'Konteyner Ürünü ' + (index + 1);

        img.addEventListener('mouseenter', () => {
            sendDataToDashboard(index + 1, productTitle, 'inceleniyor');
        });
    });

    // ===== ÜRÜN KARTLARI İÇİN GELİŞMİŞ TRACKING + HOT LEAD =====
    const productCards = document.querySelectorAll('.product-card');
    const hoverTimers = {}; // Her kart için ayrı timer
    const HOT_LEAD_THRESHOLD = 10000; // 10 saniye = Hot Lead

    console.log(`✅ ${productCards.length} adet ürün kartı bulundu`);

    productCards.forEach((card, index) => {
        const productTitle = card.querySelector('h3')?.textContent || 'Ürün ' + (index + 1);
        const cardId = 'product_' + index;

        // 1. HOVER START - Kullanıcı ürün üzerine geldi
        card.addEventListener('mouseenter', function() {
            console.log('👀 Hover başladı:', productTitle);

            // İlk 3 saniyede "ilgileniyor" mesajı gönder
            setTimeout(() => {
                if (dashboardWindow && !dashboardWindow.closed) {
                    sendDataToDashboard(index + 2, productTitle, 'ilgileniyor');
                }
            }, 3000);

            // 10 saniye sonra HOT LEAD uyarısı
            hoverTimers[cardId] = setTimeout(() => {
                console.log('🔥 HOT LEAD TESPİT EDİLDİ:', productTitle);
                sendDataToDashboard(index + 2, productTitle, '🔥 HOT LEAD - 10 saniye baktı!');

                // GTM'e özel hot lead eventi
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'hot_lead_detected',
                    'product_name': productTitle,
                    'dwell_time': 10,
                    'lead_quality': 'hot'
                });
            }, HOT_LEAD_THRESHOLD);
        });

        // 2. HOVER END - Kullanıcı üründen ayrıldı
        card.addEventListener('mouseleave', function() {
            // Timer'ı temizle (10 saniye dolmadıysa)
            if (hoverTimers[cardId]) {
                clearTimeout(hoverTimers[cardId]);
                delete hoverTimers[cardId];
            }
            console.log('👋 Hover bitti:', productTitle);
        });

        // 3. CLICK - Ürüne tıklandı
        card.addEventListener('click', function() {
            sendDataToDashboard(index + 2, productTitle, 'tıklandı');

            // GTM'e tıklama eventi
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'product_clicked',
                'product_name': productTitle
            });
        });
    });

    console.log('✅ Katalog Tracker aktif! Hover + Hot Lead sistemi hazır.');
});

// Sayfa yüklendiğinde ilk veriyi gönder (optional)
window.addEventListener('load', function() {
    sendDataToDashboard(1, "Ana Sayfa - Konteyner Katalog", "sayfa görüntülendi");
});
