'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Reservation {
  id: string;
  quantity: number;
  status: string;
  familyNotebookNumber: string;
  createdAt: string;
  rejectionReason?: string;
  user: {
    id: string;
    name: string;
    email: string;
    familyNotebookNumber: string;
  };
  wilayaAllocation: {
    wilaya: {
      name: string;
      code: string;
    };
    sheepImport: {
      importDate: string;
      pricePerSheep: number;
    };
  };
  payment?: {
    method: string;
    amount: number;
    status: string;
  };
  distribution?: {
    scheduledDate?: string;
    location?: string;
    scheduledTime?: string;
    status: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function WilayaAdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [selectedStatus, currentPage]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/wilaya-admin/reservations?status=${selectedStatus}&page=${currentPage}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
    setLoading(false);
  };

  const handleReservationAction = async (id: string, status: string, additionalData: Record<string, unknown> = {}) => {
    try {
      const response = await fetch(`/api/wilaya-admin/reservations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          ...additionalData,
        }),
      });

      if (response.ok) {
        await fetchReservations();
        setShowConfirmDialog(false);
        setShowRejectDialog(false);
        setSelectedReservation(null);
        setRejectionReason('');
        setPickupDate('');
        setPickupLocation('');
        setPickupTime('');
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      CONFIRMED: { variant: 'default' as const, label: 'Confirmed' },
      REJECTED: { variant: 'destructive' as const, label: 'Rejected' },
      PICKED_UP: { variant: 'outline' as const, label: 'Picked Up' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      PAID: { variant: 'default' as const, label: 'Paid' },
      FAILED: { variant: 'destructive' as const, label: 'Failed' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Reservation Management</h1>
        <p className="text-gray-600 mt-2">Review and manage customer reservations for your wilaya</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reservations ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading reservations...</div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No reservations found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Family Notebook</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reservation.user.name}</div>
                          <div className="text-sm text-gray-500">{reservation.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{reservation.user.familyNotebookNumber}</TableCell>
                      <TableCell>{reservation.quantity}</TableCell>
                      <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                      <TableCell>
                        {reservation.payment ? (
                          <div>
                            {getPaymentStatusBadge(reservation.payment.status)}
                            <div className="text-sm text-gray-500 mt-1">
                              {reservation.payment.method} - {reservation.payment.amount} DZD
                            </div>
                          </div>
                        ) : (
                          <Badge variant="secondary">No Payment</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(reservation.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {reservation.status === 'PENDING' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedReservation(reservation);
                                  setShowConfirmDialog(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedReservation(reservation);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reservations
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reservation Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Customer Information</Label>
                  <div className="mt-2 space-y-1">
                    <div>Name: {selectedReservation.user.name}</div>
                    <div>Email: {selectedReservation.user.email}</div>
                    <div>Family Notebook: {selectedReservation.user.familyNotebookNumber}</div>
                  </div>
                </div>
                <div>
                  <Label className="font-semibold">Reservation Details</Label>
                  <div className="mt-2 space-y-1">
                    <div>Quantity: {selectedReservation.quantity}</div>
                    <div>Status: {getStatusBadge(selectedReservation.status)}</div>
                    <div>Date: {new Date(selectedReservation.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              {selectedReservation.payment && (
                <div>
                  <Label className="font-semibold">Payment Information</Label>
                  <div className="mt-2 space-y-1">
                    <div>Method: {selectedReservation.payment.method}</div>
                    <div>Amount: {selectedReservation.payment.amount} DZD</div>
                    <div>Status: {getPaymentStatusBadge(selectedReservation.payment.status)}</div>
                  </div>
                </div>
              )}

              {selectedReservation.distribution && (
                <div>
                  <Label className="font-semibold">Distribution Information</Label>
                  <div className="mt-2 space-y-1">
                    {selectedReservation.distribution.scheduledDate && (
                      <div>Scheduled Date: {new Date(selectedReservation.distribution.scheduledDate).toLocaleDateString()}</div>
                    )}
                    {selectedReservation.distribution.location && (
                      <div>Location: {selectedReservation.distribution.location}</div>
                    )}
                    {selectedReservation.distribution.scheduledTime && (
                      <div>Time: {selectedReservation.distribution.scheduledTime}</div>
                    )}
                  </div>
                </div>
              )}

              {selectedReservation.rejectionReason && (
                <div>
                  <Label className="font-semibold">Rejection Reason</Label>
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                    {selectedReservation.rejectionReason}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Reservation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Reservation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to confirm this reservation?</p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="pickup-date">Pickup Date (Optional)</Label>
                <Input
                  id="pickup-date"
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="pickup-location">Pickup Location (Optional)</Label>
                <Input
                  id="pickup-location"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Enter pickup location"
                />
              </div>
              
              <div>
                <Label htmlFor="pickup-time">Pickup Time (Optional)</Label>
                <Input
                  id="pickup-time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedReservation) {
                    handleReservationAction(selectedReservation.id, 'CONFIRMED', {
                      pickupDate: pickupDate || undefined,
                      pickupLocation: pickupLocation || undefined,
                      pickupTime: pickupTime || undefined,
                    });
                  }
                }}
              >
                Confirm Reservation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Reservation Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Reservation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Please provide a reason for rejecting this reservation:</p>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="min-h-20"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedReservation && rejectionReason.trim()) {
                    handleReservationAction(selectedReservation.id, 'REJECTED', {
                      rejectionReason: rejectionReason.trim(),
                    });
                  }
                }}
                disabled={!rejectionReason.trim()}
              >
                Reject Reservation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
