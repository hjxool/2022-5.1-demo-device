// 登陆页面
var login = new Vue({
	el: '#login',
	data: {
		userName: '', //用户名
		passWord: '', //密码
		loginToken: '', //登录密匙
		rememberPassword: false, //勾选框
	},
	created: function () {
		this.checkSelect();
	},
	methods: {
		// 获取密匙
		login: function () {
			var _this = this; //此时this指向的是vue对象
			// 发送请求
			axios({
				method: 'post',
				url: login_html_url,
				data: {
					client: 'PC',
					user: '',
					version: '1.0.1',
					data: {
						userName: _this.userName,
						password: _this.passWord,
					},
					key: '74935343174538',
				},
			})
				//箭头函数的父级是vue对象，所以这里直接用this指向的是window
				.then(function (res) {
					// 当登录失败，获取提示信息
					let tip = res.data.message;
					if (tip == 'success') {
						// 登陆成功自动存储密码
						_this.autoLoad();
						// 登陆成功就获取密匙
						let loginToken = res.data.data.token;
						//因为跳转页面已经是then之后的进程，所以跳转页面不会因为异步而获取不到token
						window.location.href = `./主页面/index.html?loginToken=${loginToken}&userName=${_this.userName}`;
						//同时将token存入sessionStorage
						window.sessionStorage.loginToken = loginToken;
						window.sessionStorage.userName = _this.userName;
					} else {
						_this.$message({
							type: 'error',
							message: tip,
						});
					}
				});
		},
		// 设置cookie
		setCookie: function (name, value, saveTime) {
			let date = new Date();
			date.setDate(date.getDate() + saveTime);
			// cookie是键值对的形式存储，expires是后面的时间戳
			document.cookie = name + '=' + value + ';expires=' + date;
		},
		// 获取cookie
		getCookie: function (name) {
			let reg = RegExp(name + '=([^;]+)'); //先匹配=，然后匹配除了；以外的其他字符，+一次或多次
			let arr = document.cookie.match(reg);
			if (arr) {
				return arr[1];
			} else {
				return '';
			}
		},
		// 删除cookie
		delCookie: function (name) {
			this.setCookie(name, null, -1);
		},
		// 检查是否存储了密码
		checkSelect: function () {
			// 因为此时已经以name=value的形式存入了cookie，所以就在cookie中找这个键值对
			if (this.getCookie('userName')) {
				this.userName = this.getCookie('userName');
			}
			if (this.getCookie('passWord')) {
				this.passWord = this.getCookie('passWord');
				this.rememberPassword = true;
			}
		},
		// 自动加载cookie
		autoLoad: function () {
			this.setCookie('userName', this.userName, 7);
			// 点击了登录按钮，如果勾选了记住密码则保存cookie
			if (!this.rememberPassword) {
				this.delCookie('passWord');
			} else {
				this.setCookie('passWord', this.passWord, 7);
			}
		},
	},
});
