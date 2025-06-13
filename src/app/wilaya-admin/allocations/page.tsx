'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Calendar, Package, TrendingUp, AlertCircle } from 'lucide-react';

interface WilayaAllocation {
  id: string;
  allocatedQuantity: number;
  remainingQuantity: number;
  createdAt: string;
  sheepImport: {
    id: string;
    importDate: string;
    totalQuantity: number;
    pricePerSheep: number;
    origin: string;
    status: string;
  };
  reservations: Array<{
    id: string;
    quantity: number;
    status: string;
    user: {
      name: string;
      familyNotebookNumber: string;
    };
  }>;
}

export default function WilayaAdminAllocationsPage() {
  const [allocations, setAllocations] = useState<WilayaAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAllocation, setSelectedAllocation] = useState<WilayaAllocation | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wilaya-admin/allocations');
      if (response.ok) {
        const data = await response.json();
        setAllocations(data.allocations);
      }
    } catch (error) {
      console.error('Error fetching allocations:', error);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      ACTIVE: { variant: 'default' as const, label: 'Active' },
      COMPLETED: { variant: 'outline' as const, label: 'Completed' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getUtilizationPercentage = (allocation: WilayaAllocation) => {
    return ((allocation.allocatedQuantity - allocation.remainingQuantity) / allocation.allocatedQuantity) * 100;
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Calculate summary statistics
  const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.allocatedQuantity, 0);
  const totalRemaining = allocations.reduce((sum, allocation) => sum + allocation.remainingQuantity, 0);
  const totalReserved = totalAllocated - totalRemaining;
  const averageUtilization = totalAllocated > 0 ? (totalReserved / totalAllocated) * 100 : 0;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Allocation Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage sheep allocations for your wilaya</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Allocated</p>
                <p className="text-2xl font-bold text-gray-900">{totalAllocated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Reserved</p>
                <p className="text-2xl font-bold text-gray-900">{totalReserved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Remaining</p>
                <p className="text-2xl font-bold text-gray-900">{totalRemaining}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Utilization</p>
                <p className={`text-2xl font-bold ${getUtilizationColor(averageUtilization)}`}>
                  {averageUtilization.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Wilaya Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading allocations...</div>
          ) : allocations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No allocations found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Import Batch</TableHead>
                  <TableHead>Import Date</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Allocated</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((allocation) => {
                  const utilizationPercentage = getUtilizationPercentage(allocation);
                  const reserved = allocation.allocatedQuantity - allocation.remainingQuantity;
                  
                  return (
                    <TableRow key={allocation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">Batch #{allocation.sheepImport.id.slice(-6)}</div>
                          <div className="text-sm text-gray-500">
                            {allocation.sheepImport.pricePerSheep} DZD per sheep
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(allocation.sheepImport.importDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{allocation.sheepImport.origin}</TableCell>
                      <TableCell>
                        <span className="font-medium">{allocation.allocatedQuantity}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-blue-600">{reserved}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${allocation.remainingQuantity === 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {allocation.remainingQuantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`font-medium ${getUtilizationColor(utilizationPercentage)}`}>
                            {utilizationPercentage.toFixed(1)}%
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                utilizationPercentage >= 80 ? 'bg-red-500' :
                                utilizationPercentage >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(allocation.sheepImport.status)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAllocation(allocation);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Allocation Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Allocation Details</DialogTitle>
          </DialogHeader>
          {selectedAllocation && (
            <div className="space-y-6">
              {/* Allocation Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="font-semibold">Import Batch Information</Label>
                  <div className="mt-2 space-y-2">
                    <div>Batch ID: #{selectedAllocation.sheepImport.id.slice(-6)}</div>
                    <div>Import Date: {new Date(selectedAllocation.sheepImport.importDate).toLocaleDateString()}</div>
                    <div>Origin: {selectedAllocation.sheepImport.origin}</div>
                    <div>Price per Sheep: {selectedAllocation.sheepImport.pricePerSheep} DZD</div>
                    <div>Total Batch Quantity: {selectedAllocation.sheepImport.totalQuantity}</div>
                    <div>Status: {getStatusBadge(selectedAllocation.sheepImport.status)}</div>
                  </div>
                </div>
                
                <div>
                  <Label className="font-semibold">Allocation Summary</Label>
                  <div className="mt-2 space-y-2">
                    <div>Allocated to Wilaya: {selectedAllocation.allocatedQuantity}</div>
                    <div>Reserved: {selectedAllocation.allocatedQuantity - selectedAllocation.remainingQuantity}</div>
                    <div>Remaining: {selectedAllocation.remainingQuantity}</div>
                    <div>Utilization: {getUtilizationPercentage(selectedAllocation).toFixed(1)}%</div>
                    <div>Allocation Date: {new Date(selectedAllocation.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Reservations */}
              <div>
                <Label className="font-semibold">Reservations ({selectedAllocation.reservations.length})</Label>
                {selectedAllocation.reservations.length > 0 ? (
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Family Notebook</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedAllocation.reservations.map((reservation) => (
                          <TableRow key={reservation.id}>
                            <TableCell>{reservation.user.name}</TableCell>
                            <TableCell>{reservation.user.familyNotebookNumber}</TableCell>
                            <TableCell>{reservation.quantity}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  reservation.status === 'CONFIRMED' ? 'default' :
                                  reservation.status === 'REJECTED' ? 'destructive' :
                                  reservation.status === 'PICKED_UP' ? 'outline' : 'secondary'
                                }
                              >
                                {reservation.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-gray-50 rounded text-center text-gray-500">
                    No reservations yet for this allocation
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
