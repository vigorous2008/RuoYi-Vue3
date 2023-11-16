<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="articleTitle">
        <el-input
          v-model="queryParams.articleTitle"
          placeholder="请输入标题"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="期刊" prop="journalId">
<!--        <el-input
          v-model="queryParams.journalId"
          placeholder="请输入期刊"
          clearable
          @keyup.enter="handleQuery"
        />-->
        <el-select
            v-model="queryParams.journalId"
            placeholder="请选择"
            filterable
            clearable
        >
          <el-option
              v-for="item in journalSelectOptions"
              :key="item.id"
              :label="item.journalTitle"
              :value="parseInt(item.id)"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="DOI" prop="doi">
        <el-input
          v-model="queryParams.doi"
          placeholder="请输入DOI"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="语言类型" prop="articleLang">
        <el-select v-model="queryParams.articleLang" placeholder="请选择语言类型" clearable>
          <el-option
            v-for="dict in language_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="出版日期" style="width: 308px">
        <el-date-picker
          v-model="daterangePubDate"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="卷号" prop="volumn">
        <el-input
          v-model="queryParams.volumn"
          placeholder="请输入卷号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="期号" prop="issue">
        <el-input
          v-model="queryParams.issue"
          placeholder="请输入期号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
<!--      <el-form-item label="作者" prop="author">
        <el-input
          v-model="queryParams.author"
          placeholder="请输入作者"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>-->
      <el-form-item label="文件名" prop="xmlName">
        <el-input
          v-model="queryParams.xmlName"
          placeholder="请输入xml文件名"
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
          v-hasPermi="['system:article:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:article:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:article:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:article:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="articleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="文章ID" align="center" prop="articleId" />
      <el-table-column label="标题" align="center" prop="articleTitle" />
      <el-table-column label="期刊" align="center" prop="journalTitle" />
      <el-table-column label="DOI" align="center" prop="doi" >
        <template #default="scope">
          <el-link :href="'https://doi.org/'+scope.row.doi" :underline="true" target="_blank">
            <span class="el-icon-document"> {{scope.row.doi}}</span>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="语言类型" align="center" prop="articleLang">
        <template #default="scope">
          <dict-tag :options="language_type" :value="scope.row.articleLang"/>
        </template>
      </el-table-column>
      <el-table-column label="出版日期" align="center" prop="pubDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.pubDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="卷号" align="center" prop="volumn" />
      <el-table-column label="期号" align="center" prop="issue" />
      <el-table-column label="起止页码" align="center" prop="pageScope" />
      <el-table-column label="xml文件名" align="center" prop="xmlName" />
      <el-table-column label="备注信息" align="center" prop="memo" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:article:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:article:remove']">删除</el-button>
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

    <!-- 添加或修改文章列表对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="articleRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="articleTitle">
          <el-input v-model="form.articleTitle" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="期刊" prop="journalId">
          <el-input v-model="form.journalId" placeholder="请输入期刊" />
        </el-form-item>
        <el-form-item label="DOI" prop="doi">
          <el-input v-model="form.doi" placeholder="请输入DOI" />
        </el-form-item>
        <el-form-item label="语言类型" prop="articleLang">
          <el-select v-model="form.articleLang" placeholder="请选择语言类型">
            <el-option
              v-for="dict in language_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="出版日期" prop="pubDate">
          <el-date-picker clearable
            v-model="form.pubDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择出版日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="卷号" prop="volumn">
          <el-input v-model="form.volumn" placeholder="请输入卷号" />
        </el-form-item>
        <el-form-item label="期号" prop="issue">
          <el-input v-model="form.issue" placeholder="请输入期号" />
        </el-form-item>
        <el-form-item label="起止页码" prop="pageScope">
          <el-input v-model="form.pageScope" placeholder="请输入起止页码" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="维护人" prop="createUser">
          <el-input v-model="form.createUser" placeholder="请输入维护人" />
        </el-form-item>
        <el-form-item label="xml文件名" prop="xmlName">
          <el-input v-model="form.xmlName" placeholder="请输入xml文件名" />
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

<script setup name="Article">
import { listArticle, getArticle, delArticle, addArticle, updateArticle } from "@/api/system/article";
import {listJournal} from "@/api/system/journal";

const { proxy } = getCurrentInstance();
const { language_type } = proxy.useDict('language_type');

const articleList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangePubDate = ref([]);
const journalSelectOptions = ref([])
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    articleTitle: null,
    journalId: null,
    doi: null,
    articleLang: null,
    pubDate: null,
    volumn: null,
    issue: null,
    author: null,
    xmlName: null,
    memo: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询文章列表列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangePubDate && '' != daterangePubDate) {
    queryParams.value.params["beginPubDate"] = daterangePubDate.value[0];
    queryParams.value.params["endPubDate"] = daterangePubDate.value[1];
  }
  listArticle(queryParams.value).then(response => {
    articleList.value = response.rows;
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
    articleId: null,
    articleTitle: null,
    journalId: null,
    doi: null,
    articleLang: null,
    createTime: null,
    updateTime: null,
    pubDate: null,
    volumn: null,
    issue: null,
    pageScope: null,
    author: null,
    createUser: null,
    xmlName: null,
    memo: null
  };
  proxy.resetForm("articleRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangePubDate.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.articleId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加文章列表";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _articleId = row.articleId || ids.value
  getArticle(_articleId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改文章列表";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["articleRef"].validate(valid => {
    if (valid) {
      if (form.value.articleId != null) {
        updateArticle(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addArticle(form.value).then(response => {
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
  const _articleIds = row.articleId || ids.value;
  proxy.$modal.confirm('是否确认删除文章列表编号为"' + _articleIds + '"的数据项？').then(function() {
    return delArticle(_articleIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/article/export', {
    ...queryParams.value
  }, `article_${new Date().getTime()}.xlsx`)
}

/** 查询期刊ID和名称，用于查询条件中的期刊下拉列表 */
function getJournalNameSelect() {
  journalSelectOptions.value = [];

  listJournal({pageSize:"5000", orderByColumn:"order_index, journal_publisher_id"}).then(response => {
    journalSelectOptions.value = proxy.handleTree(response.data||response.rows, "id", "journalTitle");
  });
}


getJournalNameSelect();
getList();
</script>
