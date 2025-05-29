import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import UserCard from './UserCard';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const API_URL = import.meta.env.VITE_API_URL;

interface AdminUsersListProps {
  users: any[];
  refetchUsers: () => void;
  title?: string;
  role?: string;
}

const AdminUsersList: React.FC<AdminUsersListProps> = ({ users, refetchUsers, title = "Users", role }) => {
  const { toast } = useToast();
  const token = localStorage.getItem('auth_token');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [editRowId, setEditRowId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteRowId, setDeleteRowId] = useState<string | number | null>(null);
  const itemsPerPage = 6;

  const filteredUsers = role ? users.filter(user => user.role === role) : users;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteUser = async (userId: string | number) => {
    if (!token) {
      toast({
        title: 'Authentication Error',
        description: 'No authentication token found. Please log in.',
        variant: 'destructive',
      });
      return;
    }

    if (!userId || (typeof userId !== 'string' && typeof userId !== 'number')) {
      toast({
        title: 'Error',
        description: 'Invalid user ID provided.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/users/${Number(userId)}`, { headers });
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      refetchUsers();
    } catch (error: any) {
      let errorMessage = 'Failed to delete user';
      if (error.response?.status === 404) {
        errorMessage = 'User not found';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Invalid request';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized: Invalid or expired token';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden: You do not have permission to delete this user';
      } else if (error.response?.status === 500) {
        errorMessage = error.response?.data?.error || 'Server error: Unable to delete user';
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
    setDeleteRowId(null);
  };

  const handleUpdateUser = async (userId: string | number, updatedData: any) => {
    if (!token) {
      toast({
        title: 'Authentication Error',
        description: 'No authentication token found. Please log in.',
        variant: 'destructive',
      });
      return;
    }

    if (!userId || (typeof userId !== 'string' && typeof userId !== 'number')) {
      toast({
        title: 'Error',
        description: 'Invalid user ID provided.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API_URL}/users/${Number(userId)}`, updatedData, { headers });
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      refetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update user',
        variant: 'destructive',
      });
    }
    setEditRowId(null);
  };

  const handleEditClick = (user: any) => {
    setEditRowId(user.id);
    setEditForm({
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role ?? "",
      phone: user.phone ?? "",
      password: "",
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = (userId: string | number) => {
    handleUpdateUser(userId, {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      phone: editForm.phone,
      password: editForm.password || undefined,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <CardTitle>
          {title} ({filteredUsers.length})
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'card' ? 'default' : 'outline'}
            onClick={() => setViewMode('card')}
          >
            Card View
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500">No users found.</p>
        ) : (
          <>
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onDelete={handleDeleteUser}
                    onUpdate={handleUpdateUser}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 border">Name</th>
                      <th className="px-3 py-2 border">Email</th>
                      <th className="px-3 py-2 border">Role</th>
                      <th className="px-3 py-2 border">Phone</th>
                      <th className="px-3 py-2 border">Password</th>
                      <th className="px-3 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
                      <tr key={user.id}>
                        {editRowId === user.id ? (
                          <>
                            <td className="px-3 py-2 border">
                              <Input
                                name="name"
                                value={editForm.name ?? ""}
                                onChange={handleEditChange}
                                required
                              />
                            </td>
                            <td className="px-3 py-2 border">
                              <Input
                                name="email"
                                value={editForm.email ?? ""}
                                onChange={handleEditChange}
                                required
                              />
                            </td>
                            <td className="px-3 py-2 border">
                              <select
                                name="role"
                                value={editForm.role ?? ""}
                                onChange={handleEditChange}
                                className="w-full border rounded p-1"
                                required
                              >
                                <option value="">Select role</option>
                                <option value="admin">Admin</option>
                                <option value="driver">Driver</option>
                                <option value="employee">Employee</option>
                              </select>
                            </td>
                            <td className="px-3 py-2 border">
                              <Input
                                name="phone"
                                value={editForm.phone ?? ""}
                                onChange={handleEditChange}
                              />
                            </td>
                            <td className="px-3 py-2 border">
                              <Input
                                name="password"
                                value={editForm.password ?? ""}
                                onChange={handleEditChange}
                                placeholder="New Password (optional)"
                                type="password"
                              />
                            </td>
                            <td className="px-3 py-2 border flex gap-2">
                              <Button size="sm" onClick={() => handleEditSave(user.id)}>
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditRowId(null)}
                              >
                                Cancel
                              </Button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2 border">{user.name}</td>
                            <td className="px-3 py-2 border">{user.email}</td>
                            <td className="px-3 py-2 border">{user.role}</td>
                            <td className="px-3 py-2 border">{user.phone || '-'}</td>
                            <td className="px-3 py-2 border">••••••</td>
                            <td className="px-3 py-2 border flex gap-2">
                              <Button
                                size="sm"
                                className="mr-2"
                                onClick={() => handleEditClick(user)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteRowId(user.id)}
                              >
                                Delete
                              </Button>
                              {/* Delete confirmation dialog */}
                              <Dialog open={deleteRowId === user.id} onOpenChange={(open) => !open && setDeleteRowId(null)}>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirm Delete</DialogTitle>
                                  </DialogHeader>
                                  <p>
                                    Are you sure you want to delete the user <strong>{user.name}</strong> ({user.email})?
                                  </p>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteRowId(null)}>
                                      Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                                      Delete
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsersList;