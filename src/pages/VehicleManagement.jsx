import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Fuel, Wrench, AlertTriangle, ShoppingCart } from 'lucide-react';

// Import the individual page components (we'll reuse them as tabs)
import Vehicles from './Vehicles';
import FuelRecords from './FuelRecords';
import Maintenance from './Maintenance';
import Accidents from './Accidents';
import Purchases from './Purchases';

export default function VehicleManagement() {
  const [activeTab, setActiveTab] = useState('vehicles');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Gestión de Vehículos</h1>
        <p className="text-slate-500 mt-1">Administra toda la información relacionada con vehículos</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1">
          <TabsTrigger value="vehicles" className="flex items-center gap-2 py-3">
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">Vehículos</span>
          </TabsTrigger>
          <TabsTrigger value="fuel" className="flex items-center gap-2 py-3">
            <Fuel className="w-4 h-4" />
            <span className="hidden sm:inline">Combustible</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2 py-3">
            <Wrench className="w-4 h-4" />
            <span className="hidden sm:inline">Mantenimiento</span>
          </TabsTrigger>
          <TabsTrigger value="accidents" className="flex items-center gap-2 py-3">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Accidentes</span>
          </TabsTrigger>
          <TabsTrigger value="purchases" className="flex items-center gap-2 py-3">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Compras</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="mt-0">
          <Vehicles />
        </TabsContent>

        <TabsContent value="fuel" className="mt-0">
          <FuelRecords />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-0">
          <Maintenance />
        </TabsContent>

        <TabsContent value="accidents" className="mt-0">
          <Accidents />
        </TabsContent>

        <TabsContent value="purchases" className="mt-0">
          <Purchases />
        </TabsContent>
      </Tabs>
    </div>
  );
}