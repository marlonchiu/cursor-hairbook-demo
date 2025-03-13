'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

// 表单验证架构
const bookingSchema = z.object({
  name: z.string().min(2, { message: '姓名至少需要2个字符' }),
  email: z.string().email({ message: '请输入有效的邮箱地址' }),
  phone: z.string().min(6, { message: '请输入有效的电话号码' }),
  serviceId: z.string({ required_error: '请选择服务' }),
  barberId: z.string({ required_error: '请选择理发师' }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

// 同时支持默认导出和命名导出
export function BookingForm({ services = [], barbers = [] }) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string | undefined>(undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // 调试信息
  useEffect(() => {
    console.log('可用服务:', services);
    console.log('可用理发师:', barbers);
  }, [services, barbers]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedService = watch('serviceId');
  const selectedBarber = watch('barberId');

  // 当用户选择日期时获取可用时间段
  const handleDateSelect = async (selectedDate: Date) => {
    setDate(selectedDate);

    if (selectedService && selectedBarber) {
      try {
        setIsLoading(true);
        // 调用API获取可用时间段
        const response = await fetch(`/api/time-slots?date=${format(selectedDate, 'yyyy-MM-dd')}&serviceId=${selectedService}&barberId=${selectedBarber}`);

        if (!response.ok) {
          throw new Error(`获取时间段失败: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.timeSlots) {
          setAvailableTimeSlots(data.timeSlots);
          setError('');
        } else {
          setError(data.message || '无法获取可用时间段');
          setAvailableTimeSlots([]);
        }
      } catch (error) {
        console.error('获取时间段出错:', error);
        setError('获取可用时间段时出错，请稍后再试');

        // 备用: 使用模拟数据
        setAvailableTimeSlots(mockTimeSlots);
      } finally {
        setIsLoading(false);
      }

      setTimeSlot(undefined);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data: BookingFormValues) => {
    if (!date || !timeSlot) {
      toast({
        title: "错误",
        description: "请选择日期和时间",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 准备提交数据
      const bookingData = {
        ...data,
        date: format(date, 'yyyy-MM-dd'),
        timeSlotId: timeSlot,
      };

      console.log('提交的预约数据:', bookingData);

      // 发送预约请求
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const responseData = await response.json();
      console.log('API响应:', responseData);

      if (response.ok && responseData.success) {
        // 预约成功
        toast({
          title: "预约成功",
          description: "您的预约已成功提交，我们将尽快与您联系确认。",
        });

        // 重置表单
        setDate(undefined);
        setTimeSlot(undefined);
        setStep(1);
        reset(); // 重置表单字段
      } else {
        // 预约失败，显示错误信息
        throw new Error(responseData.message || '预约提交失败');
      }
    } catch (error) {
      console.error('预约提交错误:', error);

      toast({
        title: "预约失败",
        description: error instanceof Error ? error.message : "无法提交您的预约，请稍后再试。",
        variant: "destructive",
      });

      setError(error instanceof Error ? error.message : "预约失败，请稍后再试");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 暂时模拟API调用，实际开发中应从后端获取
  const mockTimeSlots = [
    { id: '1', startTime: '09:00', endTime: '10:00' },
    { id: '2', startTime: '10:30', endTime: '11:30' },
    { id: '3', startTime: '13:00', endTime: '14:00' },
    { id: '4', startTime: '15:30', endTime: '16:30' },
    { id: '5', startTime: '17:00', endTime: '18:00' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="service">选择服务</Label>
            <Select
              onValueChange={(value) => setValue('serviceId', value)}
              defaultValue={watch('serviceId')}
            >
              <SelectTrigger id="service">
                <SelectValue placeholder="选择服务" />
              </SelectTrigger>
              <SelectContent>
                {services && services.length > 0 ? (
                  services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ¥{service.price} ({service.duration}分钟)
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    没有可用服务
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.serviceId && (
              <p className="text-red-500 text-sm">{errors.serviceId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="barber">选择理发师</Label>
            <Select
              onValueChange={(value) => setValue('barberId', value)}
              defaultValue={watch('barberId')}
            >
              <SelectTrigger id="barber">
                <SelectValue placeholder="选择理发师" />
              </SelectTrigger>
              <SelectContent>
                {barbers && barbers.length > 0 ? (
                  barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    没有可用理发师
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.barberId && (
              <p className="text-red-500 text-sm">{errors.barberId.message}</p>
            )}
          </div>

          <Button
            type="button"
            onClick={nextStep}
            disabled={!selectedService || !selectedBarber}
            className="w-full"
          >
            下一步
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <Label>选择日期</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(date) => {
                // 禁用过去的日期和周日
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today || date.getDay() === 0;
              }}
              className="rounded-md border mx-auto"
            />
          </div>

          {date && (
            <div className="space-y-3">
              <Label>选择时间</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {isLoading ? (
                  <div className="col-span-3 text-center py-4">加载中...</div>
                ) : availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      type="button"
                      variant={timeSlot === slot.id ? "default" : "outline"}
                      onClick={() => setTimeSlot(slot.id)}
                      className="text-center"
                    >
                      {slot.startTime}
                    </Button>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-4">当天没有可用时间段</div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevStep}>
              上一步
            </Button>
            <Button
              type="button"
              onClick={nextStep}
              disabled={!date || !timeSlot}
            >
              下一步
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">您的姓名</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">电子邮箱</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">手机号码</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">备注信息（可选）</Label>
            <Textarea id="notes" {...register('notes')} />
          </div>

          <div className="pt-2">
            <h3 className="font-semibold text-lg mb-3">预约信息确认</h3>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <p><span className="font-medium">服务:</span> {services.find(s => s.id === selectedService)?.name}</p>
              <p><span className="font-medium">理发师:</span> {barbers.find(b => b.id === selectedBarber)?.name}</p>
              <p><span className="font-medium">日期:</span> {date && format(date, 'yyyy年MM月dd日')}</p>
              <p><span className="font-medium">时间:</span> {availableTimeSlots.find(t => t.id === timeSlot)?.startTime}</p>
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevStep}>
              上一步
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : '确认预约'}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

// 保持默认导出以兼容现有代码
export default BookingForm;
