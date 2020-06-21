<template>
	<div class="login">
        <canvas id="cas"></canvas>
		&nbsp;
		<div class="login-box">
			<div class="login-label">
				<a href="#">LETS OPS</a>
			</div>
			<div class="login-box-body">
				<div class="logo">
					<img src="../../assets/icons/logo.png" />
					
					<span class="project">欢 迎</span>
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
		drawAnimateBackground(){
            var canvas = document.getElementById("cas");
            var ctx = canvas.getContext("2d");

            resize();
            window.onresize = resize;

            function resize() {
                canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            }

            var RAF = (function() {
                return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                    window.setTimeout(callback, 1000 / 60);
                    };
            })();

            // 鼠标活动时，获取鼠标坐标
            var warea = {x: null, y: null, max: 20000};
            window.onmousemove = function(e) {
                // e = e || window.event;

                // warea.x = e.clientX;
                // warea.y = e.clientY;
            };
            window.onmouseout = function(e) {
                warea.x = null;
                warea.y = null;
            };

            // 添加粒子
            // x，y为粒子坐标，xa, ya为粒子xy轴加速度，max为连线的最大距离
            var dots = [];
            for (var i = 0; i < 200; i++) {
                var x = Math.random() * canvas.width;
                var y = Math.random() * canvas.height;
                var xa = Math.random() * 2 - 1;
                var ya = Math.random() * 2 - 1;

                dots.push({
                x: x,
                y: y,
                xa: xa,
                ya: ya,
                max: 6000
                })
            }

            // 延迟100秒开始执行动画，如果立即执行有时位置计算会出错
            setTimeout(function() {
                animate();
            }, 100);

            // 每一帧循环的逻辑
            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // 将鼠标坐标添加进去，产生一个用于比对距离的点数组
                var ndots = [warea].concat(dots);

                dots.forEach(function(dot) {

                // 粒子位移
                dot.x += dot.xa;
                dot.y += dot.ya;

                // 遇到边界将加速度反向
                dot.xa *= (dot.x > canvas.width || dot.x < 0) ? -1 : 1;
                dot.ya *= (dot.y > canvas.height || dot.y < 0) ? -1 : 1;

                // 绘制点
                ctx.fillStyle="#ffffff";
                // ctx.arc(dot.x - 2.5, dot.y - 2.5,5,Math.PI*0,Math.PI*2,false);
                // ctx.closePath();
                // ctx.fill();
                ctx.fillRect(dot.x - 1.5, dot.y - 1.5, 3, 3);

                // 循环比对粒子间的距离
                for (var i = 0; i < ndots.length; i++) 
                {
                    var d2 = ndots[i];

                    if (dot === d2 || d2.x === null || d2.y === null) continue;

                    var xc = dot.x - d2.x;
                    var yc = dot.y - d2.y;

                    // 两个粒子之间的距离
                    var dis = xc * xc + yc * yc;

                    // 距离比
                    var ratio;

                    // 如果两个粒子之间的距离小于粒子对象的max值，则在两个粒子间画线
                    if (dis < d2.max) 
                    {

                        // 如果是鼠标，则让粒子向鼠标的位置移动
                        if (d2 === warea && dis > (d2.max / 2)) {
                            dot.x -= xc * 0.03;
                            dot.y -= yc * 0.03;
                        }

                        // 计算距离比
                        ratio = (d2.max - dis) / d2.max;

                        // 画线
                        ctx.beginPath();
                        ctx.lineWidth = ratio / 2;
                        ctx.strokeStyle = 'rgba(255,255,255,' + (ratio + 0.2) + ')';
                        ctx.moveTo(dot.x, dot.y);
                        ctx.lineTo(d2.x, d2.y);
                        ctx.stroke();
                    }
                }

                // 将已经计算过的粒子从数组中删除
                ndots.splice(ndots.indexOf(dot), 1);
                });

                RAF(animate);
            }
        },
	},
	mounted() {
		this.$nextTick(()=>{
            this.drawAnimateBackground();
        })
	}
};
</script>

<style scoped>
.login {
    overflow: hidden;
	background: #444444;
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

</style>
