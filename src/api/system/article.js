import request from '@/utils/request'

// 查询文章列表列表
export function listArticle(query) {
  return request({
    url: '/system/article/list',
    method: 'get',
    params: query
  })
}

// 查询文章列表详细
export function getArticle(articleId) {
  return request({
    url: '/system/article/' + articleId,
    method: 'get'
  })
}

// 新增文章列表
export function addArticle(data) {
  return request({
    url: '/system/article',
    method: 'post',
    data: data
  })
}

// 修改文章列表
export function updateArticle(data) {
  return request({
    url: '/system/article',
    method: 'put',
    data: data
  })
}

// 删除文章列表
export function delArticle(articleId) {
  return request({
    url: '/system/article/' + articleId,
    method: 'delete'
  })
}
