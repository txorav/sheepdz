
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { 
  Users, 
  ShoppingCart, 
  MapPin, 
  TrendingUp, 
  CheckCircle,
  DollarSign,
  Package,
  Clock,
  BarChart3
} from "lucide-react";

export default async function AdminDashboardPage() {
  // Fetch dashboard statistics
  const [
    totalUsers,
    totalCustomers,
    totalWilayaAdmins,
    totalReservations,
    totalSheepImports,
    totalWilayas,
    pendingReservations,
    confirmedReservations,
    totalPayments,
    recentImports,
    recentReservations
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'WILAYA_ADMIN' } }),
    prisma.reservation.count(),
    prisma.sheepImport.count(),
    prisma.wilaya.count(),
    prisma.reservation.count({ where: { status: 'PENDING' } }),
    prisma.reservation.count({ where: { status: 'CONFIRMED' } }),
    prisma.payment.count({ where: { status: 'PAID' } }),
    prisma.sheepImport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.reservation.findMany({
      include: {
        user: true,
        wilayaAllocation: {
          include: {
            wilaya: true,
            sheepImport: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ARRIVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'DISTRIBUTED': return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'PICKED_UP': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">System Administration</h1>
        <p className="text-blue-100">Monitor and manage the sheep distribution system across Algeria</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-3xl font-bold text-blue-900">{totalUsers}</p>
                <p className="text-xs text-blue-700 mt-1">
                  {totalCustomers} customers, {totalWilayaAdmins} admins
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Reservations</p>
                <p className="text-3xl font-bold text-green-900">{totalReservations}</p>
                <p className="text-xs text-green-700 mt-1">
                  {confirmedReservations} confirmed
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Import Batches</p>
                <p className="text-3xl font-bold text-purple-900">{totalSheepImports}</p>
                <p className="text-xs text-purple-700 mt-1">
                  Across {totalWilayas} wilayas
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Payments</p>
                <p className="text-3xl font-bold text-orange-900">{totalPayments}</p>
                <p className="text-xs text-orange-700 mt-1">
                  {pendingReservations} pending
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Button asChild className="h-auto p-6 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Link href="/admin/users" className="flex flex-col items-center space-y-2">
            <Users className="w-8 h-8" />
            <span className="font-medium">Manage Users</span>
          </Link>
        </Button>

        <Button asChild className="h-auto p-6 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
          <Link href="/admin/imports" className="flex flex-col items-center space-y-2">
            <Package className="w-8 h-8" />
            <span className="font-medium">Import Management</span>
          </Link>
        </Button>

        <Button asChild className="h-auto p-6 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Link href="/admin/wilayas" className="flex flex-col items-center space-y-2">
            <MapPin className="w-8 h-8" />
            <span className="font-medium">Wilaya Management</span>
          </Link>
        </Button>

        <Button variant="outline" asChild className="h-auto p-6 border-2 border-orange-200 hover:bg-orange-50">
          <Link href="/tracking" className="flex flex-col items-center space-y-2">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <span className="font-medium text-orange-600">System Analytics</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Imports */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Recent Imports</span>
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/imports">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentImports.length === 0 ? (
              <div className="p-6 text-center">
                <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No imports yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentImports.map((importBatch) => (
                  <div key={importBatch.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">
                          {importBatch.batchName}
                        </p>
                        <p className="text-sm text-gray-500">
                          From {importBatch.originCountry}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(importBatch.importDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge className={getStatusColor(importBatch.status)}>
                          {importBatch.status}
                        </Badge>
                        <p className="text-sm font-medium text-gray-900">
                          {importBatch.totalQuantity.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reservations */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Recent Reservations</span>
              </span>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentReservations.length === 0 ? (
              <div className="p-6 text-center">
                <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No reservations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentReservations.map((reservation) => (
                  <div key={reservation.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">
                          {reservation.user.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {reservation.wilayaAllocation.wilaya.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(reservation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-sm font-medium text-gray-900">
                          Qty: {reservation.quantity}
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

      {/* System Health */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-medium text-gray-900">System Status</p>
              <p className="text-sm text-green-600">All systems operational</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="font-medium text-gray-900">Pending Actions</p>
              <p className="text-sm text-yellow-600">{pendingReservations} reservations</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <p className="font-medium text-gray-900">System Load</p>
              <p className="text-sm text-blue-600">Normal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
