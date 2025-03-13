// 测试数据库连接脚本
require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('正在连接到数据库...');
    await client.connect();
    console.log('数据库连接成功！');

    const result = await client.query('SELECT NOW()');
    console.log('数据库时间:', result.rows[0].now);

    await client.end();
  } catch (error) {
    console.error('数据库连接失败:', error.message);
  }
}

testConnection();
