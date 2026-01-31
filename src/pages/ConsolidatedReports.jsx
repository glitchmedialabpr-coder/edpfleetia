import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, TrendingUp, ShoppingCart } from 'lucide-react';
import DailyReports from './DailyReports';
import Reports from './Reports';
import PurchaseReports from './PurchaseReports';

export default function ConsolidatedReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Reportes</h1>
        <p className="text-slate-500 mt-1">Gestiona todos los reportes del sistema</p>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">
            <ClipboardList className="w-4 h-4 mr-2" />
            Diarios
          </TabsTrigger>
          <TabsTrigger value="general">
            <TrendingUp className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="purchases">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Compras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <DailyReports />
        </TabsContent>

        <TabsContent value="general">
          <Reports />
        </TabsContent>

        <TabsContent value="purchases">
          <PurchaseReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}