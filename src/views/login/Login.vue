<template>
	<div class="login">
		&nbsp;
		<div class="login-box">
			<div class="login-logo">
				<a href="#">
					<b>iControl</b>
				</a>
			</div>
			<div class="login-box-body">
				<div class="logo">
					<img src="../../assets/icons/logo.png" />
					<p></p>
					<span class="project">演示系统</span>
				</div>
				<el-input placeholder="用户" suffix-icon="el-icon-user" v-model="username"></el-input>
				<p></p>
				<el-input placeholder="密码" suffix-icon="el-icon-lock" v-model="password" show-password></el-input>
				<p></p>
				<el-row type="flex" class="row-bg" justify="end">
					<el-button
						@click="login"
						type="primary"
						
						:loading="loading"
					>登&nbsp;&nbsp;&nbsp;&nbsp;陆</el-button>
				</el-row>
			</div>
		</div>
	</div>
</template>

<script>
import md5 from "js-md5";
//import TWEEN from "@tweenjs/tween.js";

export default {
	name: "Login",
	data() {
		return {
			loading: false,
			username: "",
			password: ""
		};
	},
	methods: {
		login() {
			let username = this.username;
			let password = md5(this.password); //md5加密
			//调用actions,注意store做了模块化，所以action之前要加模块名称
			this.loading = true;
			this.$store
				.dispatch("uv/login", {
					username: username,
					password: password
				})
				.then(() => {
					this.loading = false;
					this.$router.push({
						name: "Dashboard" //注意这里不是路由的path，而是要用路由的name
						// params: { user: username, password: password }
					});
				})
				.catch(error => {
					this.loading = false;
					console.info(error);
				});
		},
		//测试tweenjs
		// animate() {
		// 	requestAnimationFrame(this.animate);
		// 	TWEEN.update(); //调用所有的tween对象
		// }
	},
	mounted() {
		// this.animate(); //启动tween动画
		// //构建一个tween实例对象
		// new TWEEN.Tween({ x: 100 })
		// 	.to({ x: 1000 }, 2000)
		// 	.easing(TWEEN.Easing.Linear.None)
		// 	.onUpdate(object => {
		// 		console.info(object);
		// 	})
        // 	.start();
	}
};
</script>

<style scoped>
.login {
	background: #d2d6de;
	height: 100%;
	width: 100%;
}
.login-box {
	position: absolute;
	left: 50%;
	top: 50%;
	margin: -300px 0 0 -180px; /*50%为自身尺寸的一半*/
	width: 360px;
	/* margin: 10% auto; */
}
.login-logo {
	font-size: 35px;
	text-align: center;
	margin-bottom: 25px;
}
.login-logo a {
	color: #444;
}
.login-box-body {
	background: rgba(255, 255, 255, 0.5);
	padding: 20px;
	border-top: 0;
	color: #666;
	border-radius: 10px;
}
.logo {
	text-align: center;
	width: calc(73% + 2px);
	margin-left: 10%;
	margin-bottom: 5px;
}
.logo .project {
	display: block;
	width: 100%;
	height: 30px;
	font-size: 18px;
}
</style>
