import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Users,
  Mail,
  Bus,
  Loader2
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import { format } from 'date-fns';

export default function Drivers() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: ''
  });
  const [error, setError] = useState('');

  const { data: drivers = [], refetch } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.User.filter({ role: 'user' })
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['all-trips'],
    queryFn: () => base44.entities.Trip.list()
  });

  const filteredDrivers = drivers.filter(d => 
    d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getDriverStats = (driverId) => {
    const driverTrips = trips.filter(t => t.driver_id === driverId);
    const completed = driverTrips.filter(t => t.status === 'completed').length;
    return { total: driverTrips.length, completed };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await base44.users.inviteUser(formData.email, 'user');
      setModalOpen(false);
      setFormData({ email: '' });
      refetch();
    } catch (err) {
      setError('Error al enviar la invitación. Verifica el correo e intenta nuevamente.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Choferes</h1>
          <p className="text-slate-500 mt-1">Gestiona el equipo de choferes</p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Invitar Chofer
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {filteredDrivers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? "No se encontraron choferes" : "No hay choferes registrados"}
            description={search ? "Intenta con otra búsqueda" : "Invita a tu primer chofer para comenzar"}
            action={!search ? () => setModalOpen(true) : undefined}
            actionLabel="Invitar Chofer"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Chofer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Viajes Totales</TableHead>
                  <TableHead>Completados</TableHead>
                  <TableHead>Registrado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map(driver => {
                  const stats = getDriverStats(driver.id);
                  return (
                    <TableRow key={driver.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-teal-600">
                              {driver.full_name?.charAt(0) || driver.email?.charAt(0) || '?'}
                            </span>
                          </div>
                          <span className="font-medium text-slate-800">
                            {driver.full_name || 'Sin nombre'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {driver.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bus className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{stats.total}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          {stats.completed}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {driver.created_date ? format(new Date(driver.created_date), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Invite Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invitar Chofer</DialogTitle>
            <DialogDescription>
              Envía una invitación por correo electrónico para que el chofer pueda acceder al sistema.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ email: e.target.value })}
                placeholder="chofer@ejemplo.com"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Invitación'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}