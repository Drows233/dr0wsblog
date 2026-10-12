import type { SponsorConfig } from "../types/sponsorConfig";

export const sponsorConfig: SponsorConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// 打赏用途说明
	usage: "",

	// 是否显示打赏者列表
	showSponsorsList: true,

	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: true,

	// 是否在文章详情页底部显示打赏按钮
	showButtonInPost: true,

	// 打赏方式列表
	methods: [
		{
			name: "微信",
			icon: "fa7-brands:weixin",
			// 收款码图片路径（需要放在 public 目录下）
			qrCode: "/assets/images/sponsor/wechat.jpg",
			link: "",
			description: "使用 微信 扫码打赏",
			enabled: true,
		},
	],

	// 打赏者列表（可选）
	sponsors: [
		// 示例：已实名打赏者
		// {
		// 	name: "热心网友",
		// 	avatar: "",
		// 	amount: "¥50",
		// 	date: "2025-10-01",
		// },
	],
};
