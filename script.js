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

// ===== GCLID TRACKING - Google Ads Conversion Tracking =====
function captureGclid() {
    const urlParams = new URLSearchParams(window.location.search);
    const gclid = urlParams.get('gclid');
    const gclidField = document.getElementById('gclid_field');

    if (gclid) {
        if (gclidField) gclidField.value = gclid;
        localStorage.setItem('gclid', gclid);
        console.log('✅ GCLID captured from URL:', gclid);
    } else if (localStorage.getItem('gclid')) {
        if (gclidField) gclidField.value = localStorage.getItem('gclid');
        console.log('✅ GCLID loaded from storage:', localStorage.getItem('gclid'));
    } else {
        console.log('ℹ️ No GCLID found (organic traffic)');
    }
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

// ===== DOM HAZIR OLDUĞUNDA TÜM İŞLEMLERİ BAŞLAT =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('📢 PEKCON Ultimate Tracker v3.0 başlatılıyor...');
    console.log('🔐 Dashboard erişimi: Ctrl+Shift+D');

    // 1. GCLID Yakala
    captureGclid();

    // 2. Sayfa Yüklenme Eventi
    sendDataToDashboard('page', 'Ana Sayfa', 'yüklendi', { page_title: document.title });

    // ==========================================
    // 🧭 NAVBAR UI & TRACKING
    // ==========================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');

    // UI Logic: Toggle Menu
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const isOpen = navMenu.classList.contains('active');
            sendDataToDashboard('navbar', 'Menu Toggle', isOpen ? 'açıldı' : 'kapandı');
        });
    }

    // UI Logic: Close menu on link click
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (navMenu) navMenu.classList.remove('active');
            const linkText = this.textContent.trim();
            sendDataToDashboard('navbar', linkText, 'tıklandı');
        });
    });

    // UI Logic: Scroll Shadow
    window.addEventListener('scroll', () => {
        if (navbar) {
            navbar.style.boxShadow = window.pageYOffset > 100 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                : 'none'; // Varsayılan shadow varsa CSS'den gelir, ama JS ile override ediliyordu
        }
    });

    // Logo Tracking
    const logo = document.querySelector('.logo a');
    if (logo) {
        logo.addEventListener('click', function() {
            sendDataToDashboard('navbar', 'Logo', 'tıklandı');
        });
    }

    // TR/EN Dil Değiştirici Tracking
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
    // 📝 FORM LOGIC & TRACKING
    // ==========================================
    const transactionType = document.getElementById('transactionType');
    const productCategory = document.getElementById('productCategory');
    const cargoContainerOptions = document.getElementById('cargo-container-options');
    const cargoType = document.getElementById('cargoType');
    const highTicketForm = document.getElementById('pekconHighTicketForm');
    const submitBtn = highTicketForm ? highTicketForm.querySelector('button[type="submit"]') : null;
    
    // Dynamic Selection Logic
    const quantityOptions = document.getElementById('quantity-options');
    const containerQuantity = document.getElementById('containerQuantity');

    if (productCategory && cargoContainerOptions && cargoType) {
        productCategory.addEventListener('change', function() {
            const selectedText = this.options[this.selectedIndex].text;
            sendDataToDashboard('form', `Ürün Tipi: ${selectedText}`, 'seçildi');

            if (this.value === 'Standart_Konteyner') {
                cargoContainerOptions.style.display = 'block';
                cargoType.setAttribute('required', 'required');
            } else {
                cargoContainerOptions.style.display = 'none';
                cargoType.removeAttribute('required');
                cargoType.value = '';
            }

            // Adet alanını konteyner tipi seçilince göster
            if (this.value) {
                if (quantityOptions) quantityOptions.style.display = 'block';
                if (containerQuantity) containerQuantity.setAttribute('required', 'required');
            } else {
                if (quantityOptions) quantityOptions.style.display = 'none';
                if (containerQuantity) {
                    containerQuantity.removeAttribute('required');
                    containerQuantity.value = '';
                }
            }
        });
    }

    if (transactionType) {
        transactionType.addEventListener('change', function() {
            const selectedText = this.options[this.selectedIndex].text;
            sendDataToDashboard('form', `İşlem Türü: ${selectedText}`, 'seçildi');
        });
    }

    if (cargoType) {
        cargoType.addEventListener('change', function() {
            const selectedText = this.options[this.selectedIndex].text;
            sendDataToDashboard('form', `Konteyner: ${selectedText}`, 'seçildi');
        });
    }

    // High Ticket Form Submission Logic
    if (highTicketForm && submitBtn) {
        highTicketForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("🖱️ Form Tetiklendi! Veriler işleniyor...");

            const statusMsg = document.getElementById('statusMessage');
            
            // Language Support
            const lang = document.documentElement.lang || 'tr';
            const messages = {
                tr: {
                    sending: "Gönderiliyor...",
                    success: "✅ Talebiniz Alındı! Uzmanlarımız size dönüş yapacak.",
                    error: "⚠️ Bir hata oluştu, lütfen WhatsApp'tan yazın.",
                    btnNormal: "TEKLİF GÖNDER"
                },
                en: {
                    sending: "Sending...",
                    success: "✅ We received your request! Our team will contact you shortly.",
                    error: "⚠️ An error occurred. Please contact us via WhatsApp.",
                    btnNormal: "SEND QUOTE"
                }
            };
            const t = messages[lang] || messages.tr;

            const transaction = document.getElementById('transactionType')?.value || '';
            const category = document.getElementById('productCategory')?.value || '';
            const cargoDetail = document.getElementById('cargoType') ? document.getElementById('cargoType').value : '';
            const name = document.getElementById('userName')?.value || '';
            const phone = document.getElementById('userPhone')?.value || '';
            const email = document.getElementById('userEmail')?.value || '';

            submitBtn.disabled = true;
            submitBtn.innerHTML = t.sending;

            // GTM DataLayer Push
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'lead_form_submit',
                'user_data': {
                    'email': email,
                    'phone_number': phone
                },
                'lead_details': {
                    'transaction_type': transaction,
                    'product_category': category,
                    'cargo_type_detail': cargoDetail
                },
                'value': 1000
            });

            // Dashboard'a Bildir
            sendDataToDashboard('form', 'Teklif Formu', 'gönderildi', { 
                customer: name, 
                type: transaction 
            });

            // Google Sheets'e Gönder
            const formData = new FormData(highTicketForm);
            if (cargoDetail) formData.set('cargoType', cargoDetail);

            fetch("https://script.google.com/macros/s/AKfycbx_uZADVuE5OClW55vVlG3i_bV9szVll5ROgyKJSGOdrUDNXDw8ayXmL3-bdCwpOSwo/exec", {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            })
            .then(() => {
                statusMsg.innerHTML = t.success;
                statusMsg.style.color = "#4ade80";
                highTicketForm.reset();
                setTimeout(() => { 
                    submitBtn.innerHTML = t.btnNormal; 
                    submitBtn.disabled = false; 
                }, 3000);
            })
            .catch((error) => {
                console.error("Form Hatası:", error);
                statusMsg.innerHTML = t.error;
                statusMsg.style.color = "#fb7185";
                submitBtn.disabled = false;
            });
        });
    }

    // ==========================================
    // 🖼️ LIGHTBOX IMPLEMENTATION & TRACKING
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const productImages = document.querySelectorAll('.product-img'); // .product-img class should be on images to zoom

    if (lightbox && lightboxImg) {
        // Setup Images
        productImages.forEach((img, index) => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                lightbox.style.display = 'block';
                lightboxImg.src = this.src;
                lightboxImg.alt = this.alt;
                document.body.style.overflow = 'hidden';

                const title = this.alt || `Görsel ${index + 1}`;
                sendDataToDashboard('product', title, 'lightbox açıldı');
                
                // GTM Event
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'image_zoom',
                    'image_name': title
                });
            });
        });

        // Close Logic
        const closeLightbox = () => {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.style.display === 'block') closeLightbox();
        });
    }

    // ==========================================
    // 📦 ÜRÜN KATEGORİLERİ HOVER TRACKING
    // ==========================================
    const productCards = document.querySelectorAll('.product-card');
    const hoverTimers = {};
    const HOT_LEAD_THRESHOLD = 10000; // 10 saniye

    productCards.forEach((card, index) => {
        const productTitle = card.querySelector('h3')?.textContent || `Ürün ${index + 1}`;
        const cardId = `product_${index}`;

        // Karta tıklama (resim değilse)
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
    // 💬 WHATSAPP TRACKING (Conversion + Dashboard)
    // ==========================================
    const whatsappBtn = document.querySelector('.whatsapp-float');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function() {
            // Dashboard
            sendDataToDashboard('whatsapp', 'WhatsApp Butonu', 'tıklandı', { conversion_intent: 'high' });
            
            // Google Ads Conversion
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'conversion',
                'send_to': 'AW-10974974305/3AH9COjd9OcbEOGio_Eo'
            });
            // If gtag is not available, dataLayer push above might need a trigger in GTM.
            // But since the user had onclick="gtag...", they probably use gtag directly.
            if (typeof gtag === 'function') {
                gtag('event', 'conversion', {'send_to': 'AW-10974974305/3AH9COjd9OcbEOGio_Eo'});
            }
        });
    }

    // ==========================================
    // 🌐 SOSYAL MEDYA TRACKING
    // ==========================================
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('click', function() {
            const ariaLabel = this.getAttribute('aria-label') || 'Sosyal Medya';
            sendDataToDashboard('social', ariaLabel, 'tıklandı', { platform: ariaLabel });
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

        // Section Visibility
        const sections = ['anasayfa', 'hizmetler', 'urunler', 'hakkimizda', 'bize-ulasin'];
        
        // Find visible section
        let currentSection = null;
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                    currentSection = sectionId;
                }
            }
        });

        if (currentSection && lastScrollSection !== currentSection) {
            lastScrollSection = currentSection;
            const sectionNames = {
                'anasayfa': 'Ana Sayfa',
                'hizmetler': 'Hizmetler',
                'urunler': 'Ürünler',
                'hakkimizda': 'Hakkımızda',
                'bize-ulasin': 'İletişim'
            };
            sendDataToDashboard('scroll', `Bölüm: ${sectionNames[currentSection]}`, 'görüntülendi', { section_name: sectionNames[currentSection] });
        }

    }, 500));

    console.log('✅ PEKCON Ultimate Tracker v3.0 tam aktif (Single Source)! 🚀');
});
