// js/app.js - الإصدار المعدل للعمل بدون import
console.log("تحميل تطبيق المتجر...");

let allApps = [];
let currentFilter = 'all';
let visibleAppsCount = 5;
let currentDisplayedApps = [];

// بيانات تجريبية للاختبار
const sampleApps = [
    {
        id: '1',
        name: 'تطبيق التواصل الاجتماعي',
        description: 'تطبيق رائع للتواصل مع الأصدقاء والعائلة مع ميزات متقدمة مثل المراسلة الفورية ومشاركة الصور والفيديو والمحادثات الجماعية. يدعم اللغة العربية بشكل كامل ويتوافق مع جميع الأجهزة.',
        version: '1.0.0',
        size: '25',
        category: 'social',
        downloadURL: 'https://example.com/app1.zip',
        rating: 4.5,
        downloads: 1500,
        featured: true,
        trending: true,
        shareCount: 45,
        iconURL: '',
        createdAt: new Date('2024-03-15').toISOString(),
        updatedAt: new Date('2024-03-15').toISOString()
    },
    {
        id: '2',
        name: 'تطبيق الألعاب',
        description: 'ألعاب مسلية ومثيرة للجميع تحتوي على أكثر من 100 لعبة مختلفة. يشمل ألعاب الذكاء والألغاز والرياضة والسباقات. مناسب لجميع الأعمال مع واجهة مستخدم بديهية وسهلة الاستخدام.',
        version: '2.1.0',
        size: '45',
        category: 'games',
        downloadURL: 'https://example.com/app2.zip',
        rating: 4.2,
        downloads: 2300,
        trending: true,
        shareCount: 67,
        iconURL: '',
        createdAt: new Date('2024-03-14').toISOString(),
        updatedAt: new Date('2024-03-14').toISOString()
    },
    {
        id: '3',
        name: 'تطبيق الموسيقى',
        description: 'استمع إلى ملايين الأغاني والموسيقى من جميع أنحاء العالم. يدعم جميع الأنواع الموسيقية ويوفر تجربة استماع فريدة مع جودة صوت عالية.',
        version: '1.5.0',
        size: '35',
        category: 'entertainment',
        downloadURL: 'https://example.com/app3.zip',
        rating: 4.7,
        downloads: 3200,
        featured: true,
        shareCount: 89,
        iconURL: '',
        createdAt: new Date('2024-03-13').toISOString(),
        updatedAt: new Date('2024-03-13').toISOString()
    }
];

// تنسيق التاريخ والوقت للعرض
function formatDateTime(dateString) {
    if (!dateString) return 'غير محدد';
    try {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            calendar: 'gregory'
        };
        return date.toLocaleDateString('ar-SA', options);
    } catch (error) {
        return 'غير محدد';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    try {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            calendar: 'gregory'
        };
        return date.toLocaleDateString('ar-SA', options);
    } catch (error) {
        return 'غير محدد';
    }
}

// إنشاء رابط المشاركة
function generateShareLink(appId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?app=${appId}`;
}

// مشاركة التطبيق
async function shareApp(appId, appName) {
    const shareUrl = generateShareLink(appId);
    
    try {
        const app = allApps.find(a => a.id === appId);
        if (app) {
            app.shareCount = (app.shareCount || 0) + 1;
        }

        if (navigator.share) {
            await navigator.share({
                title: `تحميل ${appName}`,
                text: `اكتشف هذا التطبيق الرائع: ${appName}`,
                url: shareUrl,
            });
            showTempMessage('تم مشاركة التطبيق بنجاح!', 'success');
        } else {
            await navigator.clipboard.writeText(shareUrl);
            showTempMessage('تم نسخ رابط المشاركة إلى الحافظة!', 'success');
        }
        
        updateCurrentDisplay();
        
    } catch (error) {
        console.error('Error sharing app:', error);
        if (error.name !== 'AbortError') {
            // Fallback: فتح نافذة جديدة
            window.open(`https://twitter.com/intent/tweet?text=اكتشف هذا التطبيق الرائع: ${appName}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        }
    }
}

// تحميل التطبيقات من Firebase أو استخدام البيانات التجريبية
async function loadApps() {
    try {
        console.log("بدء تحميل التطبيقات...");
        
        const appsContainer = document.getElementById('apps-list');
        if (appsContainer) {
            appsContainer.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>جاري تحميل التطبيقات...</p></div>';
        }

        // محاولة التحميل من Firebase
        if (window.firebaseDb) {
            const querySnapshot = await firebaseDb.collection("apps").get();
            allApps = [];
            
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    allApps.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                console.log("تم تحميل التطبيقات من Firebase:", allApps.length);
            } else {
                allApps = sampleApps;
                console.log("تم استخدام البيانات التجريبية:", allApps.length);
            }
        } else {
            allApps = sampleApps;
            console.log("استخدام البيانات التجريبية (Firebase غير متوفر):", allApps.length);
        }
        
        // الترتيب: المميزة أولاً، ثم الشائعة، ثم المحدثة حديثاً
        allApps.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            
            if (a.trending && !b.trending) return -1;
            if (!a.trending && b.trending) return 1;
            
            const aDate = a.updatedAt || a.createdAt;
            const bDate = b.updatedAt || b.createdAt;
            return new Date(bDate) - new Date(aDate);
        });
        
        displayApps(allApps.slice(0, visibleAppsCount));
        setupLoadMoreButton();
        
    } catch (error) {
        console.error("خطأ في تحميل التطبيقات:", error);
        
        allApps = sampleApps;
        allApps.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            
            if (a.trending && !b.trending) return -1;
            if (!a.trending && b.trending) return 1;
            
            const aDate = a.updatedAt || a.createdAt;
            const bDate = b.updatedAt || b.createdAt;
            return new Date(bDate) - new Date(aDate);
        });
        
        displayApps(allApps.slice(0, visibleAppsCount));
        setupLoadMoreButton();
        
        const appsContainer = document.getElementById('apps-list');
        if (appsContainer) {
            appsContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>تم تحميل بيانات تجريبية للعرض</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }
}

