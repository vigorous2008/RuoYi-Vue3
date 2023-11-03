<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="2">

        <el-statistic :value="reportData.journalNum">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              期刊数
            </div>
          </template>

        </el-statistic>
      </el-col>
      <el-col :sm="24" :lg="2">
        <el-statistic :value="reportData.articleNum">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              文章数
            </div>
          </template>

        </el-statistic>

      </el-col>
      <el-col :sm="24" :lg="2">
        <el-statistic :value="reportData.detailNum">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              总数
              <el-tooltip
                  effect="dark"
                  content="检测出的错误数"
                  placement="top"
              >
                <el-icon style="margin-left: 4px" :size="12">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-statistic>
      </el-col>
      <el-col :sm="24" :lg="2">
        <el-statistic :value="reportData.markedNum">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              已完成
              <el-tooltip
                  effect="dark"
                  content="已完成标记"
                  placement="top"
              >
                <el-icon style="margin-left: 4px" :size="12">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
          </template>

        </el-statistic>
      </el-col>
      <el-col :sm="24" :lg="2">
        <el-statistic :value="reportData.finishRate">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              完成率

            </div>
          </template>

        </el-statistic>
      </el-col>
      <el-col :sm="24" :lg="2">
        <el-statistic title="今日处理" :value="reportData.todayMarkedNum">
          <template #suffix>

            <el-icon><Finished /></el-icon>
          </template>
        </el-statistic>
      </el-col>
      <!--
      <el-col :sm="24" :lg="6">
        <el-badge value="今日处理" class="item">
          <el-button>{{ reportData.todayMarkedNum }}</el-button>
        </el-badge>
      </el-col>
      -->
    </el-row>
    <el-divider />
    <el-row :gutter="20">
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        <el-row>
          <el-col :span="6">
            <h3>今日已完成（按期刊）</h3>
          </el-col>
          <el-col :span="6">
            <h3>今日已完成（按人员）</h3>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <ul v-if="reportData.journalCountDataTodayList">
              <li v-for="item of reportData.journalCountDataTodayList">{{ item.journalName }} : {{ item.detailNum }} 条</li>
            </ul>
          </el-col>
          <el-col :span="6">

            <ul v-if="reportData.userCountDataTodayList">
              <li v-for="item of reportData.userCountDataTodayList">{{ item.userName }} : {{ item.detailNum }} 条</li>
            </ul>
          </el-col>
        </el-row>
        <p>

        </p>
      </el-col>

      <el-col :sm="24" :lg="12" style="padding-left: 50px">
        <el-row>
          <el-col :span="12">
            <h3></h3>
          </el-col>
        </el-row>
        <el-row>

          <el-col :span="6">
            <h4></h4>
            <ul>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-divider />
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>数据详情</span>
            </div>
          </template>
          <el-collapse accordion>
            <el-collapse-item title="展开查看详情">
              <el-table v-loading="loading" :data="reportData.journalCountDataList" >
                <el-table-column label="期刊名称" align="center" prop="journalName" />
                <el-table-column label="文章数" align="center" prop="articleNum" />
                <el-table-column label="错误总数" align="center" prop="detailNum" />
                <el-table-column label="已完成" align="center" prop="markedNum" />
                <el-table-column label="完成率（%）" align="center" prop="finishRate" />
              </el-table>
            </el-collapse-item>

          </el-collapse>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>更新日志</span>
            </div>
          </template>
          <el-collapse accordion>
            <el-collapse-item title="功能优化 2023-11-03">
              <ol>
                <li>列表页面：完善查询条件、列表显示doi并支持链接访问doi.org</li>
                <li>首页增加统计信息</li>
                <li>编辑页面：增加了一个“备注”输入框</li>
              </ol>
            </el-collapse-item>
            <el-collapse-item title="训练集编辑 2023-10-18">
              <ol>
                <li>完善表单验证</li>
                <li>错误详情对齐（使用python更新了表中的字段）</li>
                <li>显示完整的人员列表</li>
              </ol>
            </el-collapse-item>
            <el-collapse-item title="训练集编辑 2023-09-27">
              <ol>
                <li>调整编辑页面</li>
                <li>增加表单验证</li>
              </ol>
            </el-collapse-item>
            <el-collapse-item title="基础开发环境 2023-09-26">
              <ol>
                <li>数据库表结构设计</li>
                <li>生成代码</li>
                <li>脚手架搭建</li>
              </ol>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>通知信息</span>
            </div>
          </template>
          <div class="body">
<!--            <img
              src="@/assets/images/pay.png"
              alt="donate"
              style="width:100%"
            />-->
            <span style="display: inline-block; height: 30px; line-height: 30px"
              >通知信息</span
            >
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
const version = ref('3.8.6')
const reportData = ref([]);
import {indexPageData, listTrainset} from "@/api/system/trainset";

function goTarget(url) {
  window.open(url, '__blank')
}

function getIndexPageData(){
  indexPageData().then(response => {
    reportData.value = response.data;
  });
}
getIndexPageData()
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

