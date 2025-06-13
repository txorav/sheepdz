// src/app/wilaya-admin/schedule/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Reservation {
  id: string;
  familyNotebookNumber: string;
  status: string;
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
      batchName: string;
    };
  };
  payment?: {
    status: string;
    amount: number;
  };
}

interface Distribution {
  id: string;
  pickedUpAt: string | null;
  confirmedBy: string | null;
  reservation: Reservation;
}

export default function WilayaAdminSchedulePage() {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [eligibleReservations, setEligibleReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [scheduleForm, setScheduleForm] = useState({
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '09:00',
    location: '',
    sendReminders: true,
  });

  useEffect(() => {
    fetchSchedules();
    fetchEligibleReservations();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSchedules();
    }
  }, [selectedDate]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`/api/wilaya-admin/schedule?date=${selectedDate}`);
      const data = await response.json();

      if (response.ok) {
        setDistributions(data.distributions);
      } else {
        setError(data.error || 'Failed to fetch schedules');
      }
    } catch (err) {
      setError('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleReservations = async () => {
    try {
      const response = await fetch('/api/wilaya-admin/reservations?status=CONFIRMED');
      const data = await response.json();

      if (response.ok) {
        // Filter reservations that don't have pickup scheduled yet
        const unscheduled = data.reservations.filter((res: any) => 
          !res.distribution || !res.distribution.pickedUpAt
        );
        setEligibleReservations(unscheduled);
      }
    } catch (err) {
      console.error('Failed to fetch eligible reservations:', err);
    }
  };

  const handleCreateSchedule = async () => {
    if (selectedReservations.length === 0) {
      setError('Please select at least one reservation to schedule');
      return;
    }

    if (!scheduleForm.location.trim()) {
      setError('Please enter a pickup location');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/wilaya-admin/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...scheduleForm,
          reservationIds: selectedReservations,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowScheduleDialog(false);
        setSelectedReservations([]);
        setScheduleForm({
          pickupDate: new Date().toISOString().split('T')[0],
          pickupTime: '09:00',
          location: '',
          sendReminders: true,
        });
        fetchSchedules();
        fetchEligibleReservations();
        setError('');
      } else {
        setError(data.error || 'Failed to create schedule');
      }
    } catch (err) {
      setError('Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const toggleReservationSelection = (reservationId: string) => {
    setSelectedReservations(prev =>
      prev.includes(reservationId)
        ? prev.filter(id => id !== reservationId)
        : [...prev, reservationId]
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Pickup Scheduling</h1>
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogTrigger asChild>
            <Button>Schedule Pickup</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Pickup for Multiple Reservations</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Schedule Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupDate">Pickup Date</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    value={scheduleForm.pickupDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, pickupDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pickupTime">Pickup Time</Label>
                  <Input
                    id="pickupTime"
                    type="time"
                    value={scheduleForm.pickupTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, pickupTime: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="location">Pickup Location</Label>
                <Textarea
                  id="location"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                  placeholder="Enter detailed pickup location..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendReminders"
                  checked={scheduleForm.sendReminders}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, sendReminders: e.target.checked })}
                />
                <Label htmlFor="sendReminders">Send pickup reminders to customers</Label>
              </div>

              {/* Eligible Reservations */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Select Reservations ({selectedReservations.length} selected)
                </h3>
                <div className="max-h-64 overflow-y-auto border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Family Notebook</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eligibleReservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedReservations.includes(reservation.id)}
                              onChange={() => toggleReservationSelection(reservation.id)}
                            />
                          </TableCell>
                          <TableCell>{reservation.user.name}</TableCell>
                          <TableCell>{reservation.familyNotebookNumber}</TableCell>
                          <TableCell>{reservation.wilayaAllocation.sheepImport.batchName}</TableCell>
                          <TableCell>
                            {reservation.payment ? (
                              <Badge variant={reservation.payment.status === 'PAID' ? 'default' : 'secondary'}>
                                {reservation.payment.status}
                              </Badge>
                            ) : (
                              <Badge variant="outline">No Payment</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateSchedule}
                  disabled={selectedReservations.length === 0 || loading}
                >
                  Schedule Pickup
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
      )}

      {/* Date Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="dateFilter">View schedules for:</Label>
            <Input
              id="dateFilter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Pickups */}
      <Card>
        <CardHeader>
          <CardTitle>
            Scheduled Pickups for {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading schedules...</div>
          ) : distributions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pickups scheduled for this date.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Family Notebook</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributions.map((distribution) => (
                  <TableRow key={distribution.id}>
                    <TableCell>
                      {distribution.pickedUpAt ? 
                        new Date(distribution.pickedUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : 'TBD'
                      }
                    </TableCell>
                    <TableCell>{distribution.reservation.user.name}</TableCell>
                    <TableCell>{distribution.reservation.familyNotebookNumber}</TableCell>
                    <TableCell>{distribution.reservation.wilayaAllocation.sheepImport.batchName}</TableCell>
                    <TableCell>
                      {distribution.reservation.payment ? (
                        <Badge variant={distribution.reservation.payment.status === 'PAID' ? 'default' : 'secondary'}>
                          {distribution.reservation.payment.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No Payment</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Scheduled</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
