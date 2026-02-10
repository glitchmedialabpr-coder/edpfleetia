import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Truck, Building2, ShoppingCart, BarChart3, Plus } from 'lucide-react';
import StudentsManagement from '@/components/crm/StudentsManagement';
import DriversManagement from '@/components/crm/DriversManagement';
import SuppliersManagement from '@/components/crm/SuppliersManagement';
import CRMReports from '@/components/crm/CRMReports';
import { useAuth } from '@/components/auth/AuthContext';

export default function CRM() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('students');

  // Fetch statistics
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
    enabled: !!user && !loading,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
    enabled: !!user && !loading,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list(),
    enabled: !!user && !loading,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">CRM</h1>
        <p className="text-slate-600 dark:text-slate-400">Gestiona información de estudiantes, conductores y proveedores</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Estudiantes</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{students.length}</p>
              </div>
              <Users className="w-12 h-12 text-blue-200 dark:text-blue-800" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 dark:border-teal-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Conductores</p>
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{drivers.length}</p>
              </div>
              <Truck className="w-12 h-12 text-teal-200 dark:text-teal-800" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Proveedores</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{suppliers.length}</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-purple-200 dark:text-purple-800" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Reportes</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">3</p>
              </div>
              <BarChart3 className="w-12 h-12 text-amber-200 dark:text-amber-800" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Estudiantes</span>
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Conductores</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Proveedores</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Reportes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <StudentsManagement />
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <DriversManagement />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <SuppliersManagement />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <CRMReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}