<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="期刊名" prop="journalTitle">
        <el-input
          v-model="queryParams.journalTitle"
          placeholder="请输入期刊名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="英文名" prop="journalTitleEn">
        <el-input
          v-model="queryParams.journalTitleEn"
          placeholder="请输入期刊英文名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发行语言" prop="journalLanguage">
        <el-select v-model="queryParams.journalLanguage" placeholder="请选择发行语言" clearable>
          <el-option
            v-for="dict in language_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否可见" prop="isVisible">
        <el-select v-model="queryParams.isVisible" placeholder="请选择是否可见" clearable>
          <el-option
            v-for="dict in is_visible"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['system:journal:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:journal:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:journal:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:journal:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="journalList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="期刊代码" align="center" prop="journalPublisherId" />
      <el-table-column label="期刊名" align="center" prop="journalTitle" />
      <el-table-column label="英文名" align="center" prop="journalTitleEn" />
      <el-table-column label="发行语言" align="center" prop="journalLanguage">
        <template #default="scope">
          <dict-tag :options="language_type" :value="scope.row.journalLanguage"/>
        </template>
      </el-table-column>
      <el-table-column label="官网" align="center" prop="websiteUri" />
      <el-table-column label="是否可见" align="center" prop="isVisible">
        <template #default="scope">
          <dict-tag :options="is_visible" :value="scope.row.isVisible"/>
        </template>
      </el-table-column>
      <el-table-column label="排序索引" align="center" prop="orderIndex" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:journal:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:journal:remove']">删除</el-button>
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

    <!-- 添加或修改期刊信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="journalRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="期刊编号" prop="journalPublisherId">
          <el-input v-model="form.journalPublisherId" placeholder="请输入期刊编号" />
        </el-form-item>
        <el-form-item label="期刊名" prop="journalTitle">
          <el-input v-model="form.journalTitle" placeholder="请输入期刊名" />
        </el-form-item>
        <el-form-item label="期刊英文名" prop="journalTitleEn">
          <el-input v-model="form.journalTitleEn" placeholder="请输入期刊英文名" />
        </el-form-item>
        <el-form-item label="发行语言" prop="journalLanguage">
          <el-select v-model="form.journalLanguage" placeholder="请选择发行语言">
            <el-option
              v-for="dict in language_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="官网" prop="websiteUri">
          <el-input v-model="form.websiteUri" placeholder="请输入官网" />
        </el-form-item>
        <el-form-item label="是否可见" prop="isVisible">
          <el-select v-model="form.isVisible" placeholder="请选择是否可见">
            <el-option
              v-for="dict in is_visible"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用于排序" prop="orderIndex">
          <el-input v-model="form.orderIndex" placeholder="请输入用于排序" />
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

<script setup name="Journal">
import { listJournal, getJournal, delJournal, addJournal, updateJournal } from "@/api/system/journal";

const { proxy } = getCurrentInstance();
const { language_type, is_visible } = proxy.useDict('language_type', 'is_visible');

const journalList = ref([]);
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
    journalTitle: null,
    journalTitleEn: null,
    journalLanguage: null,
    isVisible: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询期刊信息列表 */
function getList() {
  loading.value = true;
  listJournal(queryParams.value).then(response => {
    journalList.value = response.rows;
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
    journalPublisherId: null,
    journalTitle: null,
    journalTitleEn: null,
    journalLanguage: null,
    websiteUri: null,
    isVisible: null,
    orderIndex: null
  };
  proxy.resetForm("journalRef");
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
  title.value = "添加期刊信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getJournal(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改期刊信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["journalRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateJournal(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addJournal(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除期刊信息编号为"' + _ids + '"的数据项？').then(function() {
    return delJournal(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/journal/export', {
    ...queryParams.value
  }, `journal_${new Date().getTime()}.xlsx`)
}

getList();
</script>
