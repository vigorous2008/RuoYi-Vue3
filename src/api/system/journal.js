import request from '@/utils/request'

// 查询期刊信息列表
export function listJournal(query) {
  return request({
    url: '/system/journal/list',
    method: 'get',
    params: query
  })
}

// 查询期刊信息详细
export function getJournal(id) {
  return request({
    url: '/system/journal/' + id,
    method: 'get'
  })
}

// 新增期刊信息
export function addJournal(data) {
  return request({
    url: '/system/journal',
    method: 'post',
    data: data
  })
}

// 修改期刊信息
export function updateJournal(data) {
  return request({
    url: '/system/journal',
    method: 'put',
    data: data
  })
}

// 删除期刊信息
export function delJournal(id) {
  return request({
    url: '/system/journal/' + id,
    method: 'delete'
  })
}
