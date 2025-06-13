import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Bell, 
  Plus,
  Truck,
  CreditCard,
  User,
  Calendar
} from "lucide-react";

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return <div>Error: User not found</div>;
  }

  // Fetch user's reservations
  const userReservations = await prisma.reservation.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      wilayaAllocation: {
        include: {
          wilaya: true,
          sheepImport: true,
        },
      },
      payment: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch notifications
  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      read: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
  });

  // Get statistics
  const totalReservations = userReservations.length;
  const activeReservations = userReservations.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING').length;
  const pickedUpReservations = userReservations.filter(r => r.status === 'PICKED_UP').length;
  const paidReservations = userReservations.filter(r => r.payment?.status === 'PAID').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PICKED_UP': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {session.user.name}!</h1>
            <p className="text-green-100">Manage your sheep reservations and track your orders</p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <User className="w-6 h-6" />
            <div className="text-right">
              <div className="font-medium">{session.user.email}</div>
              <div className="text-sm text-green-100">Customer Account</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Reservations</p>
                <p className="text-3xl font-bold text-blue-900">{totalReservations}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Orders</p>
                <p className="text-3xl font-bold text-green-900">{activeReservations}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Completed</p>
                <p className="text-3xl font-bold text-purple-900">{pickedUpReservations}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Paid Orders</p>
                <p className="text-3xl font-bold text-orange-900">{paidReservations}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Button asChild className="h-auto p-6 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
          <Link href="/customer/reserve" className="flex flex-col items-center space-y-2">
            <Plus className="w-8 h-8" />
            <span className="font-medium">New Reservation</span>
          </Link>
        </Button>

        <Button variant="outline" asChild className="h-auto p-6 border-2 border-blue-200 hover:bg-blue-50">
          <Link href="/customer/reservations" className="flex flex-col items-center space-y-2">
            <Truck className="w-8 h-8 text-blue-600" />
            <span className="font-medium text-blue-600">My Orders</span>
          </Link>
        </Button>

        <Button variant="outline" asChild className="h-auto p-6 border-2 border-purple-200 hover:bg-purple-50">
          <Link href="/customer/notifications" className="flex flex-col items-center space-y-2">
            <Bell className="w-8 h-8 text-purple-600" />
            <span className="font-medium text-purple-600">Notifications</span>
            {notifications.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {notifications.length}
              </Badge>
            )}
          </Link>
        </Button>

        <Button variant="outline" asChild className="h-auto p-6 border-2 border-orange-200 hover:bg-orange-50">
          <Link href="/tracking" className="flex flex-col items-center space-y-2">
            <MapPin className="w-8 h-8 text-orange-600" />
            <span className="font-medium text-orange-600">Track Distribution</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reservations */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Recent Reservations</span>
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/customer/reservations">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {userReservations.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No reservations yet</h3>
                  <p className="text-gray-500 mb-4">Start by making your first sheep reservation</p>
                  <Button asChild>
                    <Link href="/customer/reserve">Make Reservation</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {userReservations.slice(0, 5).map((reservation) => (
                    <div key={reservation.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(reservation.status)}>
                              {reservation.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {reservation.wilayaAllocation.wilaya.name}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900">
                            {reservation.wilayaAllocation.sheepImport.batchName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Origin: {reservation.wilayaAllocation.sheepImport.originCountry}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            Quantity: {reservation.quantity}
                          </p>
                          {reservation.payment && (
                            <Badge variant={reservation.payment.status === 'PAID' ? 'default' : 'secondary'}>
                              {reservation.payment.status}
                            </Badge>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(reservation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications Panel */}
        <div>
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Latest Updates</span>
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/customer/notifications">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}