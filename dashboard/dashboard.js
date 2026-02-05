// ===== KRİTİK: KATALOG VERİ DİNLEYİCİSİ (EN ÜSTTE OLMALI) =====
window.addEventListener('message', function(event) {
    if (!event.data || event.data.source !== 'KATALOG_TRACKER') {
        return;
    }

    const data = event.data.payload;
    console.log("📥 Dashboard veriyi yakaladı:", data);

    if (!window.dashboard) {
        console.warn("⚠️ Dashboard henüz hazır değil, veri bekletiliyor...");
        setTimeout(() => {
            if (window.dashboard) {
                processIncomingData(data);
            }
        }, 500);
        return;
    }

    processIncomingData(data);
});

// Gelen veriyi işle
function processIncomingData(data) {
    // HOT LEAD KONTROLÜ
    if (data.isHotLead || (data.action && data.action.includes('HOT LEAD'))) {
        console.log("🔥🔥🔥 HOT LEAD TESPİT EDİLDİ! 🔥🔥🔥");
        window.dashboard.showHotLeadAlert(data);
    }

    // Kategori bazlı işleme
    const category = data.category || 'other';
    const item = data.item || data.title || 'Bilinmeyen';
    const action = data.action || 'etkileşim';

    // 1. Grup sayacını artır
    window.dashboard.incrementGroupCounter(category);

    // 2. Canlı akışa ekle
    window.dashboard.addFeedItem(item, action, category);

    // 3. İstatistikleri güncelle
    window.dashboard.data.totalViews++;
    window.dashboard.updateStatsDisplay();

    console.log("✅ Dashboard güncellendi!");
}

console.log("🎧 Katalog Listener aktif - KATALOG_TRACKER verisi bekleniyor...");

// ===== DASHBOARD DATA CLASS =====
class DashboardData {
    constructor() {
        this.totalViews = 0;
        this.avgDepth = 0;
        this.liveUsers = 1;
        this.feedItems = [];

        // Grup bazlı sayaçlar
        this.groupCounters = {
            navbar: 0,
            form: 0,
            product: 0,
            scroll: 0,
            whatsapp: 0,
            social: 0,
            page: 0
        };

        // Grup bazlı son aktiviteler
        this.groupLastActivity = {
            navbar: null,
            form: null,
            product: null,
            scroll: null,
            whatsapp: null,
            social: null
        };
    }

    formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
}

// ===== DASHBOARD UI CONTROLLER =====
class DashboardUI {
    constructor() {
        this.data = new DashboardData();
        this.elements = {
            totalViews: document.getElementById('totalViews'),
            avgDepth: document.getElementById('avgDepth'),
            liveUsers: document.getElementById('liveUsers'),
            liveFeed: document.getElementById('liveFeed'),
            // Grup elementleri
            navbarCount: document.getElementById('navbarCount'),
            formCount: document.getElementById('formCount'),
            productCount: document.getElementById('productCount'),
            scrollCount: document.getElementById('scrollCount'),
            whatsappCount: document.getElementById('whatsappCount'),
            socialCount: document.getElementById('socialCount'),
            // Grup last activity
            navbarLast: document.getElementById('navbarLast'),
            formLast: document.getElementById('formLast'),
            productLast: document.getElementById('productLast'),
            scrollLast: document.getElementById('scrollLast'),
            whatsappLast: document.getElementById('whatsappLast'),
            socialLast: document.getElementById('socialLast')
        };

        this.init();
    }

    init() {
        this.updateStatsDisplay();
        console.log('✅ Dashboard UI hazır - Gruplandırılmış tracking aktif');
    }

    // Grup sayacını artır
    incrementGroupCounter(category) {
        if (this.data.groupCounters.hasOwnProperty(category)) {
            this.data.groupCounters[category]++;

            // DOM'u güncelle
            const counterElement = document.getElementById(`${category}Count`);
            if (counterElement) {
                this.animateCounter(counterElement, this.data.groupCounters[category]);

                // Grup kartına pulse efekti
                const groupCard = counterElement.closest('.group-card');
                if (groupCard) {
                    groupCard.classList.add('pulse-active');
                    setTimeout(() => groupCard.classList.remove('pulse-active'), 600);
                }
            }
        }
    }

    // Counter animasyonu
    animateCounter(element, newValue) {
        element.classList.add('counter-update');
        element.textContent = newValue;
        setTimeout(() => element.classList.remove('counter-update'), 300);
    }

