<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="期刊名" prop="journalName">
        <el-input
          v-model="queryParams.journalName"
          placeholder="请输入期刊名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="未知词" prop="unkownToken">
        <el-input
          v-model="queryParams.unkownToken"
          placeholder="请输入未知词"
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
      <el-form-item label="操作人" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入操作人"
          clearable
          @keyup.enter="handleQuery"
        />
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
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="期刊名" align="center" prop="journalName" />
      <el-table-column label="详情" align="center" width="600" prop="errorDetail" />
      <el-table-column label="原文" align="center" prop="originalText" />
      <el-table-column label="纠正后的文本" align="center" prop="correctText" />
      <el-table-column label="未知词" align="center" prop="unkownToken" />
      <el-table-column label="处理类型" align="center" prop="operType">
        <template #default="scope">
          <dict-tag :options="trainset_oper_type" :value="scope.row.operType"/>
        </template>
      </el-table-column>
      <el-table-column label="操作人" align="center" prop="userId" />
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
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="trainsetRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="期刊名" prop="journalName">
          <el-input v-model="form.journalName"  disabled placeholder="请输入期刊名" />
        </el-form-item>
        <el-form-item label="详情" prop="errorDetail">
          <el-input v-model="form.errorDetail" type="textarea" disabled :rows="6" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="原文" prop="originalText">
          <el-input v-model="form.originalText" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="纠正后的文本" prop="correctText">
          <el-input v-model="form.correctText" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="未知词" prop="unkownToken">
          <el-input v-model="form.unkownToken" placeholder="请输入未知词" />
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
        <el-form-item label="操作人" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入操作人" />
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

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    journalName: null,
    errorDetail: null,
    originalText: null,
    correctText: null,
    unkownToken: null,
    operType: null,
    userId: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询训练集列表 */
function getList() {
  loading.value = true;
  listTrainset(queryParams.value).then(response => {
    trainsetList.value = response.rows;
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
    errorDetail: null,
    originalText: null,
    correctText: null,
    unkownToken: null,
    operType: null,
    createTime: null,
    updateTime: null,
    userId: null
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

getList();
</script>
