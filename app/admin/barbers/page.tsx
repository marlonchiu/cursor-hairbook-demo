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

interface Barber {
  id: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string;
}

export default function BarbersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Barber, 'id'>>({
    name: '',
    title: '',
    description: '',
    imageUrl: '',
  });

  const [currentBarberId, setCurrentBarberId] = useState<string>('');

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

  // 获取理发师数据
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await fetch('/api/barbers');
        if (!response.ok) {
          throw new Error('获取理发师数据失败');
        }
        const data = await response.json();
        setBarbers(data.barbers);
      } catch (error) {
        console.error('获取理发师数据出错:', error);
        toast({
          title: "获取理发师数据失败",
          description: "请稍后再试",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBarbers();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddBarber = async () => {
    try {
      const response = await fetch('/api/admin/barbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('添加理发师失败');
      }

      const data = await response.json();
      setBarbers([...barbers, data.barber]);

      toast({
        title: "添加成功",
        description: "理发师已成功添加",
      });

      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      console.error('添加理发师出错:', error);
      toast({
        title: "添加失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    }
  };

  const handleEditBarber = async () => {
    try {
      const response = await fetch(`/api/admin/barbers/${currentBarberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('更新理发师失败');
      }

      const data = await response.json();

      setBarbers(barbers.map(barber =>
        barber.id === currentBarberId ? { ...data.barber } : barber
      ));

      toast({
        title: "更新成功",
        description: "理发师信息已更新",
      });

      setShowEditDialog(false);
      resetForm();
    } catch (error) {
      console.error('更新理发师出错:', error);
      toast({
        title: "更新失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBarber = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/barbers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除理发师失败');
      }

      setBarbers(barbers.filter(barber => barber.id !== id));

      toast({
        title: "删除成功",
        description: "理发师已成功删除",
      });

      setDeleteConfirmId(null);
    } catch (error) {
      console.error('删除理发师出错:', error);
      toast({
        title: "删除失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (barber: Barber) => {
    setCurrentBarberId(barber.id);
    setFormData({
      name: barber.name,
      title: barber.title,
      description: barber.description,
      imageUrl: barber.imageUrl,
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      description: '',
      imageUrl: '',
    });
    setCurrentBarberId('');
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
          <h1 className="text-2xl font-bold text-gray-900">理发师管理</h1>
          <div className="flex gap-4">
            <Button onClick={() => {
              resetForm();
              setShowAddDialog(true);
            }}>
              添加理发师
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
              返回仪表盘
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((barber) => (
            <div key={barber.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-52 relative flex justify-center items-center">
                {barber.imageUrl ? (
                  <div className="h-40 w-40 rounded-full overflow-hidden relative">
                    <Image
                      src={barber.imageUrl}
                      alt={barber.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 w-40 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">无图片</span>
                  </div>
                )}
              </div>
              <div className="p-4 text-center">
                <h2 className="text-xl font-semibold">{barber.name}</h2>
                <div className="text-indigo-600 font-medium mt-1">{barber.title}</div>
                <p className="text-gray-600 mt-3 text-sm h-20 overflow-hidden">
                  {barber.description}
                </p>
                <div className="mt-4 flex justify-center gap-4">
                  <Button variant="outline" onClick={() => openEditDialog(barber)}>
                    编辑
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteConfirmId(barber.id)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {barbers.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">暂无理发师数据</p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              添加理发师
            </Button>
          </div>
        )}
      </main>

      {/* 添加理发师对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加理发师</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="例如：王明"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">职位</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="例如：高级发型师"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">简介</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="理发师简介..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">头像URL</Label>
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
            <Button onClick={handleAddBarber}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑理发师对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑理发师</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">姓名</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-title">职位</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">简介</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-imageUrl">头像URL</Label>
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
            <Button onClick={handleEditBarber}>
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
            <p>确定要删除此理发师吗？此操作不可撤销。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteBarber(deleteConfirmId)}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
