// 国际化配置
const i18n = {
    currentLang: 'zh-CN',
    translations: {},
    cache: new Map(),
    loadingStates: new Set(),
    
    // 初始化国际化
    async init() {
        try {
            // 添加加载状态
            this.addLoadingState();
            // 设置初始语言
            await this.setInitialLang();
            // 绑定语言切换事件
            this.bindLangChange();
            // 移除加载状态
            this.removeLoadingState();
        } catch (error) {
            this.handleError('国际化初始化失败', error);
        }
    },
    
    // 加载所有语言文件
    async loadTranslations() {
        const languages = ['zh-CN', 'en', 'ja'];
        const loadPromises = languages.map(lang => this.loadLanguageFile(lang));
        await Promise.all(loadPromises);
    },
    
    // 加载单个语言文件
    async loadLanguageFile(lang) {
        if (this.translations[lang]) return;
        
        try {
            // 检查缓存
            const cachedData = this.getFromCache(lang);
            if (cachedData) {
                this.translations[lang] = cachedData;
                return;
            }
            
            const response = await fetch(`i18n/${lang}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            this.translations[lang] = data;
            this.addToCache(lang, data);
        } catch (error) {
            this.handleError(`加载${lang}语言文件失败`, error);
        }
    },
    
    // 缓存相关方法
    addToCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    },
    
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        // 检查缓存是否过期（24小时）
        if (Date.now() - cached.timestamp > 24 * 60 * 60 * 1000) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    },
    
    // 设置初始语言
    async setInitialLang() {
        // 优先级：URL参数 > 本地存储 > 浏览器语言 > 默认语言
        const urlLang = this.getLangFromUrl();
        const savedLang = localStorage.getItem('preferred-lang');
        const browserLang = this.detectBrowserLanguage();
        const defaultLang = 'zh-CN';
        
        const initialLang = urlLang || savedLang || 
                          (this.translations[browserLang] ? browserLang : defaultLang);
        
        await this.setLang(initialLang);
    },
    
    // 从URL获取语言参数
    getLangFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
        const supportedLangs = ['zh-CN', 'en', 'ja'];
        
        if (langParam && supportedLangs.includes(langParam)) {
            return langParam;
        }
        
        return null;
    },
    
    // 检测浏览器语言
    detectBrowserLanguage() {
        const browserLang = navigator.language;
        const supportedLangs = ['zh-CN', 'en', 'ja'];
        
        // 检查完整语言代码
        if (supportedLangs.includes(browserLang)) {
            return browserLang;
        }
        
        // 检查语言代码前缀
        const langPrefix = browserLang.split('-')[0];
        if (supportedLangs.includes(langPrefix)) {
            return langPrefix;
        }
        
        return 'zh-CN';
    },
    
    // 设置语言
    async setLang(lang) {
        if (!this.translations[lang]) {
            await this.loadLanguageFile(lang);
        }
        
        if (!this.translations[lang]) return;
        
        // 添加过渡效果
        this.addTransitionEffect();
        
        this.currentLang = lang;
        document.documentElement.lang = lang;
        document.documentElement.setAttribute('data-lang', lang);
        localStorage.setItem('preferred-lang', lang);
        
        // 更新语言选择器
        const langSelect = document.getElementById('langSelect');
        if (langSelect) {
            langSelect.value = lang;
        }
        
        // 更新SEO meta标签
        this.updateSeoMeta();
        
        // 更新页面内容
        await this.updateContent();
        
        // 移除过渡效果
        this.removeTransitionEffect();
    },
    
    // 更新页面内容
    async updateContent() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        for (const element of elements) {
            const keys = element.getAttribute('data-i18n').split('.');
            let value = this.translations[this.currentLang];
            
            // 遍历键获取翻译值
            for (const key of keys) {
                value = value[key];
            }
            
            if (value) {
                await this.updateElement(element, value);
            }
        }
    },
    
    // 更新单个元素
    async updateElement(element, value) {
        if (element.tagName === 'INPUT') {
            element.placeholder = value;
        } else if (Array.isArray(value)) {
            // 处理列表项
            element.innerHTML = value.map(item => `<li>${item}</li>`).join('');
        } else {
            element.textContent = value;
        }
    },
    
    // 绑定语言切换事件
    bindLangChange() {
        const langSelect = document.getElementById('langSelect');
        if (langSelect) {
            langSelect.addEventListener('change', async (e) => {
                await this.setLang(e.target.value);
            });
        }
    },
    
    // 获取翻译文本
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            value = value[k];
        }
        
        return value || key;
    },
    
    // 更新SEO meta标签
    updateSeoMeta() {
        const seoData = this.translations[this.currentLang]?.seo;
        if (!seoData) return;
        
        // 更新title
        if (seoData.title) {
            document.title = seoData.title;
        }
        
        // 更新meta description
        this.updateMetaTag('name', 'description', seoData.description);
        
        // 更新meta keywords
        this.updateMetaTag('name', 'keywords', seoData.keywords);
        
        // 更新Open Graph标签
        this.updateMetaTag('property', 'og:title', seoData.ogTitle);
        this.updateMetaTag('property', 'og:description', seoData.ogDescription);
        this.updateMetaTag('property', 'og:locale', seoData.locale);
        
        // 更新Twitter Card标签
        this.updateMetaTag('name', 'twitter:title', seoData.ogTitle);
        this.updateMetaTag('name', 'twitter:description', seoData.ogDescription);
        
        // 更新结构化数据
        this.updateSchemaData(seoData);
        
        // 更新URL参数
        this.updateUrlLang();
    },
    
    // 更新meta标签
    updateMetaTag(attr, name, content) {
        if (!content) return;
        
        let meta = document.querySelector(`meta[${attr}="${name}"]`);
        if (meta) {
            meta.setAttribute('content', content);
        } else {
            meta = document.createElement('meta');
            meta.setAttribute(attr, name);
            meta.setAttribute('content', content);
            document.head.appendChild(meta);
        }
    },
    
    // 更新结构化数据
    updateSchemaData(seoData) {
        const schemaScript = document.getElementById('schema-data');
        if (!schemaScript) return;
        
        try {
            const schemaData = JSON.parse(schemaScript.textContent);
            schemaData.description = seoData.description;
            schemaData.inLanguage = this.currentLang;
            schemaScript.textContent = JSON.stringify(schemaData, null, 2);
        } catch (error) {
            console.error('更新结构化数据失败', error);
        }
    },
    
    // 更新URL语言参数
    updateUrlLang() {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', this.currentLang);
        
        // 更新浏览器历史记录，不刷新页面
        window.history.replaceState({}, '', url.toString());
    },
    
    // 错误处理
    handleError(message, error) {
        console.error(message, error);
        this.showErrorMessage(message);
    },
    
    // 显示错误消息
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    },
    
    // 加载状态管理
    addLoadingState() {
        document.body.classList.add('loading');
    },
    
    removeLoadingState() {
        document.body.classList.remove('loading');
    },
    
    // 过渡效果
    addTransitionEffect() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            element.classList.add('lang-transition', 'fade-out');
        });
    },
    
    removeTransitionEffect() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            element.classList.remove('fade-out');
            element.classList.add('fade-in');
            setTimeout(() => {
                element.classList.remove('lang-transition', 'fade-in');
            }, 300);
        });
    }
};

// 页面加载完成后初始化国际化
document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
});

// 导航栏滚动动画
let lastScroll = 0;
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        nav.classList.remove('nav-scrolled', 'nav-hidden');
        return;
    }
    
    if (currentScroll > lastScroll && !nav.classList.contains('nav-hidden')) {
        // 向下滚动
        nav.classList.add('nav-hidden');
        nav.classList.add('nav-scrolled');
    } else if (currentScroll < lastScroll && nav.classList.contains('nav-hidden')) {
        // 向上滚动
        nav.classList.remove('nav-hidden');
    }
    
    lastScroll = currentScroll;
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}); 