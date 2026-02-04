// ===== KRİTİK: KATALOG VERİ DİNLEYİCİSİ (EN ÜSTTE OLMALI) =====
// Bu listener, katalog sayfasından gelen postMessage verilerini yakalar
window.addEventListener('message', function(event) {
    // Güvenlik: Sadece bizim katalogdan gelen veriyi kabul et
    if (!event.data || event.data.source !== 'KATALOG_TRACKER') {
        return;
    }

    const data = event.data.payload;
    console.log("📥 Dashboard veriyi yakaladı:", data);

    // Dashboard henüz yüklenmemişse bekle
    if (!window.dashboard) {
        console.warn("⚠️ Dashboard henüz hazır değil, veri bekletiliyor...");
        // 500ms sonra tekrar dene
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
    // ===== HOT LEAD KONTROLÜ =====
    if (data.isHotLead || (data.action && data.action.includes('HOT LEAD'))) {
        console.log("🔥🔥🔥 HOT LEAD TESPİT EDİLDİ! 🔥🔥🔥");
        window.dashboard.showHotLeadAlert(data);
    }

    // 1. Canlı akış (Live Feed) kısmına ekleme yap
    const feedText = `${data.title}`;
    window.dashboard.addFeedItem(feedText, data.action || 'inceleniyor');

    // 2. Sayfa görüntülenme sayısını artır
    window.dashboard.data.incrementPageView(data.page);

    // 3. Grafikteki ilgili çubuğu yükselt
    const chartIndex = window.dashboard.data.findChartIndexByTitle(data.title);
    if (chartIndex !== -1) {
        window.dashboard.updateChart(chartIndex, 1);
    }

    // 4. Kullanıcı session tracking
    if (data.userId) {
        window.dashboard.data.userSessions.add(data.userId);
    }

    // 5. İstatistikleri güncelle
    window.dashboard.updateStats(
        window.dashboard.data.totalViews,
        window.dashboard.calculateAvgDepth(),
        window.dashboard.data.userSessions.size || 1
    );

    console.log("✅ Dashboard güncellendi!");
}

console.log("🎧 Katalog Listener aktif - KATALOG_TRACKER verisi bekleniyor...");

// Dashboard Data Management
class DashboardData {
    constructor() {
        this.totalViews = 26;
        this.avgDepth = 3.2;
        this.liveUsers = 2;
        this.feedItems = [];
        this.pageViews = {}; // Sayfa bazlı görüntülenme sayısı
        this.userSessions = new Set(); // Benzersiz kullanıcılar
        this.chartData = [
            { label: "20' DC", value: 5, pageNumber: null },
            { label: "40' HC", value: 8, pageNumber: null },
            { label: "Reefer", value: 3, pageNumber: null },
            { label: "Open Top", value: 6, pageNumber: null },
            { label: "Flat Rack", value: 4, pageNumber: null }
        ];
    }

    updateStats(views, depth, users) {
        this.totalViews = views;
        this.avgDepth = depth;
        this.liveUsers = users;
    }

    addFeedItem(page, action = "inceledi") {
        const timestamp = new Date();
        const item = {
            id: Date.now(),
            page: page,
            action: action,
            time: this.formatTime(timestamp)
        };

        this.feedItems.unshift(item);
        if (this.feedItems.length > 20) {
            this.feedItems.pop();
        }

        return item;
    }

    incrementPageView(pageNumber) {
        if (!this.pageViews[pageNumber]) {
            this.pageViews[pageNumber] = 0;
        }
        this.pageViews[pageNumber]++;
        this.totalViews++;
    }

    updateChartData(pageIndex, value) {
        if (pageIndex >= 0 && pageIndex < this.chartData.length) {
            this.chartData[pageIndex].value = value;
        }
    }

    // Sayfa numarasına göre chart'taki hangi kategoriye ait olduğunu bul
    findChartIndexByTitle(title) {
        const titleLower = title.toLowerCase();

        if (titleLower.includes("20") && titleLower.includes("dc")) return 0;
        if (titleLower.includes("40") && titleLower.includes("hc")) return 1;
        if (titleLower.includes("reefer") || titleLower.includes("soğutma")) return 2;
        if (titleLower.includes("open top") || titleLower.includes("açık üst")) return 3;
        if (titleLower.includes("flat rack") || titleLower.includes("düz")) return 4;

        return -1; // Kategorize edilemedi
    }

    formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
}

// Dashboard UI Controller
class DashboardUI {
    constructor() {
        this.data = new DashboardData();
        this.elements = {
            totalViews: document.getElementById('totalViews'),
            avgDepth: document.getElementById('avgDepth'),
            liveUsers: document.getElementById('liveUsers'),
            liveFeed: document.getElementById('liveFeed'),
            chartContainer: document.getElementById('chartContainer')
        };

        this.init();
    }

    init() {
        this.renderChart();
        this.setupRealDataListener(); // Gerçek veri dinleyicisi
        this.updateStatsDisplay(); // İlk render
        this.addDemoFeedItems(); // Demo veriler
    }

    // Demo feed itemları ekle (başlangıçta görünür olsun)
    addDemoFeedItems() {
        this.addFeedItem("20' DC Konteyner", "inceledi");
        setTimeout(() => this.addFeedItem("40' HC Konteyner", "inceledi"), 1000);
        setTimeout(() => this.addFeedItem("Reefer Konteyner", "inceledi"), 2000);
    }

    // Update stat cards with animation
    updateStats(views, depth, users) {
        this.animateValue(this.elements.totalViews, this.data.totalViews, views, 800);
        this.animateValue(this.elements.avgDepth, this.data.avgDepth, depth, 800);
        this.animateValue(this.elements.liveUsers, this.data.liveUsers, users, 800);

        this.data.updateStats(views, depth, users);
    }

    updateStatsDisplay() {
        this.elements.totalViews.textContent = this.data.totalViews.toLocaleString('tr-TR');
        this.elements.avgDepth.textContent = this.data.avgDepth.toFixed(1);
        this.elements.liveUsers.textContent = this.data.liveUsers;
    }

    animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }

            if (element === this.elements.avgDepth) {
                element.textContent = current.toFixed(1);
            } else {
                element.textContent = Math.round(current).toLocaleString('tr-TR');
            }
        }, 16);
    }

    // Add item to live feed
    addFeedItem(page, action = "inceledi") {
        const item = this.data.addFeedItem(page, action);

        const feedElement = document.createElement('div');
        feedElement.className = 'feed-item';
        feedElement.innerHTML = `
            <div class="feed-item-header">
                <span class="feed-item-time">${item.time}</span>
            </div>
            <div class="feed-item-text">
                Az önce bir kullanıcı <span class="feed-item-page">${item.page}</span> ${item.action}
            </div>
        `;

        this.elements.liveFeed.insertBefore(feedElement, this.elements.liveFeed.firstChild);

        // Remove excess items
        while (this.elements.liveFeed.children.length > 20) {
            this.elements.liveFeed.removeChild(this.elements.liveFeed.lastChild);
        }
    }

    // Render chart
    renderChart() {
        this.elements.chartContainer.innerHTML = '';

        const maxValue = Math.max(...this.data.chartData.map(d => d.value), 1);

        this.data.chartData.forEach(item => {
            const barContainer = document.createElement('div');
            barContainer.className = 'chart-bar';

            const heightPercent = (item.value / maxValue) * 100;

            barContainer.innerHTML = `
                <div class="bar-wrapper">
                    <div class="bar" style="height: ${heightPercent}%">
                        <span class="bar-value">${item.value}</span>
                    </div>
                </div>
                <div class="bar-label">${item.label}</div>
            `;

            this.elements.chartContainer.appendChild(barContainer);
        });
    }

    // Update chart data and re-render
    updateChart(pageIndex, increment = 1) {
        if (pageIndex >= 0 && pageIndex < this.data.chartData.length) {
            this.data.chartData[pageIndex].value += increment;
            this.renderChart();
        }
    }

    // ===== HOT LEAD ALERT SİSTEMİ =====
    showHotLeadAlert(data) {
        // Ses çal (tarayıcı izin verirse)
        this.playAlertSound();

        // Ekranda büyük bir uyarı göster
        const alert = document.createElement('div');
        alert.className = 'hot-lead-alert';
        alert.innerHTML = `
            <div class="hot-lead-content">
                <div class="hot-lead-icon">🔥</div>
                <div class="hot-lead-title">HOT LEAD TESPİT EDİLDİ!</div>
                <div class="hot-lead-product">${data.title}</div>
                <div class="hot-lead-time">${data.timestamp}</div>
                <button class="hot-lead-close">Kapat</button>
            </div>
        `;

        document.body.appendChild(alert);

        // Otomatik kapanma - 10 saniye
        const autoCloseTimer = setTimeout(() => {
            alert.remove();
        }, 10000);

        // Manuel kapama
        alert.querySelector('.hot-lead-close').addEventListener('click', () => {
            clearTimeout(autoCloseTimer);
            alert.remove();
        });

        // Feed'e özel vurgu ile ekle
        this.addFeedItem(`🔥 HOT LEAD: ${data.title}`, '10 saniye baktı!');
    }

    // Uyarı sesi çal
    playAlertSound() {
        try {
            // Web Audio API ile basit beep sesi
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800; // 800Hz
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2); // 200ms beep
        } catch (e) {
            console.log('Ses çalınamadı (izin yok):', e);
        }
    }

    // Manuel API çağrıları için backup listener (eski sistem uyumluluğu)
    setupRealDataListener() {
        window.addEventListener('message', (event) => {
            // Manuel API çağrıları için eski sistem de çalışsın
            if (event.data.type === 'stats') {
                this.updateStats(event.data.totalViews, event.data.avgDepth, event.data.liveUsers);
            } else if (event.data.type === 'feed') {
                this.addFeedItem(event.data.page, event.data.action);
            } else if (event.data.type === 'chart') {
                this.updateChart(event.data.pageIndex, event.data.value);
            }
        });

        console.log('✅ Dashboard hazır - Manuel API ve KATALOG_TRACKER dinleniyor...');
    }

    // Ortalama okuma derinliğini hesapla
    calculateAvgDepth() {
        const totalPages = Object.keys(this.data.pageViews).length;
        if (totalPages === 0 || this.data.totalViews === 0) return 0;

        return (this.data.totalViews / totalPages).toFixed(1);
    }
}

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dashboard = new DashboardUI();
    });
} else {
    window.dashboard = new DashboardUI();
}

// Expose API for external control (backward compatibility)
window.DashboardAPI = {
    updateStats: (views, depth, users) => {
        if (window.dashboard) {
            window.dashboard.updateStats(views, depth, users);
        }
    },
    addFeedItem: (page, action) => {
        if (window.dashboard) {
            window.dashboard.addFeedItem(page, action);
        }
    },
    updateChart: (pageIndex, value) => {
        if (window.dashboard) {
            window.dashboard.updateChart(pageIndex, value);
        }
    }
};
