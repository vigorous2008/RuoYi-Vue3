<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="期刊信息" prop="journalInfo">
        <el-input
          v-model="queryParams.journalInfo"
          placeholder="请输入期刊信息"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="文章信息" prop="articleInfo">
        <el-input
          v-model="queryParams.articleInfo"
          placeholder="请输入文章信息"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="备注信息" prop="memo">
        <el-input
          v-model="queryParams.memo"
          placeholder="请输入备注信息"
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
          v-hasPermi="['system:sample:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:sample:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:sample:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:sample:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="sampleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="sampleId" />
      <el-table-column label="期刊信息" align="center" prop="journalInfo" />
      <el-table-column label="文章信息" align="center" prop="articleInfo" />
      <el-table-column label="素材文本" align="center" prop="sampleText" />
      <el-table-column label="错误详情" align="center" prop="errorDetail" />
      <el-table-column label="操作类型" align="center" prop="operType" />
      <el-table-column label="备注信息" align="center" prop="memo" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:sample:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:sample:remove']">删除</el-button>
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

    <!-- 添加或修改sample对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="sampleRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="期刊信息" prop="journalInfo">
                <el-input v-model="form.journalInfo" placeholder="请输入期刊信息" />
        </el-form-item>
        <el-form-item label="文章信息" prop="articleInfo">
                <el-input v-model="form.articleInfo" placeholder="请输入文章信息" />
        </el-form-item>
        <el-form-item label="素材文本" prop="sampleText">
          <el-input v-model="form.sampleText" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="错误详情" prop="errorDetail">
          <el-input v-model="form.errorDetail" type="textarea" placeholder="请输入内容" />
        </el-form-item>

        <el-form-item label="备注信息" prop="memo">
          <el-input v-model="form.memo" placeholder="请输入备注信息" />
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

<script setup name="Sample">
import { listSample, getSample, delSample, addSample, updateSample } from "@/api/system/sample";

const { proxy } = getCurrentInstance();

const sampleList = ref([]);
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
    sampleText: null,
    errorDetail: null,
    journalInfo: null,
    operType: null,
    articleInfo: null,
    memo: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询sample列表 */
function getList() {
  loading.value = true;
  listSample(queryParams.value).then(response => {
    sampleList.value = response.rows;
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
    sampleId: null,
    sampleText: null,
    errorDetail: null,
    journalInfo: null,
    operType: null,
    articleInfo: null,
    memo: null
  };
  proxy.resetForm("sampleRef");
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
  ids.value = selection.map(item => item.sampleId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "新增";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _sampleId = row.sampleId || ids.value
  getSample(_sampleId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "编辑";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["sampleRef"].validate(valid => {
    if (valid) {
      if (form.value.sampleId != null) {
        updateSample(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSample(form.value).then(response => {
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
  const _sampleIds = row.sampleId || ids.value;
  proxy.$modal.confirm('是否确认删除sample编号为"' + _sampleIds + '"的数据项？').then(function() {
    return delSample(_sampleIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/sample/export', {
    ...queryParams.value
  }, `sample_${new Date().getTime()}.xlsx`)
}

getList();
</script>
