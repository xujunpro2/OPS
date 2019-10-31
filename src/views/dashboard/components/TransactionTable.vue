<template>
  <el-table :data="list" style="width: 100%;padding-top: 15px;">
    <el-table-column label="车牌" min-width="80">
      <template slot-scope="scope">
        {{ scope.row.license }}
      </template>
    </el-table-column>
    <el-table-column label="停车费" width="195" align="center">
      <template slot-scope="scope">
        {{ scope.row.price | priceText}}
      </template>
    </el-table-column>
    <el-table-column label="状态" width="100" align="center">
      <template slot-scope="{row}">
        <el-tag :type="row.status | statusFilter">
          {{ row.status | statusText}}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="时间"  align="center">
      <template slot-scope="scope">
        {{ scope.row.date}}
      </template>
    </el-table-column>
  </el-table>
</template>

<script>

export default {
    filters: {
        priceText(price){
            if(price !== ""){
                return "¥"+price;
            }
            else
            {
                return ""
            }
        },
        statusFilter(status) {
            const statusMap = ['success','danger'];
            return statusMap[status];
        },
        statusText(status){
            const statusText = ['离场','入场'];
            return statusText[status]
        }
    },
    data() {
        return {
            list: [
                {license:"苏A34980",price:"20.00",status:0,date:"2019-10-31 15:35:00"},
                {license:"苏A34980",price:"",status:1,date:"2019-10-31 15:35:00"},
                {license:"苏A34980",price:"",status:1,date:"2019-10-31 15:35:00"},
                {license:"苏A34980",price:"",status:1,date:"2019-10-31 15:35:00"},
                {license:"苏A34980",price:"10.00",status:0,date:"2019-10-31 15:35:00"},
                {license:"苏A34980",price:"20.00",status:0,date:"2019-10-31 15:35:00"},
                {license:"苏A34980",price:"20.00",status:0,date:"2019-10-31 15:35:00"},
                {license:"苏A34980",price:"",status:1,date:"2019-10-31 15:35:00"},
                {license:"苏A34980",price:"",status:1,date:"2019-10-31 15:35:00"},
                {license:"苏A34980",price:"",status:1,date:"2019-10-31 15:35:00"}
            ]
        }
    }
  
}
</script>
