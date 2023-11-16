<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="期刊名称" prop="journalName">
        <el-input
            v-model="queryParams.journalName"
            placeholder="请输入期刊名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="文章" prop="articleXml">
        <el-input
            v-model="queryParams.articleXml"
            placeholder="请输入文章"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="doi" prop="doi">
        <el-input
            v-model="queryParams.doi"
            placeholder="请输入"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="处理类型" prop="operType">
        <el-select v-model="queryParams.operType" placeholder="请选择处理类型" clearable>
          <el-option
              v-for="dict in trainset_oper_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="未知词" prop="unkownToken">
        <el-input
            v-model="queryParams.unkownToken"
            placeholder="请输入未知词"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="操作人" prop="userId">

        <el-select
            v-model="queryParams.userId"
            placeholder="请选择"
            filterable
            clearable
        >
          <el-option
              v-for="item in userSelectOptions"
              :key="item.userId"
              :label="item.userName"
              :value="parseInt(item.userId)"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="时间段" prop="startTime" label-width="60px">
        <el-date-picker
            clearable
            v-model="queryParams.startTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="开始时间"
        >
        </el-date-picker>
        &nbsp;&nbsp;&nbsp;&nbsp;


      </el-form-item>
      <el-form-item label="至" prop="endTime" label-width="60px">

        <el-date-picker
            clearable
            v-model="queryParams.endTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="结束时间"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['system:trainset:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['system:trainset:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:trainset:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['system:trainset:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="trainsetList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" width="55" prop="id" />
      <el-table-column label="期刊名称" align="center" prop="journalName" />
      <el-table-column label="文章" align="center" prop="articleXml" />
<!--      <el-table-column label="原文" align="center" width="500" prop="originalText" />-->
      <el-table-column label="原文" align="center" width="500" prop="errorDetail"  show-overflow-tooltip="true">
        <template #default="scope" >
<!--          <span> errors:{{ scope.row.errorDetail.split('原文')[0].split(' errors:')[1] }}</span>-->
          <span> errors:{{ scope.row.errorDetail.split('errors:')[1] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="未知词" align="center" prop="unkownToken" />
      <el-table-column label="处理类型" align="center" prop="operType">
        <template #default="scope">
          <dict-tag :options="trainset_oper_type" :value="scope.row.operType"/>
        </template>
      </el-table-column>
      <el-table-column label="最后更新时间" align="center" prop="updateTime" width="160" >
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作人" align="center" width="75" prop="userName" />
      <el-table-column label="doi" align="center" prop="doi" >
        <template #default="scope">
          <el-link :href="'https://doi.org/'+scope.row.doi" :underline="true" target="_blank">
            <span class="el-icon-document"> {{scope.row.doi}}</span>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="memo" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:trainset:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:trainset:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改训练集对话框 -->
    <el-dialog :title="title" v-model="open" width="1000px" append-to-body>
      <el-form ref="trainsetRef" :model="form" :rules="rules_ext" label-width="80px">
        <el-form-item label="期刊名称" prop="journalName">
          <el-input v-model="form.journalName" disabled placeholder="请输入期刊名称" />
        </el-form-item>
        <el-form-item label="文章" prop="articleXml">
          <el-input v-model="form.articleXml" disabled placeholder="请输入文章" />
        </el-form-item>
        <el-form-item label="doi" prop="doi">
          <el-input v-model="form.doi" disabled placeholder="请输入文章" />
        </el-form-item>
        <el-form-item label="详情" prop="errorDetail">
          <el-input v-model="form.errorDetail" type="textarea" disabled autosize placeholder="请输入内容"  onmouseover="value=value.replace(' 修正: ',' 修正：')"
          />
        </el-form-item>
        <el-form-item label="原文" prop="originalText">
          <el-input v-model="form.originalText" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="纠正" prop="correctText">
          <el-input v-model="form.correctText" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="未知词" prop="unkownToken">
          <el-input v-model="form.unkownToken" placeholder="多个未知词不用分隔" />
        </el-form-item>
        <el-form-item label="处理类型" prop="operType">
          <el-select v-model="form.operType" placeholder="请选择处理类型">
            <el-option
                v-for="dict in trainset_oper_type"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="memo">
          <el-input v-model="form.memo" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>


      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Trainset">
import { listUser } from "@/api/system/user";
import { allocatedUserList }  from "@/api/system/role";
import { listTrainset, getTrainset, delTrainset, addTrainset, updateTrainset } from "@/api/system/trainset";

const { proxy } = getCurrentInstance();
const { trainset_oper_type } = proxy.useDict('trainset_oper_type');

const trainsetList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const userSelectOptions = ref([]);//用户下拉列表

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    journalName: null,
    articleXml: null,
    originalText: null,
    operType: null,
    userId: null,
    startTime:null,
    endTime:null,
    doi:null,
    memo:null
  },
  rules: {
  }
});



