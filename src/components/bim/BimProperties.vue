<template>
	<x-drag-panel :bindObj="panel">
		<table>
			<tr>
				<th width="40%">名称</th>
				<th width="60%">值</th>
			</tr>
            <!--属性-->
            <template v-if="curProperty!=null">
                <!--vue遍历Object属性-->
                <tr v-for="(value, key) in curProperty.gens">
                    <td>{{key}}</td>
                    <td>{{value}}</td>
                </tr>
                <template v-for="(pv, pk) in curProperty.properties">
                    <tr>
                        <td colspan="2" class="group">{{pk}}</td>
                    </tr>
                    <tr v-for="(piv, pik) in pv">
                        <td>{{pik}}</td><td>{{piv}}</td>
                    </tr>
                </template>
            </template>
            <!--材质-->
            <template v-if="curMaterials!=null">
                <tr>
                    <td colspan="2" class="group">材质</td>
                </tr>
                <!--双重循环-->
                <template v-for="(value, key) in curMaterials.materials">
                     <tr v-for="(item,index) in value">
                        <td colspan="2">{{item}}</td>
                    </tr>
                </template>
            </template>
		</table>
	</x-drag-panel>
</template>
<script>
import XDragPanel from "@/components/Controls/XDragPanel";
import bimAxios from "@/utils/requestBim";
export default {
	name: "BimProperties",
	components: { XDragPanel },
	data() {
		return {
			panel: {
				visiable: true,
                title: "构件属性",
                icon:"el-icon-picture-outline",
				color: "box box-primary",
				width: "360px",
				height: document.body.clientHeight - 250 + "px",
				top: "40px",
                right: "40px",
                zIndex:1
            },
            propertiesMap:new Map(),
            materialsMap:new Map(),
            curProperty:null,//当前属性
            curMaterials:null //当前材质
		};
    },
    methods:{
        getFile(propertiesFile,materialsFile) {
            if (propertiesFile != null && propertiesFile !== "") 
            {
                bimAxios.get("/",{ params: {action:"getFile",fileName:propertiesFile} }).then(data=>{
                    this.propertiesMap.clear();
                    data.forEach(item => {
                        let key = item.entityId;
                        let value = item;
                        this.propertiesMap.set(key,value);
                    });
                    //初始化当前构件材质
                    this.curMaterials = null;
                })
                .catch(error => {
                });
            }
            if (materialsFile != null && materialsFile !== "") 
            {
                bimAxios.get("/",{ params: {action:"getFile",fileName:materialsFile} }).then(data=>{
                    this.materialsMap.clear();
                    data.forEach(item => {
                        let key = item.entityId;
                        let value = item;
                        this.materialsMap.set(key,value);
                    });
                    //初始化当前构件材质
                    this.curProperty = null;
                })
                .catch(error => {
                });
            }
        },
        setCurProperty(prodId){
            this.curProperty = this.propertiesMap.get(prodId);
            this.curMaterials = this.materialsMap.get(prodId);
        }
    },
    mounted() {
       
    }
};
</script>
<style scoped>
table {
	width: 100%;
	font-size: 12px;
	border-collapse: collapse;
	border-spacing: 0;
	border-left: 1px solid #888;
	border-top: 1px solid #888;
}

table th,
table td {
	border-right: 1px solid #888;
	border-bottom: 1px solid #888;
	padding: 2px;
}

table th {
	font-weight: bold;
	/* background: #ccc; */
}
table .group{
    font-weight: bold;
	background: #e1e1e1;
}
</style>