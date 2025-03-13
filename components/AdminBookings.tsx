'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

export default function AdminBookings({ bookings, title = '预约管理' }) {
  const { toast } = useToast();
  const [bookingList, setBookingList] = useState(bookings);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setIsLoading(true);

    try {
      // 在实际应用中，这里应该调用API更新预约状态
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // 更新本地状态
        setBookingList(
          bookingList.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: newStatus }
              : booking
          )
        );

        toast({
          title: '状态已更新',
          description: `预约状态已更新为 ${newStatus}`,
        });
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: '更新失败',
        description: '无法更新预约状态，请稍后再试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                客户
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                服务
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                理发师
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日期时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookingList.length > 0 ? (
              bookingList.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{booking.name}</div>
                    <div className="text-sm text-gray-500">{booking.email}</div>
                    <div className="text-sm text-gray-500">{booking.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.barber.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(booking.date), 'yyyy年MM月dd日')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={statusColors[booking.status]}>
                      {booking.status === 'pending' && '待确认'}
                      {booking.status === 'confirmed' && '已确认'}
                      {booking.status === 'cancelled' && '已取消'}
                      {booking.status === 'completed' && '已完成'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-100 text-green-800 hover:bg-green-200"
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            disabled={isLoading}
                          >
                            确认
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-100 text-red-800 hover:bg-red-200"
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            disabled={isLoading}
                          >
                            取消
                          </Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button
                          size="sm"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                          onClick={() => handleStatusChange(booking.id, 'completed')}
                          disabled={isLoading}
                        >
                          完成
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  暂无预约记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
