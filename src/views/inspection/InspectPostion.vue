<template>
	<div class="rootDiv">
        <el-row :gutter="3" style="height:100%" >
            <el-col :span="14" style="height:100%">
                <baidu-map class="map-view" :center="center" :zoom="zoom" @ready="onMapReady" scroll-wheel-zoom>
                    <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT"></bm-navigation>
                    <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']" anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-map-type>
                </baidu-map>
            </el-col>

            <el-col :span="10">
                <el-table  border :data="positions" highlight-current-row @current-change="onRowSelectedChange"  style="width: 100%;">
                    <el-table-column prop="positionName" label="位置名称"></el-table-column>
                    <el-table-column prop="lng" label="经度"></el-table-column>
                    <el-table-column prop="lat" label="纬度"></el-table-column>
                    <el-table-column prop="distanceRange" label="有效范围(米)"></el-table-column>
                    <el-table-column label="操作" width="160">
                        <template slot-scope="scope">
                            <el-button @click="onDelete(scope.row)" type="danger" icon="el-icon-delete" circle></el-button>
                            <el-button @click="onUpdate(scope.row)" icon="el-icon-edit" circle ></el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-row type="flex" justify="end" style="margin-top:5px">
                    <el-button type="primary" @click="onAdd()">新增</el-button>
                </el-row>
            </el-col>
        </el-row>
        <el-dialog title="工程位置"  :visible.sync="dialogVisible"   width="450px" :close-on-click-modal="false">
            <el-form ref="positionForm" :model="positionForm" :rules="positionFormRules"  label-width="80px" >
                <el-form-item label="位置名称" prop="positionName">
                    <el-input v-model="positionForm.positionName"></el-input>
                </el-form-item>
                <el-form-item label="位置坐标" prop="coord">
                    <el-input v-model="positionForm.coord">
                        <!-- <el-link slot="append" icon="el-icon-search" href="http://api.map.baidu.com/lbsapi/getpoint/index.html" target="_blank"></el-link> -->
                        <el-button slot="append"  icon="el-icon-search" @click="onOpenBaiduCoord"></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item label="有效范围">
                    <el-input-number v-model="positionForm.distanceRange"  :min="1" :max="500"></el-input-number>&nbsp;(米)
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="dialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onSubmit">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="坐标拾取"  :visible.sync="baiduDialogVisible"   width="1300px" :close-on-click-modal="false">
             <iframe id="frame" src="http://api.map.baidu.com/lbsapi/getpoint/index.html"  width="100%" height="500" frameborder="0"></iframe>
        </el-dialog>
    </div>
</template>

<script>
export default {
	name: "InspectPostion",
	data() {
		return {
            map:null,
            center: {lng: 0, lat: 0},
            zoom: 2,
            positions:[],
            markers:[],// 地图上的标记对象

            dialogVisible:false,
            curRow:null,
            positionForm:{
                positionId:null,
                positionName:null,
                coord:null,
                distanceRange:20,
            },
            positionFormRules:{
                positionName: [
                    { required: true, message: '请输入位置名称', trigger: 'blur' }
                ],
                coord: [
                    { required: true, message: '请输入位置坐标', trigger: 'blur' }
                ]
            },

            baiduDialogVisible:false,//百度地图坐标拾取对话框
        }
	},
	methods: {
        onMapReady({BMap, map}){
            this.map = map;
            this.map.disableDoubleClickZoom();
            this.getPostions();
        },
        getPostions(){
            this.$store.dispatch('insp/positions').then(data=>{
                this.positions = data;
                this.clearMarkers();
                if(this.positions.length > 0)
                {
                    //以第一个位置点为center
                    let lng = this.positions[0].lng
                    let lat = this.positions[0].lat
                    this.center = {lng: lng, lat: lat};
                    this.zoom = 19;
                    //加载位置marker
                    this.positions.forEach(position=>{
                        this.createMarker(position);
                    })
                }  
            })
        },
        //清除地图marker
        clearMarkers(){
            this.markers.forEach(marker=>{
                this.map.removeOverlay(marker);
            })
            this.markers.length = 0;
        },
        createMarker(position){
            let marker = new BMap.Marker(new BMap.Point(position.lng,position.lat)); 
			let label = new BMap.Label(position.positionName,{offset:new BMap.Size(9,25)});
			label.setStyle({border:"solid 0px #3333ff",color:"#fff",backgroundColor:"#605d5d",padding:'3px',paddingLeft:"5px",paddingRight:'5px'});
            marker.setLabel(label);
            this.map.addOverlay(marker);
            marker.postionId = position.postionId;
            this.markers.push(marker);
        },
         //row 选中操作
        onRowSelectedChange(curRow,oldRow){
            if(curRow != null)
            {
                this.curRow = curRow
                //marker定位
                if(this.map)
                {
                   this.center = {lng: this.curRow.lng, lat: this.curRow.lat};  
                }
            }
        },
        onAdd(){
            this.curRow = null;
            this.dialogVisible =true;
        },
        onUpdate(row){
            this.curRow = row;
            this.positionForm.positionId = row.positionId;
            this.positionForm.positionName = row.positionName
            this.positionForm.coord = row.lng+","+row.lat
            this.positionForm.dispatch = row.distanceRange
            this.dialogVisible = true;
        },
        onDelete(row){
            this.$confirm("确定删除该工程位置吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                let positionId = row.positionId
                this.$store.dispatch('insp/deletePosition',positionId).then(()=>{
                    this.getPostions();
                    this.$notify({title: '消息', message: '删除成功',type: 'success',duration:3000});
                })
            })
            .catch(()=>{})
        },
        onSubmit(){
            this.$refs.positionForm.validate(valid=>{
                if(valid)
                {
                    this.dialogVisible = false;
                    //新建
                    if(this.curRow == null)
                    {
                        this.$store.dispatch('insp/addPosition',this.positionForm).then(data=>{
                            if(data == 1)
                            {
                                this.getPostions();
                                this.$notify({title: '消息',message: '添加成功',type: 'success',duration:3000});
                            }
                        })
                    }
                    //修改
                    else
                    {
                        this.$store.dispatch('insp/updatePosition',this.positionForm).then(data=>{
                            if(data == 1)
                            {
                                this.getPostions();
                                this.$notify({title: '消息',message: '修改成功',type: 'success',duration:3000});
                            }
                        })
                    }
                }
            });
            
        },
        //打开百度地图坐标拾取页面
        onOpenBaiduCoord(){
            this.baiduDialogVisible = true;
        },
    },
	mounted() {},
	beforeDestroy() {
        this.markers.length = 0;
        this.map = null;
    }
};
</script>

<style scoped>
.map-view {
    width: 100%;
    height: 100%;
}
</style>
