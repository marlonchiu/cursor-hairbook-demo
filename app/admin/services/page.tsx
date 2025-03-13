'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Service, 'id'>>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    imageUrl: '',
  });

  const [currentServiceId, setCurrentServiceId] = useState<string>('');

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

  // 获取服务数据
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) {
          throw new Error('获取服务数据失败');
        }
        const data = await response.json();
        setServices(data.services);
      } catch (error) {
        console.error('获取服务数据出错:', error);
        toast({
          title: "获取服务数据失败",
          description: "请稍后再试",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'price' || name === 'duration') {
      setFormData({
        ...formData,
        [name]: Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAddService = async () => {
    try {
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('添加服务失败');
      }

      const data = await response.json();
      setServices([...services, data.service]);

      toast({
        title: "添加成功",
        description: "服务已成功添加",
      });

      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      console.error('添加服务出错:', error);
      toast({
        title: "添加失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    }
  };

  const handleEditService = async () => {
    try {
      const response = await fetch(`/api/admin/services/${currentServiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('更新服务失败');
      }

      const data = await response.json();

      setServices(services.map(service =>
        service.id === currentServiceId ? { ...data.service } : service
      ));

      toast({
        title: "更新成功",
        description: "服务信息已更新",
      });

      setShowEditDialog(false);
      resetForm();
    } catch (error) {
      console.error('更新服务出错:', error);
      toast({
        title: "更新失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除服务失败');
      }

      setServices(services.filter(service => service.id !== id));

      toast({
        title: "删除成功",
        description: "服务已成功删除",
      });

      setDeleteConfirmId(null);
    } catch (error) {
      console.error('删除服务出错:', error);
      toast({
        title: "删除失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (service: Service) => {
    setCurrentServiceId(service.id);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      imageUrl: service.imageUrl,
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      imageUrl: '',
    });
    setCurrentServiceId('');
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
          <h1 className="text-2xl font-bold text-gray-900">服务管理</h1>
          <div className="flex gap-4">
            <Button onClick={() => {
              resetForm();
              setShowAddDialog(true);
            }}>
              添加服务
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
              返回仪表盘
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 relative">
                {service.imageUrl ? (
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    layout="fill"
                    objectFit="cover"
                  />
                ) : (
                  <div className="h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">无图片</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">{service.name}</h2>
                  <div className="text-xl font-bold text-indigo-600">¥{service.price}</div>
                </div>
                <p className="text-gray-600 mt-2 text-sm h-16 overflow-hidden">
                  {service.description}
                </p>
                <div className="text-sm text-gray-500 mt-2">
                  服务时长: {service.duration} 分钟
                </div>
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => openEditDialog(service)}>
                    编辑
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteConfirmId(service.id)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">暂无服务数据</p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              添加服务
            </Button>
          </div>
        )}
      </main>

      {/* 添加服务对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加服务</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">服务名称</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="例如：精致剪发"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">服务描述</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="服务详细描述..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">价格 (元)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  min={0}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">时长 (分钟)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min={5}
                  step={5}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">图片URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddService}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑服务对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑服务</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">服务名称</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">服务描述</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">价格 (元)</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  min={0}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-duration">时长 (分钟)</Label>
                <Input
                  id="edit-duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min={5}
                  step={5}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-imageUrl">图片URL</Label>
              <Input
                id="edit-imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleEditService}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>确定要删除此服务吗？此操作不可撤销。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteService(deleteConfirmId)}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
