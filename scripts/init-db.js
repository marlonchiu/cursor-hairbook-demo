#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建命令行交互接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 项目根目录
const rootDir = path.resolve(__dirname, '../');

// 判断是否有.env文件和.env.local文件
const envPath = path.join(rootDir, '.env');
const envLocalPath = path.join(rootDir, '.env.local');
const envExists = fs.existsSync(envPath);
const envLocalExists = fs.existsSync(envLocalPath);

console.log('=== HairBook 数据库初始化工具 ===');
console.log('该工具将帮助您设置 Neon 数据库并初始化数据');
console.log('');
console.log('环境文件检查:');
console.log(`.env 文件存在: ${envExists ? '是' : '否'}`);
console.log(`.env.local 文件存在: ${envLocalExists ? '是' : '否'}`);
console.log('');

// 检查环境变量
function promptForDatabaseUrl() {
  return new Promise((resolve) => {
    rl.question('请输入 Neon 数据库连接字符串 (DATABASE_URL): ', (databaseUrl) => {
      resolve(databaseUrl);
    });
  });
}

// 创建/更新环境文件
async function setupEnvFile() {
  console.log('\n正在检查环境变量...');

  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    // 先尝试从.env和.env.local读取
    let envContent = '';

    if (envExists) {
      try {
        envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/DATABASE_URL="([^"]+)"/);
        if (match && match[1]) {
          databaseUrl = match[1];
          console.log(`从 .env 文件中读取到 DATABASE_URL`);
        }
      } catch (error) {
        console.log('无法读取 .env 文件:', error.message);
      }
    }

    if (!databaseUrl && envLocalExists) {
      try {
        envContent = fs.readFileSync(envLocalPath, 'utf8');
        const match = envContent.match(/DATABASE_URL="([^"]+)"/);
        if (match && match[1]) {
          databaseUrl = match[1];
          console.log(`从 .env.local 文件中读取到 DATABASE_URL`);
        }
      } catch (error) {
        console.log('无法读取 .env.local 文件:', error.message);
      }
    }

    if (!databaseUrl) {
      databaseUrl = await promptForDatabaseUrl();
    }
  }

  // 打印连接字符串前几个字符（为了安全不显示完整字符串）
  console.log(`使用的数据库连接字符串前缀: ${databaseUrl.substring(0, 30)}...`);

  // 更新.env文件
  let envContent = envExists ? fs.readFileSync(envPath, 'utf8') : '';
  if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(/DATABASE_URL="[^"]*"/, `DATABASE_URL="${databaseUrl}"`);
  } else {
    envContent += `\nDATABASE_URL="${databaseUrl}"\n`;
  }

  if (!envContent.includes('DIRECT_URL=')) {
    envContent += `DIRECT_URL="${databaseUrl}"\n`;
  } else {
    envContent = envContent.replace(/DIRECT_URL="[^"]*"/, `DIRECT_URL="${databaseUrl}"`);
  }

  fs.writeFileSync(envPath, envContent);
  console.log('.env 文件已更新');

  // 同样更新.env.local文件
  let envLocalContent = envLocalExists ? fs.readFileSync(envLocalPath, 'utf8') : '';
  if (envLocalContent.includes('DATABASE_URL=')) {
    envLocalContent = envLocalContent.replace(/DATABASE_URL="[^"]*"/, `DATABASE_URL="${databaseUrl}"`);
  } else {
    envLocalContent += `\nDATABASE_URL="${databaseUrl}"\n`;
  }

  if (!envLocalContent.includes('DIRECT_URL=')) {
    envLocalContent += `DIRECT_URL="${databaseUrl}"\n`;
  } else {
    envLocalContent = envLocalContent.replace(/DIRECT_URL="[^"]*"/, `DIRECT_URL="${databaseUrl}"`);
  }

  fs.writeFileSync(envLocalPath, envLocalContent);
  console.log('.env.local 文件已更新');

  return databaseUrl;
}

// 部署数据库结构
async function deployDatabaseSchema() {
  console.log('\n正在部署数据库结构...');

  try {
    // 生成Prisma客户端
    console.log('正在生成 Prisma 客户端...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // 部署数据库架构
    console.log('正在部署数据库架构...');

    // 打印环境变量进行调试
    console.log('当前环境变量:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL 是否存在:', !!process.env.DATABASE_URL);
    console.log('DIRECT_URL 是否存在:', !!process.env.DIRECT_URL);

    // 使用显式加载环境变量的命令
    execSync('npx -y dotenv -e .env -- prisma db push', { stdio: 'inherit' });

    console.log('数据库架构部署成功!');
    return true;
  } catch (error) {
    console.error('数据库架构部署失败:', error.message);
    return false;
  }
}

// 初始化默认数据
async function initializeData() {
  console.log('\n正在初始化数据...');

  try {
    // 等待数据库初始化
    execSync('npm run dev -- --port 3333', { timeout: 15000, killSignal: 'SIGINT' });
  } catch (error) {
    // 预期的行为，我们只需要启动服务器几秒钟
  }

  // 使用curl调用API
  try {
    console.log('正在调用数据库初始化API...');
    execSync('curl -X POST http://localhost:3333/api/setup-db', { stdio: 'inherit' });
    console.log('数据初始化成功!');
    return true;
  } catch (error) {
    console.error('数据初始化失败:', error.message);
    return false;
  }
}

// 主函数
async function main() {
  try {
    // 设置环境变量
    await setupEnvFile();

    // 部署数据库架构
    const schemaDeployed = await deployDatabaseSchema();
    if (!schemaDeployed) {
      console.log('数据库架构部署失败，请检查连接字符串和网络连接');
      rl.close();
      return;
    }

    // 询问是否要初始化数据
    rl.question('\n是否要初始化默认数据? (Y/n) ', async (answer) => {
      if (answer.toLowerCase() !== 'n') {
        await initializeData();
      }

      console.log('\n=== 初始化过程完成 ===');
      console.log('您现在可以使用以下命令启动应用:');
      console.log('npm run dev');

      rl.close();
    });
  } catch (error) {
    console.error('初始化过程中发生错误:', error);
    rl.close();
  }
}

// 执行主函数
main();
