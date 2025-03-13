'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
  });

  const [currentUserId, setCurrentUserId] = useState<string>('');

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

  // 获取用户数据
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('获取用户数据失败');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('获取用户数据出错:', error);
        toast({
          title: "获取用户数据失败",
          description: "请稍后再试",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '添加用户失败');
      }

      const data = await response.json();
      setUsers([...users, data.user]);

      toast({
        title: "添加成功",
        description: "用户已成功添加",
      });

      setShowAddDialog(false);
      resetForm();
    } catch (error: any) {
      console.error('添加用户出错:', error);
      toast({
        title: "添加失败",
        description: error.message || "请稍后再试",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async () => {
    try {
      // 编辑时不传递密码字段，除非有输入
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        ...(formData.password ? { password: formData.password } : {})
      };

      const response = await fetch(`/api/admin/users/${currentUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '更新用户失败');
      }

      const data = await response.json();

      setUsers(users.map(user =>
        user.id === currentUserId ? { ...data.user } : user
      ));

      toast({
        title: "更新成功",
        description: "用户信息已更新",
      });

      setShowEditDialog(false);
      resetForm();
    } catch (error: any) {
      console.error('更新用户出错:', error);
      toast({
        title: "更新失败",
        description: error.message || "请稍后再试",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '删除用户失败');
      }

      setUsers(users.filter(user => user.id !== id));

      toast({
        title: "删除成功",
        description: "用户已成功删除",
      });

      setDeleteConfirmId(null);
    } catch (error: any) {
      console.error('删除用户出错:', error);
      toast({
        title: "删除失败",
        description: error.message || "请稍后再试",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (user: User) => {
    setCurrentUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // 编辑时密码初始为空
      role: user.role,
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
    });
    setCurrentUserId('');
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
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <div className="flex gap-4">
            <Button onClick={() => {
              resetForm();
              setShowAddDialog(true);
            }}>
              添加用户
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
              返回仪表盘
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    邮箱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(user)}
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteConfirmId(user.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      暂无用户数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 添加用户对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加用户</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="用户姓名"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="设置密码"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">角色</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="staff">员工</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddUser}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑用户对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
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
              <Label htmlFor="edit-email">邮箱</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">
                密码
                <span className="text-xs text-gray-500 ml-2">
                  (留空表示不修改)
                </span>
              </Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="输入新密码或留空"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">角色</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="staff">员工</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleEditUser}>
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
            <p>确定要删除此用户吗？此操作不可撤销。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteUser(deleteConfirmId)}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
