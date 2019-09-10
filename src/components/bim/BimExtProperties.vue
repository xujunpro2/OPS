<template>
	<x-drag-panel :bindObj="panel">
		<table ref="table" @click="onRowClick">
			<tr>
				<th width="30%">名称</th>
				<th width="70%">值</th>
			</tr>
            <tr v-for="(item, index) in extData" :id="item.extId">
                <td>{{item.pName}}</td><td>{{item.pValue}}</td>
            </tr>
		</table>
        <el-row type="flex" justify="end" style="margin:5px">
            <el-button type="text">添加</el-button>
            <el-button type="text">修改</el-button>
            <el-button type="text" style="color:#F56C6C" @click="onBtnDelete">删除</el-button>      
        </el-row>
	</x-drag-panel>
</template>
<script>
import XDragPanel from "@/components/Controls/XDragPanel";
export default {
	name: "BimExtProperties",
	components: { XDragPanel },
	data() {
		return {
			panel: {
				visiable: true,
                title: "扩展属性",
                icon:"el-icon-picture-outline-round",
				color: "box box-primary",
				width: "360px",
				height: "300px",
				top: "40px",
                left: "40px",
                zIndex:1
            },
            curRowId:null,
            extData:[
                {id:"ddddd",name:"物资编码",value:"G11022-20191011-00233"},
                {id:"sssss",name:"入库时间",value:"2019-10-11"}
            ]
		};
    },
    methods:{
        getExtProperties(bimId){
            console.info(bimId);
            this.$store.dispatch("ifc/getExtProperties",bimId).then(data => {
                this.extData = data;
                console.info(data);
            });
        },
        onRowClick(event){
            //恢复默认
            this.curRowId = null;
            let trNodes = this.$refs.table.childNodes;
            trNodes.forEach(tr => {
                tr.style.background = "transparent";
                tr.style.color = "#606266";
            });
            //设置当前选择
            let nodeName = event.target.nodeName;
            if(nodeName === 'TD')
            {
                let tr = event.target.parentNode;
                tr.style.background = "#79bbff";
                tr.style.color = "#fff";
                this.curRowId = tr.id;
                //删除
                console.info(tr.id);
            }
        },
        onBtnDelete(){
            if(this.curRowId)
            {
                alert(this.curRowId)
            }
            
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
    color:#606266;
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