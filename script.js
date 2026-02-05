// ===== KÖSTEBEK TÜNELİ 3.0 - Gizli Dashboard + GTM/GA4 Entegrasyonu =====
// Erişim: Ctrl+Shift+D klavye kısayolu ile dashboard açılır
// Tüm veriler hem Dashboard'a hem GTM/GA4'e gönderilir

let dashboardWindow = null;

// ===== GİZLİ KLAVYE KISAYOLU =====
// Ctrl+Shift+D ile dashboard aç
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        openExecutiveDashboard();
        console.log('🔐 Gizli kısayol kullanıldı: Dashboard açılıyor...');
    }
});

// Dashboard'u yeni pencerede aç
function openExecutiveDashboard() {
    if (dashboardWindow && !dashboardWindow.closed) {
        dashboardWindow.focus();
        console.log('🎯 Dashboard zaten açık, focus verildi');
        return;
    }

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

    console.log('🚀 Dashboard penceresi açıldı.');

    dashboardWindow.addEventListener('load', function() {
        console.log('✅ Dashboard yüklendi, veri akışı hazır!');
    });
}

// ===== ANA VERİ GÖNDERME FONKSİYONU (Dashboard + GTM/GA4) =====
function sendDataToDashboard(category, item, action = 'tıklandı', extra = {}) {
    const timestamp = new Date().toISOString();

    // 1️⃣ DASHBOARD'A GÖNDER (Canlı Takip)
    const dashboardData = {
        source: 'KATALOG_TRACKER',
        payload: {
            category: category,
            item: item,
            action: action,
            timestamp: new Date().toLocaleTimeString(),
            isHotLead: action.includes('HOT LEAD'),
            ...extra
        }
    };

    if (dashboardWindow && !dashboardWindow.closed) {
        dashboardWindow.postMessage(dashboardData, '*');
        console.log(`📤 [${category.toUpperCase()}] ${item} - ${action}`);
    }

    // 2️⃣ GTM/GA4'E GÖNDER (Kalıcı Rapor)
    // GA4 uyumlu event yapısı
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'event': 'user_interaction',
        'event_category': category,      // navbar, form, product, scroll, whatsapp, social
        'event_action': action,          // tıklandı, seçildi, görüntülendi, HOT LEAD
        'event_label': item,             // "Ana Sayfa", "Ürün Tipi: 20' DC", vb.
        'event_timestamp': timestamp,
        'is_hot_lead': action.includes('HOT LEAD'),
        ...extra
    });

    // Debug için console log
    console.log('📊 GA4 Event:', {
        event: 'user_interaction',
        category: category,
        action: action,
        label: item
    });
}

// ===== DOM HAZIR OLDUĞUNDA TÜM TRACKERLAR BAŞLAT =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('📢 PEKCON Ultimate Tracker v3.0 başlatılıyor...');
    console.log('🔐 Dashboard erişimi: Ctrl+Shift+D');

    // ==========================================
    // 🧭 NAVBAR TRACKING
    // ==========================================
    const navLinks = document.querySelectorAll('.nav-menu a');
    console.log(`✅ ${navLinks.length} adet navbar linki bulundu`);

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const linkText = this.textContent.trim();
            sendDataToDashboard('navbar', linkText, 'tıklandı');
        });
    });

    // TR/EN Dil Değiştirici
    const langSwitch = document.querySelector('.lang-switch');
    if (langSwitch) {
        langSwitch.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' || e.target.tagName === 'SPAN') {
                const lang = e.target.textContent.trim();
                sendDataToDashboard('navbar', `Dil: ${lang}`, 'tıklandı');
            }
        });
    }

    // ==========================================
    // 🎨 LOGO TRACKING
    // ==========================================
    const logo = document.querySelector('.logo a');
    if (logo) {
        logo.addEventListener('click', function() {
            sendDataToDashboard('navbar', 'Logo', 'tıklandı');
        });
        console.log('✅ Logo tracking aktif');
    }

    // ==========================================
    // 📝 FORM TRACKING (İlk 3 Seçenek)
    // ==========================================
    const transactionType = document.getElementById('transactionType');
    const productCategory = document.getElementById('productCategory');
    const cargoType = document.getElementById('cargoType');

    if (transactionType) {
        transactionType.addEventListener('change', function() {
            const selectedText = this.options[this.selectedIndex].text;
            sendDataToDashboard('form', `İşlem Türü: ${selectedText}`, 'seçildi');
        });
    }

    if (productCategory) {
        productCategory.addEventListener('change', function() {
            const selectedText = this.options[this.selectedIndex].text;
            sendDataToDashboard('form', `Ürün Tipi: ${selectedText}`, 'seçildi');
        });
    }

    if (cargoType) {
        cargoType.addEventListener('change', function() {
            const selectedText = this.options[this.selectedIndex].text;
            sendDataToDashboard('form', `Konteyner: ${selectedText}`, 'seçildi');
        });
    }

    console.log('✅ Form tracking aktif (ilk 3 seçenek)');

    // ==========================================
    // 📦 ÜRÜN KATEGORİLERİ TRACKING
    // ==========================================
    const productCards = document.querySelectorAll('.product-card');
    const hoverTimers = {};
    const HOT_LEAD_THRESHOLD = 10000; // 10 saniye

    console.log(`✅ ${productCards.length} adet ürün kartı bulundu`);

    productCards.forEach((card, index) => {
        const productTitle = card.querySelector('h3')?.textContent || `Ürün ${index + 1}`;
        const productImg = card.querySelector('.product-img');
        const cardId = `product_${index}`;

        // Resme tıklama
        if (productImg) {
            productImg.addEventListener('click', function(e) {
                sendDataToDashboard('product', productTitle, 'resim tıklandı');
            });
        }

        // Karta tıklama
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('product-img')) {
                sendDataToDashboard('product', productTitle, 'kart tıklandı');
            }
        });

        // Hover tracking (Hot Lead)
        card.addEventListener('mouseenter', function() {
            setTimeout(() => {
                if (card.matches(':hover')) {
                    sendDataToDashboard('product', productTitle, 'ilgileniyor', { dwell_time: 3 });
                }
            }, 3000);

            hoverTimers[cardId] = setTimeout(() => {
                console.log('🔥 HOT LEAD:', productTitle);
                sendDataToDashboard('product', productTitle, '🔥 HOT LEAD', { dwell_time: 10, lead_quality: 'hot' });
            }, HOT_LEAD_THRESHOLD);
        });

        card.addEventListener('mouseleave', function() {
            if (hoverTimers[cardId]) {
                clearTimeout(hoverTimers[cardId]);
                delete hoverTimers[cardId];
            }
        });
    });

    // ==========================================
    // 📜 SCROLL TRACKING
    // ==========================================
    let scrollMilestones = { 25: false, 50: false, 75: false, 100: false };
    let lastScrollSection = null;

    window.addEventListener('scroll', throttle(function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);

        [25, 50, 75, 100].forEach(milestone => {
            if (scrollPercent >= milestone && !scrollMilestones[milestone]) {
                scrollMilestones[milestone] = true;
                sendDataToDashboard('scroll', `%${milestone} scroll`, 'ulaşıldı', { scroll_depth: milestone });
            }
        });

        const sections = ['anasayfa', 'hizmetler', 'urunler', 'hakkimizda', 'bize-ulasin'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 200 && rect.bottom >= 200) {
                    if (lastScrollSection !== sectionId) {
                        lastScrollSection = sectionId;
                        const sectionNames = {
                            'anasayfa': 'Ana Sayfa',
                            'hizmetler': 'Hizmetler',
                            'urunler': 'Ürünler',
                            'hakkimizda': 'Hakkımızda',
                            'bize-ulasin': 'İletişim'
                        };
                        sendDataToDashboard('scroll', `Bölüm: ${sectionNames[sectionId]}`, 'görüntülendi', { section_name: sectionNames[sectionId] });
                    }
                }
            }
        });
    }, 500));

    console.log('✅ Scroll tracking aktif');

    // ==========================================
    // 💬 WHATSAPP TRACKING
    // ==========================================
    const whatsappBtn = document.querySelector('.whatsapp-float');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function() {
            sendDataToDashboard('whatsapp', 'WhatsApp Butonu', 'tıklandı', { conversion_intent: 'high' });
        });
        console.log('✅ WhatsApp tracking aktif');
    }

    // ==========================================
    // 🌐 SOSYAL MEDYA TRACKING
    // ==========================================
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('click', function() {
            const ariaLabel = this.getAttribute('aria-label') || 'Sosyal Medya';
            sendDataToDashboard('social', ariaLabel, 'tıklandı', { platform: ariaLabel });
        });
    });
    console.log(`✅ ${socialLinks.length} adet sosyal medya linki tracking aktif`);

    // ==========================================
    // 🖼️ LIGHTBOX TRACKING
    // ==========================================
    const productImages = document.querySelectorAll('.product-img');
    productImages.forEach((img, index) => {
        img.addEventListener('click', function() {
            const productTitle = this.alt || `Ürün Görseli ${index + 1}`;
            sendDataToDashboard('product', productTitle, 'lightbox açıldı');
        });
    });

    console.log('✅ PEKCON Ultimate Tracker v3.0 tam aktif! 🚀');
});

// ===== YARDIMCI FONKSİYONLAR =====
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Sayfa yüklendiğinde ilk veriyi gönder
window.addEventListener('load', function() {
    sendDataToDashboard('page', 'Ana Sayfa', 'yüklendi', { page_title: document.title });
});
