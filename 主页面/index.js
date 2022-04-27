let url = 'http://192.168.30.66:18113/';
let sys_power_url = url + 'api/ake/sequenceSwitch';
let sound_box_url = url + 'api/room/loudspeakerBoxLocationControl';
let video_out_url = url + 'api/room/hdMatrixControl';
let camera_ctrl_url = url + 'api/room/cameraLocationControl';
let get_before_mix_url = url + 'api/gds/getBeforeMixingInfo';
let before_mix_ctrl_url = url + 'api/gds/beforeMixingControl';
let tv_meeting_ctrl_url = url + 'api/room/videoConferenceControl';

let config = new Vue({
	el: '#config',
	data: {
		loginToken: '',
		userName: '',
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
			camera_list: ['A1', 'A2', 'A3'],
			camera_select: 0, //选中的摄像机位
		},
		temp: {
			changsuo_list: ['会议室1', '会议室2'],
		},
	},
	mounted() {
		if (!location.search) {
			this.loginToken = window.sessionStorage.loginToken;
			this.userName = window.sessionStorage.userName;
		} else {
			this.get_token();
		}
		this.request('post', get_before_mix_url, { device_id: '0x333333333333333333000000' }, '74935343174538', this.loginToken, (res) => {
			this.static_param.mute_device.forEach((e, index) => {
				// 提前准备好的属性在合并和依然具有响应性
				Object.assign(e, res.data.data[index]);
			});
		});
		// this.request('post', `http://192.168.30.200:9201/api-auth/oauth/user/token`, { username: 'dasd', password: '1231231' }, '23123', this.loginToken, (res) => {
		// 	console.log(res);
		// });
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
			if (this.static_param.sys_power == 0) {
				this.static_param.sys_power = 1;
			} else {
				this.static_param.sys_power = 0;
			}
			this.request('post', sys_power_url, { device_id: '20210628_141157_2446121203218804', sequence_switch: this.static_param.sys_power }, '55555', this.loginToken, () => {
				if (this.static_param.sys_power == 0) {
					this.static_param.ban = true;
				} else {
					this.static_param.ban = false;
				}
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
					this.request('post', video_out_url, { device_id: '0x021100000000000000000000', input_no: this.static_param.video_source_checked + 1, output_no: this.static_param.video_out_checked + 1 }, '123456', this.loginToken, () => {});
				} else {
					this.$message.warning('请先选择输出信号');
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
		mute(obj) {
			if (obj.mute == 0) {
				obj.mute = 1;
			} else {
				obj.mute = 0;
			}
			let input = [
				{
					channel_no: obj.channel_no,
					reverse_phase: obj.reverse_phase,
					gain: obj.gain,
					mute: obj.mute,
				},
			];
			this.request('post', before_mix_ctrl_url, { device_id: '0x333333333333333333000000', input: input }, '123456', this.loginToken, () => {});
		},
		increase_gain(obj) {
			obj.gain = Math.floor(obj.gain) + 10;
			let input = [
				{
					channel_no: obj.channel_no,
					reverse_phase: obj.reverse_phase,
					gain: obj.gain,
					mute: obj.mute,
				},
			];
			this.request('post', before_mix_ctrl_url, { device_id: '0x333333333333333333000000', input: input }, '123456', this.loginToken, () => {});
		},
		decrease_gain(obj) {
			obj.gain = Math.floor(obj.gain) - 10;
			let input = [
				{
					channel_no: obj.channel_no,
					reverse_phase: obj.reverse_phase,
					gain: obj.gain,
					mute: obj.mute,
				},
			];
			this.request('post', before_mix_ctrl_url, { device_id: '0x333333333333333333000000', input: input }, '123456', this.loginToken, () => {});
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
			this.request('post', camera_ctrl_url, { device_id: '0x085700000000000000000000', type: type, name: name }, '123456', this.loginToken, (res) => {
				if (res.data.code == 1000) {
					setTimeout(() => {
						this.request('post', camera_ctrl_url, { device_id: '0x085700000000000000000000', type: 4, name: name }, '123456', this.loginToken, () => {});
					}, 1000);
				}
			});
		},
		// 音箱位置
		sound_box_ctrl(type) {
			this.request('post', sound_box_url, { device_id: '0x098500000000000000000000', type: type }, '123456', this.loginToken, () => {});
		},
		// 视频会议
		tv_meeting(type) {
			this.request('post', tv_meeting_ctrl_url, { device_id: '0x13140108B27F000000000000', type: type }, '123456', this.loginToken, () => {});
		},
	},
});
