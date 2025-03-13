import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始数据库初始化...');

    // 清除现有数据
    await prisma.booking.deleteMany({});
    await prisma.timeSlot.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.barber.deleteMany({});
    await prisma.admin.deleteMany({});

    console.log('数据已清除');

    // 创建管理员用户
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.admin.create({
      data: {
        name: '管理员',
        email: 'admin@hairsalon.com',
        password: adminPassword,
      },
    });
    console.log('已创建管理员:', admin.email);

    // 创建服务
    const services = await Promise.all([
      prisma.service.create({
        data: {
          name: '标准理发',
          description: '包括洗发、剪发和造型',
          duration: 45,
          price: 128,
          image: '/images/services/haircut.jpg',
        },
      }),
      prisma.service.create({
        data: {
          name: '高级染发',
          description: '专业染发服务，包括色彩咨询',
          duration: 120,
          price: 388,
          image: '/images/services/coloring.jpg',
        },
      }),
      prisma.service.create({
        data: {
          name: '烫发套餐',
          description: '专业烫发，让您的头发更有活力',
          duration: 150,
          price: 488,
          image: '/images/services/perm.jpg',
        },
      }),
    ]);
    console.log(`已创建${services.length}个服务项目`);

    // 创建理发师
    const barbers = await Promise.all([
      prisma.barber.create({
        data: {
          name: '张师傅',
          description: '资深发型设计师，10年经验',
          image: '/images/barbers/barber1.jpg',
        },
      }),
      prisma.barber.create({
        data: {
          name: '李师傅',
          description: '色彩专家，擅长染发和挑染',
          image: '/images/barbers/barber2.jpg',
        },
      }),
      prisma.barber.create({
        data: {
          name: '王师傅',
          description: '造型大师，擅长时尚剪裁',
          image: '/images/barbers/barber3.jpg',
        },
      }),
    ]);
    console.log(`已创建${barbers.length}个理发师`);

    // 创建时间段
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const timeSlots = [];
    // 为接下来7天创建时间段
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);

      // 跳过周日
      if (date.getDay() === 0) continue;

      // 创建每天的时间段
      const dayTimeSlots = [
        { start: 9, end: 10 },
        { start: 10, end: 11 },
        { start: 11, end: 12 },
        { start: 13, end: 14 },
        { start: 14, end: 15 },
        { start: 15, end: 16 },
        { start: 16, end: 17 },
        { start: 17, end: 18 },
      ];

      for (const slot of dayTimeSlots) {
        const startTime = new Date(date);
        startTime.setHours(slot.start, 0, 0, 0);

        const endTime = new Date(date);
        endTime.setHours(slot.end, 0, 0, 0);

        timeSlots.push(
          prisma.timeSlot.create({
            data: {
              startTime,
              endTime,
              available: true,
            },
          })
        );
      }
    }

    await Promise.all(timeSlots);
    console.log(`已创建${timeSlots.length}个时间段`);

    console.log('数据初始化完成!');
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
