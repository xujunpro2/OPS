<template>
	<div>
		<div>VUE指令演示</div>
		<button @mouseenter="onEnter" @mouseleave="onOut" @click="onClick">点我</button>
		<div v-text="text"></div>
		<div v-html="html"></div>
		<div v-if="success">我学会了VUE</div>
		<div v-else>我还没有学会VUE</div>
		<div v-show="success">我展示我的VUE</div>

		<ul>
			<li v-for="(item,index) in citys">{{item.code}}:{{item.name}}</li>
		</ul>

		<!--for each-->
		<div v-for="item of citys" :key="item.code">{{item.name}}</div>

		<!--对象遍历-->
		<div v-for="(value, key) in student" :key="key">{{ key }} : {{ value }}</div>

         <!--使用style绑定局部样式 ,css名称要驼峰写法-->
         <!-- <div style="color:#0000ff">v-bind设置css</div> -->
        <div :style="{color:myColor}">v-bind设置css</div>
        <!--如果局部动态，可以将静态的部分定义class，动态部分v-bind到style上-->
        <p class="p2" :style="{color:myColor}">v-bind设置css</p>
        <!--动态class-->
        <p :class="{'p2':active}">12345</p>
        <!--多个class定义，其中有一个是动态使用，有一个静态使用-->
        <p :class="[{'activeClass':active},'staticClass']">12345</p>

        <!--public目录下的资源都不会被编译，直接使用-->
        <img src="images/test.png"></img>
        <!--src/assets目录下的图片不能直接用路径，而是通过import使用-->
         <img :src="myPic"></img>

        <!--双向绑定注意v-model不能用this.xxx-->
        <input v-model="message"/>
        <p>Message is: {{ message }}</p>
	</div>
</template>

<script>
import pic from "@/assets/images/pic.jpg";

export default {
	name: "Command",
	data() {
		return {
			text: "我是v-text",
			html: '<a href="#">v-html</a>',
			success: false,
			citys: [
				{ name: "上海", code: "020" },
				{ name: "南京", code: "025" }
			],
			student: { name: "Jack", age: 24 },
            myColor: "#0000ff",
            active:true,
            myPic:pic,
            message:'hello'
		};
	},
	methods: {
		onEnter() {
			console.info("onEnter");
		},
		onOut() {
			console.info("onOut");
		},
		onClick() {
			console.info("onClick");
		}
	},

	mounted() {
       
    },
	beforeDestroy() {}
};
</script>

<style scoped>
    .p2{
        font-size: 20px;
        font-weight: bold;
    }
    .staticClass{
        color: brown
    }
    .activeClass{
        font-size: 30px;
    }
</style>


