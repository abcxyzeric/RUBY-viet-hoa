// src/i18n/index.js - Trình quản lý i18n cho Extension RUBY
import { VI_DICT, VI_PATTERNS, VI_HTML } from './vi.js';

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
    const panel = document.getElementById('ra_panel');
    if (panel) translateDom(panel);
    const settings = document.getElementById('ruby_analyzer_ext_settings');
    if (settings) translateDom(settings);
}

export function toggleLang() {
    setLang(currentLang === 'vi' ? 'zh' : 'vi');
}

export function normalizeStr(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/\s+/g, ' ').trim();
}

/**
 * Hàm dịch văn bản (cho chuỗi đơn hoặc thông báo toastr/notify)
 * Tuyệt đối KHÔNG dùng thay thế chuỗi con bừa bãi tránh lỗi chắp vá ngôn ngữ.
 */
export function t(text) {
    if (!text || typeof text !== 'string') return text;
    if (currentLang === 'zh') return text;

    const trimmed = text.trim();
    if (VI_DICT[trimmed]) {
        return text.replace(trimmed, VI_DICT[trimmed]);
    }
    if (VI_DICT[text]) {
        return VI_DICT[text];
    }

    const norm = normalizeStr(text);
    if (VI_DICT[norm]) {
        return VI_DICT[norm];
    }

    // Kiểm tra các mẫu regex động có cấu trúc
    for (const [pattern, replacement] of VI_PATTERNS) {
        if (pattern.test(text)) {
            return text.replace(pattern, replacement);
        }
    }

    return text;
}

/**
 * Quét và dịch toàn bộ phần tử DOM một cách an toàn và tự nhiên
 */
export function translateDom(root) {
    if (!root || currentLang === 'zh') return;

    const walk = (node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toUpperCase();

            // TUYỆT ĐỐI BỎ QUA các thành phần code, script, style và đặc biệt là prompt / textarea
            if (
                tag === 'SCRIPT' ||
                tag === 'STYLE' ||
                tag === 'TEXTAREA' ||
                tag === 'PRE' ||
                tag === 'CODE' ||
                node.classList?.contains('jb-content') ||
                node.classList?.contains('jb-summary-text') ||
                node.classList?.contains('prompt-content') ||
                node.closest?.('.jailbreak-body')
            ) {
                return;
            }

            // Kiểm tra dịch trọn vẹn khối HTML có cấu trúc (ví dụ: các khối tip, status-box chứa thẻ inline)
            if (node.children.length > 0 && VI_HTML) {
                const normHtml = normalizeStr(node.innerHTML);
                if (VI_HTML[normHtml]) {
                    node.innerHTML = VI_HTML[normHtml];
                    return; // Đã thay thế trọn khối HTML chuẩn xác, không duyệt tiếp vào các con
                }
            }

            // Dịch các thuộc tính hiển thị
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

            // Dịch giá trị mặc định của input nếu là văn bản giao diện chữ Hán (ví dụ: '默认方案')
            if (tag === 'INPUT' && node.value && /[\u4e00-\u9fff]/.test(node.value) && node.type !== 'file' && node.type !== 'checkbox' && node.type !== 'radio') {
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
