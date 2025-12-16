import { Plugin } from 'vite';

/**
 * Vite 插件：为 HTML 中引用的资源添加时间戳，防止缓存
 */
export function htmlCacheBust(): Plugin {
  return {
    name: 'html-cache-bust',
    transformIndexHtml(html: string) {
      const timestamp = Date.now();
      // 为 JS 和 CSS 文件的引用添加时间戳查询参数
      return html.replace(
        /(src|href)="(\.\/assets\/[^"]+)"/g,
        `$1="$2?v=${timestamp}"`
      );
    },
  };
}
