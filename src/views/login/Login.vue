<template>
	<div class="login">
        <div class="loginbg"/>

		<div class="login-box">
			<div class="login-label">
				<a href="#">LETS OPS</a>
			</div>
			<div class="login-box-body">
				<div class="logo">
					
					<span class="project">登 陆</span>
				</div>
				<el-input placeholder="用户" suffix-icon="el-icon-user" v-model="username"></el-input>
				<p></p>
				<el-input placeholder="密码" suffix-icon="el-icon-lock" v-model="password" show-password></el-input>
				<p></p>
				<el-row type="flex" class="row-bg" justify="end">
                    <el-button icon="el-icon-right" size="medium" circle :loading="loading" @click="login"></el-button>
					<!-- <el-button
						@click="login"
						type="primary"
						:loading="loading"
					>登&nbsp;&nbsp;&nbsp;&nbsp;陆</el-button> -->
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
					
					this.$router.push({
						name: "Dashboard" //注意这里不是路由的path，而是要用路由的name
						// params: { user: username, password: password }
                    });
                    this.loading = false;
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
	left: 70%;
	top: 50%;
	margin: -160px 0 0 -160px; /*50%为自身尺寸的一半*/
	width: 320px;
	/* margin: 10% auto; */
}
.login-label {
	text-align: center;
	margin-bottom: 25px;
}
.login-label a {
    font-size: 35px;
    font-weight: 400;
	color: #fff;
}
.login-box-body {
	background: rgba(255, 255, 255, 0.2);
	padding: 20px;
	border-top: 0;
	color: #666;
	border-radius: 10px;
}
.logo {
	text-align: center;
	width: calc(73%);
	margin-left: 10%;
	margin-bottom: 5px;
}
.logo img{
    width: 200px;
    height: 200px;
}
.logo .project {
	display: block;
	width: 100%;
	height: 30px;
	font-size: 18px;
    font-weight: 500;
    color:#fff;
}
.loginbg {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color:  rgba(0, 0, 0, 0.8);
        background-image: url('../../assets/icons/loginbg.png');
        background-size: 100% 100%;
        background-repeat: no-repeat;
}
</style>