// 定义校验规则
// 可以为一个字段指定多条校验规则
// 规则名称与form表单字段一致
const rules_ext = reactive({
  operType: [
    // 自定义校验规则
    {
      validator(rule, value, callback) {
        //console.log("操作类型："+value+" form.value.unkownToken="+form.value.unkownToken+" , form.value.correctText==null："+(null==form.value.correctText))
        if (null!=value &&(value == 1 || value == 2)) {
          //修正基础训练集、补充垂直训练集
          //console.log("操作类型："+value+"  需要校验字符串长度")
          if(null != form.value.correctText && ( form.value.correctText.length == form.value.originalText.length)){
            // 校验通过
            callback()
          }else{
            // 校验不通过
            return callback(new Error('原文与纠正后的文本长度不一致！ '))
          }
        }else if (null!=value && value == 5) {
          //校验未知词
          if(null != form.value.unkownToken && form.value.unkownToken.length > 0){
            callback()
          }else{
            return callback(new Error('请填写未知词！ '))
          }
        }else if(null!=value && (value == 0 || value == 3 || value == 4)) {
          //校验 未处理 和 正确
          if((null == form.value.unkownToken || form.value.unkownToken.length == 0) && (null == form.value.correctText || form.value.correctText.length == 0)){
            callback()
          }else{
            return callback(new Error('请确认操作类型！ '))
          }
        }else {
          // 校验通过
          callback()
        }
      }
    }
  ]
})


const { queryParams, form, rules } = toRefs(data);

/** 查询训练集列表 */
function getList() {
  loading.value = true;
  //console.log(queryParams.value)
  listTrainset(queryParams.value).then(response => {
    trainsetList.value = response.rows;
    //console.log(response.rows)
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    journalName: null,
    articleXml: null,
    errorDetail: null,
    originalText: null,
    correctText: null,
    unkownToken: null,
    operType: null,
    createTime: null,
    updateTime: null,
    userId: null,
    startTime:null,
    endTime:null,
    doi:null,
    memo:null
  };
  proxy.resetForm("trainsetRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加训练集";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getTrainset(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改训练集";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["trainsetRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateTrainset(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTrainset(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除训练集编号为"' + _ids + '"的数据项？').then(function() {
    return delTrainset(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/trainset/export', {
    ...queryParams.value
  }, `trainset_${new Date().getTime()}.xlsx`)
}

/** 查询用户，用于查询条件中的操作人下拉列表 */
function getUserNameSelect_1() {
  userSelectOptions.value = [];
  listUser({}).then(response => {
    userSelectOptions.value = proxy.handleTree(response.data||response.rows, "userId", "userName");
  });
}
/** 查询用户，用于查询条件中的操作人下拉列表 */
function getUserNameSelect() {
  userSelectOptions.value = [];

  allocatedUserList({roleId: "100",pageSize:"50"}).then(response => {
    userSelectOptions.value = proxy.handleTree(response.data||response.rows, "userId", "userName");
  });
}


getUserNameSelect();
getList();
</script>