    // Son aktiviteyi güncelle
    updateLastActivity(category, item) {
        const lastElement = document.getElementById(`${category}Last`);
        if (lastElement) {
            lastElement.textContent = item.length > 25 ? item.substring(0, 25) + '...' : item;
            lastElement.classList.add('activity-flash');
            setTimeout(() => lastElement.classList.remove('activity-flash'), 500);
        }
    }

    // İstatistikleri güncelle
    updateStatsDisplay() {
        if (this.elements.totalViews) {
            this.elements.totalViews.textContent = this.data.totalViews.toLocaleString('tr-TR');
        }
        if (this.elements.avgDepth) {
            const depth = Object.values(this.data.groupCounters).reduce((a, b) => a + b, 0) / 6;
            this.elements.avgDepth.textContent = depth.toFixed(1);
        }
        if (this.elements.liveUsers) {
            this.elements.liveUsers.textContent = this.data.liveUsers;
        }
    }

    // Canlı akışa öğe ekle
    addFeedItem(item, action = "etkileşim", category = "other") {
        const timestamp = new Date();
        const feedData = {
            id: Date.now(),
            item: item,
            action: action,
            category: category,
            time: this.data.formatTime(timestamp)
        };

        this.data.feedItems.unshift(feedData);
        if (this.data.feedItems.length > 30) {
            this.data.feedItems.pop();
        }

        // Son aktiviteyi güncelle
        this.updateLastActivity(category, item);

        // Feed DOM'a ekle
        const feedElement = document.createElement('div');
        feedElement.className = `feed-item feed-${category}`;

        const categoryIcons = {
            navbar: '🧭',
            form: '📝',
            product: '📦',
            scroll: '📜',
            whatsapp: '💬',
            social: '🌐',
            page: '🏠'
        };

        const categoryColors = {
            navbar: '#00d4ff',
            form: '#ff6b00',
            product: '#00ff88',
            scroll: '#a855f7',
            whatsapp: '#25d366',
            social: '#e91e63',
            page: '#ffd700'
        };

        feedElement.innerHTML = `
            <div class="feed-item-header">
                <span class="feed-category-badge" style="background: ${categoryColors[category] || '#666'}">
                    ${categoryIcons[category] || '📌'} ${category.toUpperCase()}
                </span>
                <span class="feed-item-time">${feedData.time}</span>
            </div>
            <div class="feed-item-text">
                <span class="feed-item-page">${feedData.item}</span>
                <span class="feed-action">${feedData.action}</span>
            </div>
        `;

        if (this.elements.liveFeed) {
            this.elements.liveFeed.insertBefore(feedElement, this.elements.liveFeed.firstChild);

            // Fazla öğeleri kaldır
            while (this.elements.liveFeed.children.length > 30) {
                this.elements.liveFeed.removeChild(this.elements.liveFeed.lastChild);
            }
        }
    }

    // HOT LEAD Alert
    showHotLeadAlert(data) {
        this.playAlertSound();

        const alert = document.createElement('div');
        alert.className = 'hot-lead-alert';
        alert.innerHTML = `
            <div class="hot-lead-content">
                <div class="hot-lead-icon">🔥</div>
                <div class="hot-lead-title">HOT LEAD TESPİT EDİLDİ!</div>
                <div class="hot-lead-product">${data.item || data.title}</div>
                <div class="hot-lead-time">${data.timestamp}</div>
                <button class="hot-lead-close">Kapat</button>
            </div>
        `;

        document.body.appendChild(alert);

        const autoCloseTimer = setTimeout(() => alert.remove(), 10000);

        alert.querySelector('.hot-lead-close').addEventListener('click', () => {
            clearTimeout(autoCloseTimer);
            alert.remove();
        });
    }

    // Alert sesi
    playAlertSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.log('Ses çalınamadı:', e);
        }
    }
}

// ===== DASHBOARD BAŞLAT =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dashboard = new DashboardUI();
    });
} else {
    window.dashboard = new DashboardUI();
}

// API (geriye uyumluluk)
window.DashboardAPI = {
    addFeedItem: (item, action, category) => {
        if (window.dashboard) {
            window.dashboard.addFeedItem(item, action, category);
        }
    },
    incrementGroup: (category) => {
        if (window.dashboard) {
            window.dashboard.incrementGroupCounter(category);
        }
    }
};
