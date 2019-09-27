<template>
	<div>
		<x-drag-panel :bindObj="panel">
			<table ref="table" @click="onRowClick">
				<tr>
					<th width="30%">名称</th>
					<th width="70%">值</th>
				</tr>
				<tr v-for="(item, index) in extData" :id="item.extId">
					<td>{{item.pName}}</td>
					<td>{{item.pValue}}</td>
				</tr>
			</table>
			<el-row type="flex" justify="end" style="margin:5px">
				<el-button type="text" @click="onBtnAdd">添加</el-button>
				<el-button type="text" @click="onBtnEdit">修改</el-button>
				<el-button type="text" style="color:#F56C6C" @click="onBtnDelete">删除</el-button>
			</el-row>
		</x-drag-panel>
		<el-dialog title="扩展属性编辑" :visible.sync="dialogVisible" width="30%" :close-on-click-modal="false">
			<el-form ref="form" :model="extForm" :rules="extFormRules" label-width="80px">
				<el-form-item label="属性名称" prop="pName">
					<el-input v-model="extForm.pName"></el-input>
				</el-form-item>
				<el-form-item label="属性值" prop="pValue">
					<el-input v-model="extForm.pValue"></el-input>
				</el-form-item>
			</el-form>

			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="onSubmit">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>
<script>
import XDragPanel from "@/components/Controls/XDragPanel";
export default {
	name: "BimExtProperties",
	components: { XDragPanel },
	data() {
		return {
            bimId: null,
            prodId:null,
			panel: {
				visiable: false,
				title: "扩展属性",
				icon: "el-icon-picture-outline-round",
				color: "box box-primary",
				width: "360px",
				height: "300px",
				top: "40px",
				left: "40px",
				zIndex: 1
			},
			curRowId: null,
			extData: [],
			isAdd: true, //是否是新增属性
			dialogVisible: false,
			extForm: { pName: null, pValue: null },
			//表单验证
			extFormRules: {
				pName: [
					{
						required: true,
						message: "请输入属性名称",
						trigger: "blur"
					}
				],
				pValue: [
					{ required: true, message: "请输入属性值", trigger: "blur" }
				]
			}
		};
	},
	methods: {
        setCurProperty(bimId,prodId){
            this.bimId = bimId;
            this.prodId = prodId;
            if(this.panel.visiable)
            {
                this.$store.dispatch("ifc/getExtProperties", {bimId:bimId,prodId:prodId}).then(data => {
                    this.extData = data;
                    this.restoreTable();
                });
            }
			
        },
		//Table行点击
		onRowClick(event) {
			this.restoreTable();
			//设置当前选择
			let nodeName = event.target.nodeName;
			if (nodeName === "TD") {
				let tr = event.target.parentNode;
				tr.style.background = "#79bbff";
				tr.style.color = "#fff";
				let key = tr.childNodes[0].innerText;
				let value = tr.childNodes[1].innerText;
				this.extForm = { pName: key, pValue: value };
				this.curRowId = tr.id;
			}
        },
        //新增或修改操作提交
		onSubmit() {
			this.$refs.form.validate(valid => {
				if (valid) {
					this.dialogVisible = false;
					//新增
                    if (this.isAdd) 
                    {
						let extProperties = {
							pName: this.extForm.pName,
							pValue: this.extForm.pValue,
                            bimId: this.bimId,
                            prodId:this.prodId,
							userId: this.$store.state.uv.userId
                        };
                        this.$store.dispatch("ifc/addExtProperties", extProperties).then(data => {
                            //刷新表格
                            this.setCurProperty(this.bimId,this.prodId);
                            this.$notify({
                                title: '消息',
                                message: '添加成功',
                                type: 'success',
                                duration:3000
                            });
                        });
                    }
                    //编辑
                    else
                    {
                        let extProperties = {
							pName: this.extForm.pName,
							pValue: this.extForm.pValue,
                            extId: this.curRowId,
							userId: this.$store.state.uv.userId
                        };
                        this.$store.dispatch("ifc/updateExtProperties", extProperties).then(data => {
                            //刷新表格
                            this.setCurProperty(this.bimId,this.prodId);
                            this.$notify({
                                title: '消息',
                                message: '修改成功',
                                type: 'success',
                                duration:3000
                            });
                        });
                    }
				}
			});
		},
		onBtnAdd() {
			this.extForm = { pName: null, pValue: null };
			this.isAdd = true;
			this.dialogVisible = true;
		},
		onBtnEdit() {
			this.isAdd = false;
			if (this.curRowId) {
				this.dialogVisible = true;
			} else {
				this.$alert("请先在表格上选择要编辑的属性行", "提示", {
					type: "warning"
				});
			}
		},
		//删除按钮
		onBtnDelete() {
			if (this.curRowId) {
                this.$confirm("确定删除该属性吗?", "提示", {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=>{
                    this.$store.dispatch("ifc/deleteExtProperties", this.curRowId).then(data => {
                        //刷新表格
                        this.setCurProperty(this.bimId,this.prodId);
                        this.$notify({
                            title: '消息',
                            message: '删除成功',
                            type: 'success',
                            duration:3000
                        });
                    });
                }).catch(() => {})
            }
            else{
                this.$alert("请先在表格上选择要删除的属性行", "提示", {
					type: "warning"
				});
            }
        },
        //在选择，修改，删除操作之后，都需要恢复table
        restoreTable(){
            //dialog中的当前属性条目编辑表单恢复默认
			this.extForm = { pName: null, pValue: null };
            this.curRowId = null;
            if(this.$refs.table.childNodes)
            {
                let trNodes = this.$refs.table.childNodes;
                trNodes.forEach(tr => {
                    tr.style.background = "transparent";
                    tr.style.color = "#606266";
                });
            }
        }
	},
	mounted() {}
};
</script>
<style scoped>
table {
	width: 100%;
	font-size: 12px;
	color: #606266;
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
table .group {
	font-weight: bold;
	background: #e1e1e1;
}
</style>