import request from '@/utils/request'

// 查询sample列表
export function listSample(query) {
  return request({
    url: '/system/sample/list',
    method: 'get',
    params: query
  })
}

// 查询sample详细
export function getSample(sampleId) {
  return request({
    url: '/system/sample/' + sampleId,
    method: 'get'
  })
}

// 新增sample
export function addSample(data) {
  return request({
    url: '/system/sample',
    method: 'post',
    data: data
  })
}

// 修改sample
export function updateSample(data) {
  return request({
    url: '/system/sample',
    method: 'put',
    data: data
  })
}

// 删除sample
export function delSample(sampleId) {
  return request({
    url: '/system/sample/' + sampleId,
    method: 'delete'
  })
}
