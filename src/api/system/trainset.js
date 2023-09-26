import request from '@/utils/request'

// 查询训练集列表
export function listTrainset(query) {
  return request({
    url: '/system/trainset/list',
    method: 'get',
    params: query
  })
}

// 查询训练集详细
export function getTrainset(id) {
  return request({
    url: '/system/trainset/' + id,
    method: 'get'
  })
}

// 新增训练集
export function addTrainset(data) {
  return request({
    url: '/system/trainset',
    method: 'post',
    data: data
  })
}

// 修改训练集
export function updateTrainset(data) {
  return request({
    url: '/system/trainset',
    method: 'put',
    data: data
  })
}

// 删除训练集
export function delTrainset(id) {
  return request({
    url: '/system/trainset/' + id,
    method: 'delete'
  })
}
