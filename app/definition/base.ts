const Definition = {
  DefaultFormat: {
    code: { type: 'integer', require: true, description: '状态码' },
    msg: { type: 'string', description: '提示消息' },
  },
};

module.exports = Definition;
export default Definition; // 定义ts模块, 不然会变量命名冲突
