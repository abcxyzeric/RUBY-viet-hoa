// src/i18n/index.js - Trình quản lý i18n cho Extension RUBY
import { VI_DICT, VI_PATTERNS } from './vi.js';

const STORAGE_KEY = 'ruby_analyzer_lang';
let currentLang = 'vi';

try {
    currentLang = localStorage.getItem(STORAGE_KEY) || 'vi';
} catch {
    currentLang = 'vi';
}

export function getLang() {
    return currentLang;
}

export function setLang(lang) {
    currentLang = lang === 'zh' ? 'zh' : 'vi';
    try {
        localStorage.setItem(STORAGE_KEY, currentLang);
    } catch {}
    
    // Cập nhật lại nút ngôn ngữ và quét dịch lại toàn bộ giao diện
    updateSwitcherButton();
    const panel = document.getElementById('ruby_analyzer_panel');
    if (panel) translateDom(panel);
    const settings = document.getElementById('ruby_analyzer_ext_settings');
    if (settings) translateDom(settings);
}

export function toggleLang() {
    setLang(currentLang === 'vi' ? 'zh' : 'vi');
}

// Sắp xếp các cụm từ theo độ dài giảm dần để dịch các cụm dài trước, tránh nuốt từ
const PHRASE_LIST = Object.entries(VI_DICT)
    .filter(([k]) => /[\u4e00-\u9fff]/.test(k) && k.length > 1)
    .sort((a, b) => b[0].length - a[0].length);

/**
 * Hàm dịch văn bản (dùng cho cả text node và thông báo notify)
 */
export function t(text) {
    if (!text || typeof text !== 'string') return text;
    if (currentLang === 'zh') return text;

    const trimmed = text.trim();
    if (VI_DICT[trimmed]) {
        return text.replace(trimmed, VI_DICT[trimmed]);
    }

    // Kiểm tra các mẫu regex động
    let result = text;
    let matched = false;
    for (const [pattern, replacement] of VI_PATTERNS) {
        if (pattern.test(result)) {
            result = result.replace(pattern, replacement);
            matched = true;
        }
    }

    // Nếu vẫn còn chữ Hán, thử thay thế các cụm từ trong từ điển theo thứ tự ưu tiên độ dài
    if (/[\u4e00-\u9fff]/.test(result)) {
        for (const [zh, vi] of PHRASE_LIST) {
            if (result.includes(zh)) {
                result = result.replaceAll(zh, vi);
                matched = true;
                if (!/[\u4e00-\u9fff]/.test(result)) break;
            }
        }
    }

    return matched ? result : text;
}

/**
 * Quét và dịch toàn bộ phần tử DOM
 */
export function translateDom(root) {
    if (!root || currentLang === 'zh') return;

    const walk = (node) => {
        // Bỏ qua thẻ script, style, code editor
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toUpperCase();
            if (tag === 'SCRIPT' || tag === 'STYLE') return;

            // Dịch các thuộc tính
            const attrs = ['placeholder', 'title', 'data-tip', 'data-help', 'aria-label'];
            for (const attr of attrs) {
                if (node.hasAttribute(attr)) {
                    const original = node.getAttribute(attr);
                    const translated = t(original);
                    if (translated !== original) {
                        node.setAttribute(attr, translated);
                    }
                }
            }

            // Dịch value của input nếu là văn bản chữ Hán (ví dụ: '默认方案')
            if (tag === 'INPUT' && node.value && /[\u4e00-\u9fff]/.test(node.value)) {
                const translated = t(node.value);
                if (translated !== node.value) {
                    node.value = translated;
                }
            }
        }

        if (node.nodeType === Node.TEXT_NODE) {
            const val = node.nodeValue;
            if (val && /[\u4e00-\u9fff]/.test(val)) {
                const translated = t(val);
                if (translated !== val) {
                    node.nodeValue = translated;
                }
            }
            return;
        }

        for (let child = node.firstChild; child; child = child.nextSibling) {
            walk(child);
        }
    };

    walk(root);
}

/**
 * Cài đặt MutationObserver để tự động dịch khi giao diện render lại các thành phần con
 */
let panelObserver = null;
export function setupObserver(targetElement) {
    if (!targetElement || panelObserver) return;

    panelObserver = new MutationObserver((mutations) => {
        if (currentLang === 'zh') return;
        panelObserver.disconnect();
        try {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        translateDom(node);
                    }
                } else if (mutation.type === 'characterData') {
                    translateDom(mutation.target);
                }
            }
        } finally {
            panelObserver.observe(targetElement, { childList: true, subtree: true, characterData: true });
        }
    });

    panelObserver.observe(targetElement, { childList: true, subtree: true, characterData: true });
}

function updateSwitcherButton() {
    const btn = document.getElementById('ra_lang_toggle');
    if (btn) {
        btn.textContent = currentLang === 'vi' ? '🇻🇳 VI' : '🇨🇳 ZH';
        btn.title = currentLang === 'vi' ? 'Đang dùng Tiếng Việt (Bấm để đổi sang Tiếng Trung)' : '当前为中文 (点击切换为越南语)';
    }
}

/**
 * Gắn nút chuyển đổi ngôn ngữ vào thanh tiêu đề
 */
export function injectLanguageSwitcher(headerContainer) {
    if (!headerContainer || document.getElementById('ra_lang_toggle')) return;

    const btn = document.createElement('button');
    btn.id = 'ra_lang_toggle';
    btn.className = 'close-btn';
    btn.style.marginLeft = '4px';
    btn.style.fontSize = '12px';
    btn.style.fontWeight = 'bold';
    btn.addEventListener('click', () => {
        toggleLang();
    });

    headerContainer.insertBefore(btn, headerContainer.firstChild);
    updateSwitcherButton();
}
