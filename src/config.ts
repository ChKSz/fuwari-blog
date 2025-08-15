/**
 * ChKSz's Version
 * 2025/08/14
*/
import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "ChKSz Blog",
	subtitle: "Tech.",
	lang: "zh_CN", // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'th', 'vi'  语言选择
	themeColor: {
		hue: 200, // 主题颜色的默认色相，范围从0到360。例如：红色: 0, 青色: 200, 青绿色: 250, 粉色: 345  这是默认主题颜色
		fixed: true, // 为访问者隐藏主题颜色选择器
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png", // 相对于/src目录的路径。如果以'/'开头，则相对于/public目录
		position: "center", // 等同于object-position，仅支持'top'、'center'、'bottom'。默认为'center'
		credit: {
			enable: false, // 显示横幅图片的署名文本
			text: "", // 要显示的署名文本
			url: "", // (可选) 原始艺术作品或艺术家页面的URL链接
		},
	},
	toc: {
		enable: true, // 在文章右侧显示目录
		depth: 3, // 目录中显示的最大标题深度，范围从1到3
	},
	comments: {
		enable: true, // 启用或禁用评论系统
	},
	favicon: [
		{
			src: '/favicon/favicon-light-32.png', // favicon的路径，相对于/public目录
			theme: 'light', // 'light' 或 'dark'
			sizes: '32x32', // favicon的尺寸
		},
		{
			src: '/favicon/favicon-dark-32.png', // favicon的路径，相对于/public目录
			theme: 'dark', // 'light' 或 'dark'
			sizes: '32x32', // favicon的尺寸
		},
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "赞助",
			url: "/donate/", // 内部链接不应包含基本路径，因为它会自动添加
			external: false, // 显示外部链接图标并在新标签页中打开
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/logo.jpg", // 相对于/src目录的路径。如果以'/'开头，则相对于/public目录
	name: "ChKSz",
	bio: "Life is a maze /.",
	links: [
		{
			name: "X",
			icon: "fa6-brands:x-twitter", // 访问 https://icones.js.org/ 获取图标代码
			// 如果尚未包含相应的图标集，则需要安装它
			// `pnpm add @iconify-json/<icon-set-name>`
			url: "https://x.com/chksz0413",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/ChKSz",
		},
		{
			name: "Telegram",
			icon: "fa6-brands:telegram",
			url: "https://t.me/chksz0413",
		},
		{
                        name: 'Email',
                        icon: 'fa6-solid:envelope',
                        url: 'mailto:i@wzg.best',
                },
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// 注意：某些样式（如背景色）已被覆盖，请参见astro.config.mjs文件。
	// 请选择深色主题，因为此博客主题目前仅支持深色背景
	theme: "github-dark",
};
