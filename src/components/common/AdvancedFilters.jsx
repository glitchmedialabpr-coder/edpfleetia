import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdvancedFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  filterOptions = {},
  isExpanded,
  onToggleExpanded,
  onClearAll
}) {
  const [activeFilters, setActiveFilters] = useState(filters || {});

  const handleFilterChange = (key, value) => {
    const updated = { ...activeFilters, [key]: value };
    setActiveFilters(updated);
    onFiltersChange?.(updated);
  };

  const handleRemoveFilter = (key) => {
    const updated = { ...activeFilters };
    delete updated[key];
    setActiveFilters(updated);
    onFiltersChange?.(updated);
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v && v !== 'all').length;

  return (
    <Card className="p-4 space-y-4">
      {/* Search Bar */}
      <div>
        <label className="text-xs text-slate-500 mb-2 block font-medium">Búsqueda Global</label>
        <Input
          type="text"
          placeholder="Buscar por nombre, descripción, etc..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Advanced Filters Toggle */}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={onToggleExpanded}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            Filtros Avanzados
            {activeFilterCount > 0 && (
              <span className="bg-teal-600 text-white text-xs rounded-full px-2 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Filters Options */}
      {isExpanded && Object.keys(filterOptions).length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          {Object.entries(filterOptions).map(([key, config]) => (
            <div key={key}>
              <label className="text-xs text-slate-600 mb-1 block font-medium">{config.label}</label>
              <Select
                value={activeFilters[key] || 'all'}
                onValueChange={(value) => handleFilterChange(key, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {config.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Date Range Filters */}
          {filterOptions.dateFrom && (
            <div>
              <label className="text-xs text-slate-600 mb-1 block font-medium">Desde</label>
              <Input
                type="date"
                value={activeFilters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
          )}

          {filterOptions.dateTo && (
            <div>
              <label className="text-xs text-slate-600 mb-1 block font-medium">Hasta</label>
              <Input
                type="date"
                value={activeFilters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value || value === 'all') return null;
            const label = filterOptions[key]?.label || key;
            return (
              <div
                key={key}
                className="flex items-center gap-1 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm"
              >
                <span>{label}: {value}</span>
                <button
                  onClick={() => handleRemoveFilter(key)}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-slate-500 hover:text-slate-700"
          >
            Limpiar Todo
          </Button>
        </div>
      )}
    </Card>
  );
}