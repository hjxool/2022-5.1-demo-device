let config = new Vue({
	el: '#config',
	data: {
		static_param: {
			menu_select: 1, //导航栏选中目标
			page_loading: false, //页面加载时遮罩
			first_load: true, //第一次加载显示统计图
		},
	},
	methods: {
		// 传递选中索引
		menuSelected: function (index, path) {
			this.static_param.menu_select = Number(path[0]);
		},
	},
});
