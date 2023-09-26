<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="期刊名" prop="journalName">
        <el-input
          v-model="queryParams.journalName"
          placeholder="请输入期刊名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="未知词" prop="unkownToken">
        <el-input
          v-model="queryParams.unkownToken"
          placeholder="请输入未知词"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作人" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入操作人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['system:trainset:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:trainset:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:trainset:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="small"
          @click="handleExport"
          v-hasPermi="['system:trainset:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="trainsetList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="期刊名" align="center" prop="journalName" />
      <el-table-column label="详情" width="600"  align="center" prop="errorDetail" />
      <el-table-column label="原文" align="center" prop="originalText" />
      <el-table-column label="纠正后的文本" align="center" prop="correctText" />
      <el-table-column label="未知词" align="center" prop="unkownToken" />
      <el-table-column label="处理类型" align="center" prop="operType" />
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
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改训练集对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="期刊名" prop="journalName">
          <el-input v-model="form.journalName" placeholder="请输入期刊名" />
        </el-form-item>
        <el-form-item label="详情" prop="errorDetail">
          <el-input v-model="form.errorDetail" type="textarea" placeholder="请输入内容" />
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
        <el-form-item label="操作人" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入操作人" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTrainset, getTrainset, delTrainset, addTrainset, updateTrainset } from "@/api/system/trainset";

export default {
  name: "Trainset",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 训练集表格数据
      trainsetList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
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
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询训练集列表 */
    getList() {
      this.loading = true;
      listTrainset(this.queryParams).then(response => {
        this.trainsetList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
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
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加训练集";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getTrainset(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改训练集";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateTrainset(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTrainset(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除训练集编号为"' + ids + '"的数据项？').then(function() {
        return delTrainset(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/trainset/export', {
        ...this.queryParams
      }, `trainset_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
