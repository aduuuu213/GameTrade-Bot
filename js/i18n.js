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
        const savedLang = localStorage.getItem('preferred-lang');
        const browserLang = this.detectBrowserLanguage();
        const defaultLang = 'zh-CN';
        
        const initialLang = savedLang || 
                          (this.translations[browserLang] ? browserLang : defaultLang);
        
        await this.setLang(initialLang);
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