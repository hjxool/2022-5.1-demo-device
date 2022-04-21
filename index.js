let config = new Vue({
	el: '#config',
	data: {
		menu_select: 1, //导航栏选中目标
		page_loading: false, //页面加载时遮罩
	},
	methods: {
		// 传递选中索引
		menuSelected: function (index, path) {
			this.menu_select = Number(path[0]);
		},
	},
});
