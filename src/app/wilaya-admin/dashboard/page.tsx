import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Users, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Truck,
  AlertTriangle,
  BarChart3,
  Calendar,
  ShoppingCart
} from "lucide-react";

export default async function WilayaAdminDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.wilayaId) {
    return <div>Error: Wilaya assignment not found</div>;
  }

  // Fetch wilaya-specific data
  const wilayaAllocations = await prisma.wilayaAllocation.findMany({
    where: {
      wilayaId: session.user.wilayaId,
    },
    include: {
      sheepImport: true,
      reservations: {
        include: {
          user: true,
          payment: true,
        },
      },
    },
  });

  // Calculate statistics
  const totalAllocated = wilayaAllocations.reduce((sum, allocation) => sum + allocation.allocatedQuantity, 0);
  const totalRemaining = wilayaAllocations.reduce((sum, allocation) => sum + allocation.remainingQuantity, 0);
  const totalReserved = totalAllocated - totalRemaining;
  
  const allReservations = wilayaAllocations.flatMap(allocation => allocation.reservations);
  const pendingReservations = allReservations.filter(r => r.status === 'PENDING').length;
  const confirmedReservations = allReservations.filter(r => r.status === 'CONFIRMED').length;
  const pickedUpReservations = allReservations.filter(r => r.status === 'PICKED_UP').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PICKED_UP': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'ARRIVED': return 'bg-green-100 text-green-800';
      case 'DISTRIBUTED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Wilaya Dashboard - {session.user.wilaya?.name}
            </h1>
            <p className="text-purple-100">Manage sheep distribution for your region</p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <MapPin className="w-6 h-6" />
            <div className="text-right">
              <div className="font-medium">{session.user.wilaya?.code}</div>
              <div className="text-sm text-purple-100">Regional Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Allocated</p>
                <p className="text-3xl font-bold text-blue-900">{totalAllocated}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Reserved</p>
                <p className="text-3xl font-bold text-orange-900">{totalReserved}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Available</p>
                <p className="text-3xl font-bold text-green-900">{totalRemaining}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Pending Review</p>
                <p className="text-3xl font-bold text-red-900">{pendingReservations}</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Button asChild className="h-auto p-6 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Link href="/wilaya-admin/allocations" className="flex flex-col items-center space-y-2">
            <Package className="w-8 h-8" />
            <span className="font-medium">Manage Allocations</span>
          </Link>
        </Button>

        <Button asChild className="h-auto p-6 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
          <Link href="/wilaya-admin/reservations" className="flex flex-col items-center space-y-2">
            <Users className="w-8 h-8" />
            <span className="font-medium">Review Reservations</span>
          </Link>
        </Button>

        <Button asChild className="h-auto p-6 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Link href="/wilaya-admin/distribution" className="flex flex-col items-center space-y-2">
            <Truck className="w-8 h-8" />
            <span className="font-medium">Distribution Control</span>
          </Link>
        </Button>

        <Button variant="outline" asChild className="h-auto p-6 border-2 border-orange-200 hover:bg-orange-50">
          <Link href="/wilaya-admin/schedule" className="flex flex-col items-center space-y-2">
            <Calendar className="w-8 h-8 text-orange-600" />
            <span className="font-medium text-orange-600">Schedule Pickups</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Allocations */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Current Allocations</span>
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/wilaya-admin/allocations">Manage All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {wilayaAllocations.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No allocations yet</h3>
                  <p className="text-gray-500">Allocations will appear here once assigned by the system admin</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {wilayaAllocations.slice(0, 5).map((allocation) => (
                    <div key={allocation.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(allocation.sheepImport.status)}>
                              {allocation.sheepImport.status}
                            </Badge>
                          </div>
                          <p className="font-medium text-gray-900">
                            {allocation.sheepImport.batchName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Origin: {allocation.sheepImport.originCountry}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            Allocated: {allocation.allocatedQuantity}
                          </p>
                          <p className="text-sm text-green-600">
                            Available: {allocation.remainingQuantity}
                          </p>
                          <p className="text-xs text-gray-500">
                            Reserved: {allocation.allocatedQuantity - allocation.remainingQuantity}
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

        {/* Reservation Status Panel */}
        <div>
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Reservation Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <span className="font-bold text-yellow-600">{pendingReservations}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Confirmed</span>
                </div>
                <span className="font-bold text-green-600">{confirmedReservations}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Picked Up</span>
                </div>
                <span className="font-bold text-blue-600">{pickedUpReservations}</span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/wilaya-admin/reservations">
                    View All Reservations
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Health for Wilaya */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Regional Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-medium text-gray-900">Distribution Status</p>
              <p className="text-sm text-green-600">On track</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="font-medium text-gray-900">Pending Actions</p>
              <p className="text-sm text-yellow-600">{pendingReservations} reservations to review</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <p className="font-medium text-gray-900">Capacity</p>
              <p className="text-sm text-blue-600">
                {totalRemaining > 0 ? `${Math.round((totalReserved / totalAllocated) * 100)}% utilized` : 'Fully allocated'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
