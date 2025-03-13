'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Info, Trash2, PhoneCall, Mail, Clock, AlertTriangle, CheckCircle2, XCircle, Calendar as CalendarIcon2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

// 预约状态类型与后端保持一致
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  email?: string;
  notes?: string;
  serviceId: string;
  barberId: string;
  dateTime: string;
  status: BookingStatus;
  serviceName?: string;
  barberName?: string;
  createdAt: string;
}

interface Service {
  id: string;
  name: string;
}

interface Barber {
  id: string;
  name: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);

  // 新增状态
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);

  // 检查用户是否已登录
  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    if (!storedUser) {
      toast({
        title: "访问被拒绝",
        description: "请先登录管理员账号",
        variant: "destructive",
      });
      router.push('/admin/login');
    }
  }, [router, toast]);

  // 获取预约数据
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/admin/bookings');
        if (!response.ok) {
          throw new Error('获取预约数据失败');
        }
        const data = await response.json();

        // 确保所有状态值大写以匹配后端
        const formattedBookings = data.bookings.map((booking: any) => ({
          ...booking,
          status: booking.status.toUpperCase() as BookingStatus
        }));

        setBookings(formattedBookings);
        setFilteredBookings(formattedBookings);
      } catch (error) {
        console.error('获取预约数据出错:', error);
        toast({
          title: "获取预约数据失败",
          description: "请稍后再试",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchServicesAndBarbers = async () => {
      try {
        const [servicesRes, barbersRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/barbers')
        ]);

        if (!servicesRes.ok || !barbersRes.ok) {
          throw new Error('获取服务或理发师数据失败');
        }

        const servicesData = await servicesRes.json();
        const barbersData = await barbersRes.json();

        setServices(servicesData.services);
        setBarbers(barbersData.barbers);
      } catch (error) {
        console.error('获取服务或理发师数据出错:', error);
      }
    };

    fetchBookings();
    fetchServicesAndBarbers();
  }, [toast]);

  // 筛选预约
  useEffect(() => {
    let filtered = [...bookings];

    // 按搜索关键词筛选
    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customerPhone.includes(searchQuery) ||
        booking.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 按状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // 按日期筛选
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(booking =>
        booking.dateTime.startsWith(dateStr)
      );
    }

    setFilteredBookings(filtered);
  }, [searchQuery, statusFilter, selectedDate, bookings]);

  // 更新预约状态
  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus, reason?: string) => {
    try {
      setIsUpdating(true);

      // 准备请求数据
      const requestData: any = { status: newStatus };

      // 如果是取消操作且有原因，添加到请求中
      if (newStatus === 'CANCELLED' && reason) {
        requestData.cancelReason = reason;
      }

      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '更新预约状态失败');
      }

      // 更新本地状态
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: newStatus, notes: data.booking.notes }
            : booking
        )
      );

      toast({
        title: "更新成功",
        description: "预约状态已更新",
      });

      // 重置相关状态
      setCancelReason('');
      setShowCancelDialog(false);
      setShowReminderDialog(false);
      setReminderMessage('');
      setShowRescheduleDialog(false);
    } catch (error: any) {
      console.error('更新预约状态出错:', error);
      toast({
        title: "更新失败",
        description: error.message || "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // 删除预约
  const deleteBooking = async (bookingId: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '删除预约失败');
      }

      // 更新本地状态，移除已删除的预约
      setBookings(prevBookings =>
        prevBookings.filter(booking => booking.id !== bookingId)
      );

      toast({
        title: "删除成功",
        description: "预约已成功删除",
      });

      setDeleteConfirmId(null);
    } catch (error: any) {
      console.error('删除预约出错:', error);
      toast({
        title: "删除失败",
        description: error.message || "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // 打开预约详情对话框
  const openDetailDialog = (booking: Booking) => {
    setCurrentBooking(booking);
    setShowDetailDialog(true);
  };

  // 打开取消预约对话框
  const openCancelDialog = (booking: Booking) => {
    setCurrentBooking(booking);
    setShowCancelDialog(true);
  };

  // 打开提醒对话框
  const openReminderDialog = (booking: Booking) => {
    setCurrentBooking(booking);
    setReminderMessage(`尊敬的${booking.customerName}您好，提醒您已预约${booking.serviceName}服务，时间为${format(new Date(booking.dateTime), 'yyyy年MM月dd日 HH:mm')}。期待您的光临！`);
    setShowReminderDialog(true);
  };

  // 发送提醒消息（模拟）
  const sendReminder = async () => {
    if (!currentBooking) return;

    try {
      setIsUpdating(true);

      // 这里是模拟发送提醒，实际项目中可以调用短信或邮件API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 关闭对话框
      setShowReminderDialog(false);

      toast({
        title: "提醒已发送",
        description: `已向客户 ${currentBooking.customerName} 发送预约提醒`,
      });
    } catch (error) {
      toast({
        title: "发送失败",
        description: "无法发送提醒，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setReminderMessage('');
    }
  };

  const getStatusClass = (status: BookingStatus) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch(status) {
      case 'PENDING': return '待确认';
      case 'CONFIRMED': return '已确认';
      case 'COMPLETED': return '已完成';
      case 'CANCELLED': return '已取消';
      default: return '未知状态';
    }
  };

  // 格式化日期时间
  const formatDateTime = (dateTimeStr: string) => {
    return new Date(dateTimeStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 计算预约时间是否是今天
  const isToday = (dateTimeStr: string) => {
    const today = new Date();
    const bookingDate = new Date(dateTimeStr);
    return bookingDate.getDate() === today.getDate() &&
           bookingDate.getMonth() === today.getMonth() &&
           bookingDate.getFullYear() === today.getFullYear();
  };

  // 计算预约是否已过期（预约时间早于当前时间）
  const isExpired = (dateTimeStr: string) => {
    return new Date(dateTimeStr) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">预约管理</h1>
          <Button onClick={() => router.push('/admin/dashboard')}>
            返回仪表盘
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 筛选工具栏 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-64">
              <Input
                placeholder="搜索客户名/电话/订单号"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="w-full md:w-48">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="预约状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="PENDING">待确认</SelectItem>
                  <SelectItem value="CONFIRMED">已确认</SelectItem>
                  <SelectItem value="COMPLETED">已完成</SelectItem>
                  <SelectItem value="CANCELLED">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '选择日期'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {selectedDate && (
              <Button
                variant="ghost"
                onClick={() => setSelectedDate(undefined)}
                className="text-sm"
              >
                清除日期
              </Button>
            )}
          </div>
        </div>

        {/* 预约统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">总预约</div>
            <div className="text-2xl font-semibold">{bookings.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">待确认</div>
            <div className="text-2xl font-semibold text-yellow-600">
              {bookings.filter(b => b.status === 'PENDING').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">已确认</div>
            <div className="text-2xl font-semibold text-blue-600">
              {bookings.filter(b => b.status === 'CONFIRMED').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">今日预约</div>
            <div className="text-2xl font-semibold text-green-600">
              {bookings.filter(b => b.dateTime.startsWith(format(new Date(), 'yyyy-MM-dd'))).length}
            </div>
          </div>
        </div>

        {/* 预约列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    订单号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客户信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    预约详情
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    预约时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className={isToday(booking.dateTime) ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {booking.customerName}
                          {isToday(booking.dateTime) && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              今日
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <PhoneCall className="h-3 w-3 mr-1" />
                          {booking.customerPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          服务: {booking.serviceName || '未知服务'}
                        </div>
                        <div className="text-sm text-gray-500">
                          理发师: {booking.barberName || '未知理发师'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon2 className="h-3 w-3 mr-1" />
                          {formatDateTime(booking.dateTime)}
                          {isExpired(booking.dateTime) && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              已过期
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDetailDialog(booking)}
                            className="text-blue-500"
                          >
                            <Info className="h-4 w-4 mr-1" />
                            详情
                          </Button>

                          {booking.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                                className="bg-blue-500 hover:bg-blue-600"
                                disabled={isUpdating}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                确认
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openCancelDialog(booking)}
                                className="text-red-500 border-red-500"
                                disabled={isUpdating}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                取消
                              </Button>
                            </>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                                className="bg-green-500 hover:bg-green-600"
                                disabled={isUpdating}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                完成
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => openReminderDialog(booking)}
                                className="bg-amber-500 hover:bg-amber-600"
                                disabled={isUpdating}
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                提醒
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openCancelDialog(booking)}
                                className="text-red-500 border-red-500"
                                disabled={isUpdating}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                取消
                              </Button>
                            </>
                          )}
                          {booking.status === 'PENDING' && isExpired(booking.dateTime) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openCancelDialog(booking)}
                              className="text-red-500 border-red-500"
                              disabled={isUpdating}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              过期处理
                            </Button>
                          )}
                          {(booking.status === 'COMPLETED' || booking.status === 'CANCELLED') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteConfirmId(booking.id)}
                              className="text-red-500 border-red-500"
                              disabled={isUpdating}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              删除
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      没有找到符合条件的预约
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 预约详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>预约详情</DialogTitle>
          </DialogHeader>
          {currentBooking && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">订单号</div>
                  <div className="mt-1">{currentBooking.id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">预约状态</div>
                  <div className="mt-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(currentBooking.status)}`}>
                      {getStatusText(currentBooking.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">客户信息</div>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <span>姓名:</span>
                    <span className="ml-1 font-medium">{currentBooking.customerName}</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneCall className="h-3 w-3 mr-1" />
                    <span>{currentBooking.customerPhone}</span>
                  </div>
                  {currentBooking.email && (
                    <div className="col-span-2 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      <span>{currentBooking.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">预约详情</div>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <span>服务:</span>
                    <span className="ml-1 font-medium">{currentBooking.serviceName}</span>
                  </div>
                  <div className="flex items-center">
                    <span>理发师:</span>
                    <span className="ml-1 font-medium">{currentBooking.barberName}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <CalendarIcon2 className="h-3 w-3 mr-1" />
                    <span>
                      {formatDateTime(currentBooking.dateTime)}
                      {isToday(currentBooking.dateTime) && (
                        <span className="ml-2 text-blue-600 font-semibold">(今日)</span>
                      )}
                      {isExpired(currentBooking.dateTime) && currentBooking.status !== 'COMPLETED' && currentBooking.status !== 'CANCELLED' && (
                        <span className="ml-2 text-red-600 font-semibold">(已过期)</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {currentBooking.notes && (
                <div>
                  <div className="text-sm font-medium text-gray-500">备注</div>
                  <div className="mt-1 text-gray-700 whitespace-pre-line">{currentBooking.notes}</div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-gray-500">创建时间</div>
                <div className="mt-1 text-gray-700">
                  {new Date(currentBooking.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              关闭
            </Button>
            {currentBooking && currentBooking.status === 'PENDING' && (
              <>
                <Button
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={() => {
                    updateBookingStatus(currentBooking.id, 'CONFIRMED');
                    setShowDetailDialog(false);
                  }}
                  disabled={isUpdating}
                >
                  确认预约
                </Button>
                <Button
                  className="text-red-500 border-red-500"
                  variant="outline"
                  onClick={() => {
                    setShowDetailDialog(false);
                    openCancelDialog(currentBooking);
                  }}
                  disabled={isUpdating}
                >
                  取消预约
                </Button>
              </>
            )}
            {currentBooking && currentBooking.status === 'CONFIRMED' && (
              <>
                <Button
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => {
                    updateBookingStatus(currentBooking.id, 'COMPLETED');
                    setShowDetailDialog(false);
                  }}
                  disabled={isUpdating}
                >
                  标记完成
                </Button>
                <Button
                  className="bg-amber-500 hover:bg-amber-600"
                  onClick={() => {
                    setShowDetailDialog(false);
                    openReminderDialog(currentBooking);
                  }}
                  disabled={isUpdating}
                >
                  发送提醒
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除这条预约记录吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} disabled={isUpdating}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && deleteBooking(deleteConfirmId)}
              disabled={isUpdating}
            >
              {isUpdating ? '正在删除...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 取消预约对话框 */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>取消预约</DialogTitle>
            <DialogDescription>
              请输入取消预约的原因，这将帮助我们改进服务。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="请输入取消原因..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isUpdating}>
              返回
            </Button>
            <Button
              variant="destructive"
              onClick={() => currentBooking && updateBookingStatus(currentBooking.id, 'CANCELLED', cancelReason)}
              disabled={isUpdating}
            >
              {isUpdating ? '处理中...' : '确认取消'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 提醒对话框 */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>发送预约提醒</DialogTitle>
            <DialogDescription>
              向客户发送预约提醒短信或邮件
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-2 text-sm font-medium">提醒内容：</div>
            <Textarea
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              className="min-h-[100px]"
            />
            {currentBooking && (
              <div className="mt-4 text-sm text-gray-500">
                将发送至：
                <div className="mt-1">
                  <div className="flex items-center">
                    <PhoneCall className="h-3 w-3 mr-1" />
                    <span>{currentBooking.customerPhone}</span>
                  </div>
                  {currentBooking.email && (
                    <div className="flex items-center mt-1">
                      <Mail className="h-3 w-3 mr-1" />
                      <span>{currentBooking.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)} disabled={isUpdating}>
              取消
            </Button>
            <Button
              variant="default"
              onClick={sendReminder}
              disabled={isUpdating || !reminderMessage.trim()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isUpdating ? '发送中...' : '发送提醒'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
