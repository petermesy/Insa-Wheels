
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { User, Trash2, Edit } from 'lucide-react';

// User form schema
const userFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['admin', 'driver', 'employee']),
  phone: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserCardProps {
  user: any;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onDelete, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const token = localStorage.getItem('auth_token');

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
    },
  });

  const handleEdit = () => {
    setIsDialogOpen(true);
  };

  const handleUpdate = async (data: UserFormData) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`http://localhost:4000/api/users/${user.id}`, data, { headers });
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      setIsDialogOpen(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      onDelete(user.id);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center gap-2">
            <User className="text-purple-600" size={20} />
            {user.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Role:</span>
              <Badge variant={user.role === 'admin' ? 'default' : user.role === 'driver' ? 'secondary' : 'outline'}>
                {user.role}
              </Badge>
            </div>
            {user.phone && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Phone:</span>
                <span className="text-sm">{user.phone}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-gray-50 p-2 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit} className="flex items-center gap-1">
            <Edit size={14} />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="flex items-center gap-1">
            <Trash2 size={14} />
            Delete
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password (Leave blank to keep current)</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="driver">Driver</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserCard;
