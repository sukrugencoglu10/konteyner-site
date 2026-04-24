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

    const cargoContainerOptions = document.getElementById('cargo-container-options');
    const quantityOptions = document.getElementById('quantity-options');

    if (productCategory) {
        productCategory.addEventListener('change', function() {
            const selectedText = this.options[this.selectedIndex].text;
            sendDataToDashboard('form', `Ürün Tipi: ${selectedText}`, 'seçildi');
            if (cargoContainerOptions) {
                if (this.value === 'Standart_Konteyner') {
                    cargoContainerOptions.style.display = 'block';
                } else {
                    cargoContainerOptions.style.display = 'none';
                    if (cargoType) cargoType.value = '';
                    if (quantityOptions) quantityOptions.style.display = 'none';
                    if (document.getElementById('containerQuantity')) document.getElementById('containerQuantity').value = '';
                }
            }
        });
    }

    if (cargoType) {
        cargoType.addEventListener('change', function() {
            const selectedText = this.options[this.selectedIndex].text;
            sendDataToDashboard('form', `Konteyner: ${selectedText}`, 'seçildi');
            if (quantityOptions && this.value) {
                quantityOptions.style.display = 'block';
            }
        });
    }

    const containerQuantity = document.getElementById('containerQuantity');
    if (containerQuantity) {
        containerQuantity.addEventListener('change', function() {
            const selectedText = this.options[this.selectedIndex].text;
            sendDataToDashboard('form', `Adet: ${selectedText}`, 'seçildi');
        });
    }

    console.log('✅ Form tracking aktif (ilk 3 seçenek)');

    // ==========================================
    // 📤 FORM AJAX SUBMIT (sayfa yönlendirmeden gönderim)
    // ==========================================
    const pekconForm = document.getElementById('pekconHighTicketForm');
    const statusMessage = document.getElementById('statusMessage');

    if (pekconForm) {
        pekconForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const submitBtn = pekconForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'GÖNDERİLİYOR...';
            statusMessage.innerHTML = '';
            statusMessage.className = '';

            const formData = new FormData(pekconForm);

            fetch(pekconForm.action, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            })
            .then(() => {
                statusMessage.innerHTML = '✅ Teklif talebiniz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.';
                statusMessage.className = 'status-success';
                pekconForm.reset();
                sendDataToDashboard('form', 'Teklif Formu Gönderildi', 'HOT LEAD - Form Submit');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            })
            .catch((err) => {
                console.error('Form gönderim hatası:', err);
                statusMessage.innerHTML = '❌ Bir hata oluştu. Lütfen tekrar deneyin veya bizi arayın.';
                statusMessage.className = 'status-error';
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        });
        console.log('✅ Form AJAX submit aktif');
    }

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

                // 1️⃣ GTM dataLayer push (GTM tetikleyicisi için)
                window.dataLayer.push({
                    'event': 'hot_lead',
                    'product_name': productTitle,
                    'lead_quality': 'hot',
                    'dwell_seconds': 10,
                    'gclid': localStorage.getItem('gclid') || ''
                });

                // 2️⃣ GA4'e doğrudan soft conversion eventi
                // GA4 → Conversions ekranında 'hot_lead' eventi dönüşüm olarak işaretle
                if (typeof gtag === 'function') {
                    gtag('event', 'hot_lead', {
                        'product_name': productTitle,
                        'lead_quality': 'hot',
                        'dwell_seconds': 10,
                        'value': 50,       // Yumuşak dönüşüm değeri (TL)
                        'currency': 'TRY'
                    });
                }

                console.log('📡 Hot Lead Soft Conversion → GA4 + GTM gönderildi:', productTitle);
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
            const sectionNames = {
                'anasayfa': 'Ana Sayfa',
                'hizmetler': 'Hizmetler',
                'urunler': 'Ürünler',
                'hakkimizda': 'Hakkımızda',
                'bize-ulasin': 'İletişim'
            };
            const currentSection = sectionNames[lastScrollSection] || 'Bilinmiyor';
            sendDataToDashboard('whatsapp', 'WhatsApp Butonu', '🔥 HOT LEAD', {
                conversion_intent: 'high',
                viewed_section: currentSection
            });
        });
        console.log('✅ WhatsApp tracking aktif');
    }

    // ==========================================
    // 📱 MOBİL HOT LEAD - 3x Görüntüleme
    // Kullanıcı bir ürün kartını 3 kez görünüme getirirse = yüksek niyet
    // ==========================================
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (isTouchDevice && 'IntersectionObserver' in window) {
        const viewCounts = {};

        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const card = entry.target;
                const cardId = card.dataset.mobileId;
                const productTitle = card.querySelector('h3')?.textContent?.trim() || 'Ürün';

                viewCounts[cardId] = (viewCounts[cardId] || 0) + 1;

                if (viewCounts[cardId] === 3) {
                    console.log('📱🔥 MOBİL HOT LEAD (3x görüntüleme):', productTitle);

                    sendDataToDashboard('product', productTitle, '🔥 HOT LEAD (Mobil)', {
                        view_count: 3,
                        lead_quality: 'hot',
                        trigger: 'mobile_3x_view'
                    });

                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        'event': 'hot_lead',
                        'product_name': productTitle,
                        'lead_quality': 'hot',
                        'trigger': 'mobile_3x_view',
                        'gclid': localStorage.getItem('gclid') || ''
                    });

                    if (typeof gtag === 'function') {
                        gtag('event', 'hot_lead', {
                            'product_name': productTitle,
                            'lead_quality': 'hot',
                            'trigger': 'mobile_3x_view',
                            'value': 50,
                            'currency': 'TRY'
                        });
                    }
                }
            });
        }, { threshold: 0.6 }); // Kartın %60'ı ekranda olduğunda say

        productCards.forEach((card, index) => {
            card.dataset.mobileId = `mobile_card_${index}`;
            cardObserver.observe(card);
        });

        console.log(`✅ Mobil Hot Lead tracking aktif (${productCards.length} kart izleniyor)`);
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
    // 🖼️ LIGHTBOX (ürün resmine tıklayınca büyüt)
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const productImages = document.querySelectorAll('.product-img');

    productImages.forEach((img, index) => {
        img.addEventListener('click', function() {
            const productTitle = this.alt || `Ürün Görseli ${index + 1}`;
            sendDataToDashboard('product', productTitle, 'lightbox açıldı');
            if (lightbox && lightboxImg) {
                lightboxImg.src = this.src;
                lightboxImg.alt = this.alt || '';
                lightbox.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closeLightbox() {
        if (lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) closeLightbox();
        });
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox && lightbox.style.display === 'block') closeLightbox();
    });
    console.log('✅ Lightbox aktif');

    // ==========================================
    // 🍔 MOBİL HAMBURGER MENÜ
    // ==========================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        // Link tıklanınca menüyü kapat
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
        // Dışarı tıklanınca kapat
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
        console.log('✅ Hamburger menü aktif');
    }

    console.log('✅ PEKCON Ultimate Tracker v3.0 tam aktif! 🚀');
});

// ===== SANAL SAYFA GÖRÜNTÜLEME (Virtual Page View) =====
// Geri/İleri tuşu veya anchor tıklamasıyla hash değiştiğinde GTM'e sanal sayfa görüntüleme gönderir
const sectionPageNames = {
    '#anasayfa':    { title: 'Ana Sayfa',   path: '/anasayfa' },
    '#urunler':     { title: 'Ürünler',     path: '/urunler' },
    '#hizmetler':   { title: 'Hizmetler',   path: '/hizmetler' },
    '#hakkimizda':  { title: 'Hakkımızda',  path: '/hakkimizda' },
    '#bize-ulasin': { title: 'İletişim',    path: '/bize-ulasin' }
};

function pushVirtualPageView(hash) {
    const page = sectionPageNames[hash] || { title: hash, path: '/' + hash.replace('#', '') };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'event': 'virtual_page_view',
        'page_path': page.path,
        'page_title': page.title
    });
    console.log('📄 Virtual Page View:', page.path, '|', page.title);
}

window.addEventListener('hashchange', function() {
    pushVirtualPageView(window.location.hash);
});

// İlk yüklemede hash varsa da gönder
if (window.location.hash) {
    pushVirtualPageView(window.location.hash);
}

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
