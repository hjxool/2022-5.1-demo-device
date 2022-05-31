let config = new Vue({
	el: '#config',
	data: {
		loginToken: '',
		userName: '',
		device_id: '',
		static_param: {
			menu_select: -1, //导航栏选中目标
			page_loading: false, //页面加载时遮罩
			first_load: true, //第一次加载显示统计图
			sys_power: 1, //系统开关
			ban: false, //开关关闭后禁用其他模块
			// 视频信号源
			video_source: ['前摄像头', '左摄像机', '右摄像机', '备用', '视频会议', '无线投屏器', '备用', '备用'],
			video_source_checked: -1,
			// 视频输出
			video_out: ['LED大屏', '视频会议辅流', '钉钉会议', '视频会议主流'],
			video_out_checked: -1,
			// 话筒 电脑 视频
			mute_device: [
				{ name: '会议话筒', mute: 0 },
				{ name: '电脑音量', mute: 0 },
				{ name: '视频会议', mute: 0 },
			],
			// 呼叫功能
			num_list: [
				{ name: '7', type: 7 },
				{ name: '8', type: 8 },
				{ name: '9', type: 9 },
				{ name: '0', type: 10 },
				{ name: '*', type: 11 },
				{ name: '#', type: 12 },
			],
			// 摄像机
			camera_list: ['前置摄像头', '右摄像头', '左摄像头'],
			camera_select: 0, //选中的摄像机位
			calender: '', //日期
			weekDay: '', //星期
			time: '', //当前时间
		},
		temp: {
			changsuo_list: ['二楼会议室', '报告厅', '四楼会议室', '圆桌会议室'],
		},
	},
	mounted() {
		if (!location.search) {
			this.loginToken = window.sessionStorage.loginToken;
			this.userName = window.sessionStorage.userName;
		} else {
			this.get_token();
		}
		this.get_time();
		this.timer = setInterval(this.get_time, 1000);
		// this.request('post', `http://192.168.30.200:9201/api-auth/oauth/user/token`, { username: 'dasd', password: '1231231' }, '23123', this.loginToken, (res) => {
		// 	console.log(res);
		// });
	},
	beforeDestroy() {
		clearInterval(this, timer);
	},
	methods: {
		// 获取地址栏token
		get_token() {
			let temp = location.search.substring(1).split('&');
			temp.forEach((e) => {
				if (e.indexOf('loginToken') != -1) {
					this.loginToken = e.split('=')[1];
					window.sessionStorage.loginToken = this.loginToken;
				} else if (e.indexOf('userName') != -1) {
					this.userName = e.split('=')[1];
					window.sessionStorage.userName = this.userName;
				}
			});
			let url = location.href.split('?')[0];
			history.replaceState('', '', url);
		},
		// 请求
		request(method, url, data, key, token, func) {
			axios({
				method: method,
				url: url,
				data: {
					client: 'PC',
					user: '',
					version: '1.0.1',
					data: data,
					key: key,
				},
				headers: { token: token },
				// client_id: 'webApp', client_secret: 'webApp', tenant_name: 'sdasd'
			}).then((res) => {
				if (res.data.code == 1000) {
					if (res.data.data) {
						func(res);
					} else {
						this.$message.error('数据为空');
					}
				} else {
					this.$alert(res.data.message, '提示', {
						confirmButtonText: '确定',
						callback: () => {
							if (res.data.code == 3005 || res.data.code == 3006) {
								window.location.href = '../index.html';
							}
						},
					});
				}
			});
		},
		// 跳转其他页面
		goto(index) {
			window.open(`../login-index-page/index.html?logintoken=${this.loginToken}&userName=this.userName`);
		},
		// 导航栏样式
		menu_item_style(index) {
			let style = {
				backgroundImage: this.static_param.menu_select == index ? 'url(./img/menu_light.png)' : 'url(./img/menu_dark.png)',
				color: this.static_param.menu_select == index ? 'rgba(213,234,249)' : 'rgba(213,234,249,0.5)',
			};
			return style;
		},
		//导航栏选中
		menu_select(index) {
			switch (index) {
				case 0:
					this.device_id = '0x12345622F955000000000000';
					break;
				case 1:
					this.device_id = '';
					break;
			}
			this.static_param.first_load = false;
			this.static_param.menu_select = index;
		},
		// 系统开关
		sys_power_style() {
			let style = {
				width: '38px',
				height: '38px',
				position: 'absolute',
				top: 'calc(50% - 19px)',
				zIndex: '1',
				left: this.static_param.sys_power == 1 ? '6px' : '56px',
				transition: 'all .3s',
			};
			return style;
		},
		sys_power_style2() {
			let style = {
				width: this.static_param.sys_power == 1 ? '70%' : '0%',
				height: '4px',
				background: 'linear-gradient(270deg, #108361, #1EBAB8)',
				position: 'absolute',
				top: 'calc(50% - 2px)',
				right: '16px',
				transition: 'all .3s',
			};
			return style;
		},
		// 开关电源同时显示遮罩禁用其他板块
		sys_power_switch() {
			this.static_param.sys_power = this.static_param.sys_power == 0 ? 1 : 0;
			this.request('post', sys_power_url, { device_id: this.device_id, power_status: this.static_param.sys_power }, '55555', this.loginToken, () => {
				this.static_param.ban = this.static_param.sys_power == 0 ? true : false;
			});
		},
		// 视频
		video_style(index) {
			let style = {
				fontSize: '14px',
				color: this.static_param.video_source_checked == index ? '#FFFFFF' : '#84D5FE',
			};
			return style;
		},
		video_style2(index) {
			let style = {
				fontSize: '14px',
				color: this.static_param.video_out_checked == index ? '#FFFFFF' : '#84D5FE',
			};
			return style;
		},
		// 选择输入信号才能选输出
		video_select(index, flag) {
			if (flag == 'in') {
				this.static_param.video_source_checked = index;
			} else {
				if (this.static_param.video_source_checked != -1) {
					this.static_param.video_out_checked = index;
					switch (this.static_param.video_source_checked) {
						case 0:
							this.request('post', video_out_url, { device_id: this.device_id, input_no: 4, output_no: this.static_param.video_out_checked + 1 }, '123456', this.loginToken, () => {});
							break;
						case 3:
							this.request('post', video_out_url, { device_id: this.device_id, input_no: 1, output_no: this.static_param.video_out_checked + 1 }, '123456', this.loginToken, () => {});
							break;
						default:
							this.request(
								'post',
								video_out_url,
								{ device_id: this.device_id, input_no: this.static_param.video_source_checked + 1, output_no: this.static_param.video_out_checked + 1 },
								'123456',
								this.loginToken,
								() => {}
							);
							break;
					}
				} else {
					this.$message.warning('请先选择输入信号');
				}
			}
		},
		// 静音
		mute_style(obj) {
			let style = {
				fontSize: '14px',
				color: obj.mute == 0 ? 'rgb(132, 213, 254)' : '#FAA9B6',
			};
			return style;
		},
		mute(obj, name) {
			let type;
			if (obj.mute == 0) {
				type = 2;
			} else {
				type = 3;
			}
			let channels;
			switch (name) {
				case '会议话筒':
					channels = [1, 2];
					break;
				case '电脑音量':
					channels = [3];
					break;
				case '视频会议':
					channels = [4];
					break;
			}
			this.request('post', volumeControl_url, { device_id: this.device_id, channels: channels, type: type }, '123456', this.loginToken, () => {
				if (obj.mute == 0) {
					obj.mute = 1;
				} else {
					obj.mute = 0;
				}
			});
		},
		increase_gain(name) {
			let type = 0;
			let channels;
			switch (name) {
				case '会议话筒':
					channels = [1, 2];
					break;
				case '电脑音量':
					channels = [3];
					break;
				case '视频会议':
					channels = [4];
					break;
			}
			this.request('post', volumeControl_url, { device_id: this.device_id, channels: channels, type: type }, '123456', this.loginToken, () => {});
		},
		decrease_gain(name) {
			let type = 1;
			let channels;
			switch (name) {
				case '会议话筒':
					channels = [1, 2];
					break;
				case '电脑音量':
					channels = [3];
					break;
				case '视频会议':
					channels = [4];
					break;
			}
			this.request('post', volumeControl_url, { device_id: this.device_id, channels: channels, type: type }, '123456', this.loginToken, () => {});
		},
		// 摄像机
		camera_style(index) {
			let style = {
				fontSize: '14px',
				color: this.static_param.camera_select == index ? '#FFFFFF' : '#84D5FE',
			};
			return style;
		},
		camera_ctrl(type) {
			let name = this.static_param.camera_list[this.static_param.camera_select];
			this.request('post', camera_ctrl_url, { device_id: this.device_id, type: type, name: name }, '123456', this.loginToken, (res) => {
				if (res.data.code == 1000) {
					setTimeout(() => {
						this.request('post', camera_ctrl_url, { device_id: this.device_id, type: 4, name: name }, '123456', this.loginToken, () => {});
					}, 1000);
				}
			});
		},
		// 音箱位置
		sound_box_ctrl(type) {
			this.request('post', sound_box_url, { device_id: this.device_id, type: type }, '123456', this.loginToken, () => {});
		},
		// 视频会议
		tv_meeting(type) {
			this.request('post', tv_meeting_ctrl_url, { device_id: this.device_id, type: type }, '123456', this.loginToken, () => {});
		},
		// 跳转中心平台
		jump_hscenter() {
			window.open(`http://182.150.116.22:10009/hscenter/index.html?loginToken=${this.loginToken}&userName=${this.userName}`);
		},
		// 获取时间
		get_time() {
			let date = new Date();
			function check(params) {
				let num = params < 10 ? `0${params}` : params;
				return num;
			}
			let year = date.getFullYear();
			let month = check(date.getMonth() + 1);
			let day = check(date.getDate());
			this.static_param.calender = `${year}.${month}.${day}`;

			let weeks = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
			let week = date.getDay();
			this.static_param.weekDay = weeks[week];

			let hour = check(date.getHours());
			let minute = check(date.getMinutes());
			let second = check(date.getSeconds());
			this.static_param.time = `${hour}:${minute}:${second}`;
		},
		// 全屏半屏
		scene_ctrl(scene_no) {
			this.request('post', scene_ctrl_url, { device_id: this.device_id, scene_no: scene_no }, '123456', this.loginToken, () => {});
		},
	},
});
