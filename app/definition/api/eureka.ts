const Definition = {
  EurekaHystrix: {
    status: { type: 'string', require: true, description: '服务状态，正常为UP' },
  },
  EurekaInfoResp: {
    name: { type: 'string', require: true, description: '服务名称' },
    status: { type: 'string', require: true, description: '服务状态，正常为UP' },
  },
  EurekaHealthResp: {
    status: { type: 'string', require: true, description: '服务状态，正常为UP' },
    description: { type: 'string', require: true, description: '服务描述' },
    hystrix: { type: 'eureka.EurekaHystrix' },
  },
};

module.exports = Definition;
export default Definition; // 定义ts模块, 不然会变量命名冲突
