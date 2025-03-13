// 检查环境变量脚本
require('dotenv').config({ path: '.env.local' });

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('DIRECT_URL:', process.env.DIRECT_URL);
