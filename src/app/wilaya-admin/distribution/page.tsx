'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, MapPin, Clock, Plus, Users, PackageCheck } from 'lucide-react';

interface Distribution {
  id: string;
  scheduledDate: string;
  location: string;
  scheduledTime: string;
  status: string;
  description?: string;
  reservation?: {
    id: string;
    quantity: number;
    user: {
      name: string;
      email: string;
      familyNotebookNumber: string;
    };
    wilayaAllocation: {
      wilaya: {
        name: string;
      };
    };
    payment?: {
      method: string;
      status: string;
    };
  };
}

export default function WilayaAdminDistributionPage() {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDistribution, setNewDistribution] = useState({
    scheduledDate: '',
    location: '',
    scheduledTime: '',
    description: '',
  });

  useEffect(() => {
    fetchDistributions();
  }, [selectedStatus, selectedDate]);

  const fetchDistributions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') {
        params.append('status', selectedStatus);
      }
      if (selectedDate) {
        params.append('date', selectedDate);
      }

      const response = await fetch(`/api/wilaya-admin/distribution?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDistributions(data.distributions);
      }
    } catch (error) {
      console.error('Error fetching distributions:', error);
    }
    setLoading(false);
  };

  const createDistribution = async () => {
    try {
      const response = await fetch('/api/wilaya-admin/distribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDistribution),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        setNewDistribution({
          scheduledDate: '',
          location: '',
          scheduledTime: '',
          description: '',
        });
        await fetchDistributions();
      }
    } catch (error) {
      console.error('Error creating distribution:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: { variant: 'secondary' as const, label: 'Scheduled' },
      IN_PROGRESS: { variant: 'default' as const, label: 'In Progress' },
      COMPLETED: { variant: 'outline' as const, label: 'Completed' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const groupedDistributions = distributions.reduce((acc, distribution) => {
    const date = new Date(distribution.scheduledDate).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(distribution);
    return acc;
  }, {} as Record<string, Distribution[]>);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Distribution Management</h1>
            <p className="text-gray-600 mt-2">Manage pickup schedules and distribution events</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Distribution
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Distribution</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="scheduled-date">Date</Label>
                  <Input
                    id="scheduled-date"
                    type="date"
                    value={newDistribution.scheduledDate}
                    onChange={(e) => setNewDistribution({ ...newDistribution, scheduledDate: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newDistribution.location}
                    onChange={(e) => setNewDistribution({ ...newDistribution, location: e.target.value })}
                    placeholder="Enter distribution location"
                  />
                </div>
                
                <div>
                  <Label htmlFor="scheduled-time">Time</Label>
                  <Input
                    id="scheduled-time"
                    value={newDistribution.scheduledTime}
                    onChange={(e) => setNewDistribution({ ...newDistribution, scheduledTime: e.target.value })}
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newDistribution.description}
                    onChange={(e) => setNewDistribution({ ...newDistribution, description: e.target.value })}
                    placeholder="Additional details about this distribution event"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={createDistribution}
                    disabled={!newDistribution.scheduledDate || !newDistribution.location}
                  >
                    Schedule Distribution
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {distributions.filter(d => d.status === 'SCHEDULED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reservations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {distributions.filter(d => d.reservation).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <PackageCheck className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {distributions.filter(d => d.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date-filter">Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => {
                setSelectedStatus('ALL');
                setSelectedDate('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Distributions by Date */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">Loading distributions...</div>
          </CardContent>
        </Card>
      ) : Object.keys(groupedDistributions).length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-gray-500">No distributions found</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDistributions)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dayDistributions]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    <Badge variant="secondary">{dayDistributions.length} events</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dayDistributions.map((distribution) => (
                        <TableRow key={distribution.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              {distribution.scheduledTime || 'TBD'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              {distribution.location}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(distribution.status)}</TableCell>
                          <TableCell>
                            {distribution.reservation ? (
                              <div>
                                <div className="font-medium">{distribution.reservation.user.name}</div>
                                <div className="text-sm text-gray-500">
                                  Notebook: {distribution.reservation.user.familyNotebookNumber}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Quantity: {distribution.reservation.quantity}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">General Distribution</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {distribution.description && (
                              <div className="text-sm text-gray-600 max-w-xs truncate">
                                {distribution.description}
                              </div>
                            )}
                            {distribution.reservation?.payment && (
                              <div className="text-sm text-gray-500">
                                Payment: {distribution.reservation.payment.method} ({distribution.reservation.payment.status})
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