// عرض التطبيقات الرئيسية
function displayApps(apps) {
    const appsContainer = document.getElementById('apps-list');
    currentDisplayedApps = apps;
    
    if (!appsContainer) {
        console.error("لم يتم العثور على عنصر apps-list");
        return;
    }
    
    if (apps.length === 0) {
        appsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>لا توجد تطبيقات متاحة</p></div>';
        return;
    }
    
    let html = '';
    apps.forEach((app) => {
        html += createAppCard(app);
    });
    
    appsContainer.innerHTML = html;
    setupDescriptionToggle();
    
    console.log("تم عرض التطبيقات الرئيسية:", apps.length);
}

// إنشاء بطاقة تطبيق
function createAppCard(app) {
    const iconClass = getAppIcon(app.category);
    const ratingStars = generateRatingStars(app.rating);
    
    const appIcon = app.iconURL 
        ? `<div class="app-icon"><img src="${app.iconURL}" alt="${app.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\\'${iconClass}\\'></i>'"></div>`
        : `<div class="app-icon"><i class="${iconClass}"></i></div>`;
    
    return `
        <div class="app-card" data-category="${app.category}" data-id="${app.id}">
            <div class="app-header">
                ${appIcon}
                <div class="app-info">
                    <h4>${app.name}</h4>
                    <div class="app-category">${getCategoryName(app.category)}</div>
                </div>
            </div>
            <div class="app-description-container">
                <p class="app-description">${app.description}</p>
                ${app.description && app.description.length > 100 ? '<span class="show-more">عرض المزيد</span>' : ''}
            </div>
            <div class="app-meta">
                <div class="app-version">الإصدار: ${app.version}</div>
                <div class="app-size">${app.size} MB</div>
            </div>
            <div class="app-meta">
                <div class="app-rating">
                    ${ratingStars}
                    <span>${app.rating || 'غير مقيم'}</span>
                </div>
                <div class="app-downloads">${app.downloads || 0} تنزيل</div>
            </div>
            <div class="app-date-info">
                <div class="date-item">
                    <i class="fas fa-calendar-plus"></i>
                    <span>أضيف في: ${formatDate(app.createdAt)}</span>
                </div>
            </div>
            ${app.featured ? '<div class="featured-badge">⭐ مميز</div>' : ''}
            ${app.trending ? '<div class="trending-badge">🔥 شائع</div>' : ''}
            <div class="app-actions">
                <button class="download-btn" onclick="downloadApp('${app.downloadURL}', '${app.id}')">
                    <i class="fas fa-download"></i>
                    تحميل
                </button>
                <button class="share-btn" onclick="shareApp('${app.id}', '${app.name}')">
                    <i class="fas fa-share-alt"></i>
                </button>
                ${isAdmin() ? `
                    <button class="delete-btn" onclick="deleteApp('${app.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// إعداد زر "عرض المزيد"
function setupLoadMoreButton() {
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (allApps.length > visibleAppsCount) {
        if (loadMoreContainer) loadMoreContainer.style.display = 'block';
        if (loadMoreBtn) loadMoreBtn.onclick = showMoreApps;
    } else {
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    }
}

// عرض المزيد من التطبيقات
function showMoreApps() {
    visibleAppsCount += 5;
    const appsToShow = currentFilter === 'all' 
        ? allApps.slice(0, visibleAppsCount)
        : allApps.filter(app => app.category === currentFilter).slice(0, visibleAppsCount);
    
    displayApps(appsToShow);
    setupLoadMoreButton();
}

// تحديث العرض الحالي
function updateCurrentDisplay() {
    if (currentDisplayedApps.length > 0) {
        displayApps(currentDisplayedApps);
    }
}

// إضافة مستمعات الأحداث لعرض المزيد
function setupDescriptionToggle() {
    document.querySelectorAll('.show-more').forEach(btn => {
        btn.addEventListener('click', function() {
            const description = this.previousElementSibling;
            if (description.classList.contains('expanded')) {
                description.classList.remove('expanded');
                this.textContent = 'عرض المزيد';
            } else {
                description.classList.add('expanded');
                this.textContent = 'عرض أقل';
            }
        });
    });
}

// توليد نجوم التقييم
function generateRatingStars(rating) {
    if (!rating) return '<span style="color: var(--text-light);">غير مقيم</span>';
    
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    for (let i = 0; i <
