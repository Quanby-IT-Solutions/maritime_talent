'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordChangeForm } from '@/components/password-change-form';
import { useSession } from '@/lib/auth-queries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountPage() {
  const { data: user, isLoading } = useSession();

  // Function to get user initials for fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-4 max-w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* User Information Card */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              View and manage your personal details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex items-center space-x-6">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || user?.email || 'User')}&background=0D8ABC&color=fff`} 
                      alt={user?.full_name || user?.email || 'User'} 
                    />
                    <AvatarFallback className="text-lg">
                      {user ? getInitials(user.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold truncate">
                      {user?.full_name || 'Name not provided'}
                    </h2>
                    <p className="text-muted-foreground mt-1 truncate">
                      {user?.email || 'Email not provided'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Role: {user?.role || 'User'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password for better security
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-1/3 mt-4" />
              </div>
            ) : (
              <PasswordChangeForm userId={user?.id} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
