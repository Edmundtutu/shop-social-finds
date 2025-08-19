import React, { useCallback, useState, useMemo } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { IngredientNode } from './nodes/IngredientNode';
import { ModifierNode } from './nodes/ModifierNode';
import { ProductNode } from './nodes/ProductNode';
import { CategoryNode } from './nodes/CategoryNode';
import { PriceEdge } from './edges/PriceEdge';
import { DynamicToolbar } from './DynamicToolbar';
import { InventoryStats } from './InventoryStats';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Grid3X3, Layers, Settings, Plus, Square, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const nodeTypes = {
  ingredient: IngredientNode,
  modifier: ModifierNode,
  product: ProductNode,
  category: CategoryNode,
};

const edgeTypes = {
  price: PriceEdge,
};

interface Layer {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  name: string;
}
const initialNodes: Node[] = [
  // Categories
  {
    id: 'cat-1',
    type: 'category',
    position: { x: 100, y: 50 },
    data: { 
      label: 'Local Dishes',
      color: '#4F46E5',
      itemCount: 3
    },
  },
  {
    id: 'cat-2',
    type: 'category',
    position: { x: 400, y: 50 },
    data: { 
      label: 'Beverages',
      color: '#059669',
      itemCount: 2
    },
  },

  // Products
  {
    id: 'prod-1',
    type: 'product',
    position: { x: 50, y: 200 },
    data: { 
      label: 'Adobo Rice Bowl',
      basePrice: 12.99,
      image: '🍛',
      available: true,
      category: 'cat-1'
    },
  },
  {
    id: 'prod-2',
    type: 'product',
    position: { x: 250, y: 200 },
    data: { 
      label: 'Grilled Fish',
      basePrice: 15.99,
      image: '🐟',
      available: true,
      category: 'cat-1'
    },
  },
  {
    id: 'prod-3',
    type: 'product',
    position: { x: 450, y: 200 },
    data: { 
      label: 'Fresh Juice',
      basePrice: 4.99,
      image: '🥤',
      available: true,
      category: 'cat-2'
    },
  },

  // Ingredients
  {
    id: 'ing-1',
    type: 'ingredient',
    position: { x: 50, y: 400 },
    data: { 
      label: 'Pork',
      stock: 50,
      unit: 'lbs',
      cost: 3.50,
      lowStockThreshold: 10
    },
  },
  {
    id: 'ing-2',
    type: 'ingredient',
    position: { x: 200, y: 400 },
    data: { 
      label: 'Rice',
      stock: 100,
      unit: 'cups',
      cost: 0.50,
      lowStockThreshold: 20
    },
  },
  {
    id: 'ing-3',
    type: 'ingredient',
    position: { x: 350, y: 400 },
    data: { 
      label: 'Fresh Fish',
      stock: 25,
      unit: 'lbs',
      cost: 8.00,
      lowStockThreshold: 5
    },
  },
  {
    id: 'ing-4',
    type: 'ingredient',
    position: { x: 500, y: 400 },
    data: { 
      label: 'Orange',
      stock: 80,
      unit: 'pieces',
      cost: 0.75,
      lowStockThreshold: 15
    },
  },

  // Modifiers
  {
    id: 'mod-1',
    type: 'modifier',
    position: { x: 100, y: 600 },
    data: { 
      label: 'Extra Protein',
      priceChange: 3.00,
      type: 'addon'
    },
  },
  {
    id: 'mod-2',
    type: 'modifier',
    position: { x: 300, y: 600 },
    data: { 
      label: 'Large Size',
      priceChange: 2.50,
      type: 'size'
    },
  },
  {
    id: 'mod-3',
    type: 'modifier',
    position: { x: 500, y: 600 },
    data: { 
      label: 'Extra Fresh',
      priceChange: 1.50,
      type: 'addon'
    },
  },
];

const initialEdges: Edge[] = [
  // Category connections
  { id: 'e-cat-prod-1', source: 'cat-1', target: 'prod-1', type: 'price', data: { relationship: 'contains' } },
  { id: 'e-cat-prod-2', source: 'cat-1', target: 'prod-2', type: 'price', data: { relationship: 'contains' } },
  { id: 'e-cat-prod-3', source: 'cat-2', target: 'prod-3', type: 'price', data: { relationship: 'contains' } },

  // Product-Ingredient connections
  { id: 'e-prod-ing-1', source: 'prod-1', target: 'ing-1', type: 'price', data: { relationship: 'requires', quantity: 0.5 } },
  { id: 'e-prod-ing-2', source: 'prod-1', target: 'ing-2', type: 'price', data: { relationship: 'requires', quantity: 1 } },
  { id: 'e-prod-ing-3', source: 'prod-2', target: 'ing-3', type: 'price', data: { relationship: 'requires', quantity: 0.75 } },
  { id: 'e-prod-ing-4', source: 'prod-2', target: 'ing-2', type: 'price', data: { relationship: 'requires', quantity: 1 } },
  { id: 'e-prod-ing-5', source: 'prod-3', target: 'ing-4', type: 'price', data: { relationship: 'requires', quantity: 3 } },

  // Modifier connections
  { id: 'e-mod-prod-1', source: 'mod-1', target: 'prod-1', type: 'price', data: { relationship: 'modifies' } },
  { id: 'e-mod-prod-2', source: 'mod-1', target: 'prod-2', type: 'price', data: { relationship: 'modifies' } },
  { id: 'e-mod-prod-3', source: 'mod-2', target: 'prod-3', type: 'price', data: { relationship: 'modifies' } },
  { id: 'e-mod-prod-4', source: 'mod-3', target: 'prod-3', type: 'price', data: { relationship: 'modifies' } },
];

export function DynamicInventoryFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState<string>('product');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [activeZone, setActiveZone] = useState<string>('all');
  const [activeTool, setActiveTool] = useState<string>('select');
  const [isCreatingLayer, setIsCreatingLayer] = useState(false);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selectedLayerColor, setSelectedLayerColor] = useState('#ef4444');
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [resizingLayer, setResizingLayer] = useState<{ layerId: string; handle: string } | null>(null);
  const [editingLayerName, setEditingLayerName] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `e-${params.source}-${params.target}`,
        type: 'price',
        data: { relationship: 'custom' }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const addNode = useCallback((type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 200 + 300 },
      data: getDefaultNodeData(type),
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  const toggleSectionCollapse = useCallback((section: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const getZoneNodes = useCallback((zone: string) => {
    if (zone === 'all') return nodes;
    return nodes.filter(node => {
      if (zone === 'categories' && node.type === 'category') return true;
      if (zone === 'products' && node.type === 'product') return true;
      if (zone === 'ingredients' && node.type === 'ingredient') return true;
      if (zone === 'modifiers' && node.type === 'modifier') return true;
      return false;
    });
  }, [nodes, activeZone]);

  const filteredNodes = useMemo(() => {
    const zoneNodes = getZoneNodes(activeZone);
    return zoneNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        collapsed: collapsedSections.has(node.type || ''),
        onToggleCollapse: () => toggleSectionCollapse(node.type || '')
      }
    }));
  }, [nodes, activeZone, collapsedSections, getZoneNodes, toggleSectionCollapse]);

  const stats = useMemo(() => {
    const products = nodes.filter(n => n.type === 'product');
    const ingredients = nodes.filter(n => n.type === 'ingredient');
    const lowStockItems = ingredients.filter(n => 
      typeof n.data.stock === 'number' && 
      typeof n.data.lowStockThreshold === 'number' && 
      n.data.stock <= n.data.lowStockThreshold
    );
    const totalValue = ingredients.reduce((sum, n) => {
      const stock = typeof n.data.stock === 'number' ? n.data.stock : 0;
      const cost = typeof n.data.cost === 'number' ? n.data.cost : 0;
      return sum + (stock * cost);
    }, 0);
    
    return {
      totalProducts: products.length,
      totalIngredients: ingredients.length,
      lowStockItems: lowStockItems.length,
      totalValue: totalValue
    };
  }, [nodes]);

  const updateLayer = useCallback((layerId: string, updates: Partial<Layer>) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  }, []);

  const deleteLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
    setSelectedLayer(null);
  }, []);
  const handleCanvasMouseDown = useCallback((event: React.MouseEvent) => {
    if (activeTool === 'layer') {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const startPos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      setDragStart(startPos);
      setCurrentMousePos(startPos);
      setIsCreatingLayer(true);
    }
  }, [activeTool]);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent) => {
    if (activeTool === 'layer' && isCreatingLayer && dragStart) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setCurrentMousePos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    }
  }, [activeTool, isCreatingLayer, dragStart]);

  const handleCanvasMouseUp = useCallback((event: React.MouseEvent) => {
    if (isCreatingLayer && dragStart) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const endX = event.clientX - rect.left;
      const endY = event.clientY - rect.top;
      
      const newLayer: Layer = {
        id: `layer-${Date.now()}`,
        x: Math.min(dragStart.x, endX),
        y: Math.min(dragStart.y, endY),
        width: Math.abs(endX - dragStart.x),
        height: Math.abs(endY - dragStart.y),
        color: selectedLayerColor,
        name: `Layer ${layers.length + 1}`,
      };
      
      if (newLayer.width > 10 && newLayer.height > 10) {
        setLayers(prev => [...prev, newLayer]);
      }
      
      setIsCreatingLayer(false);
      setDragStart(null);
      setCurrentMousePos(null);
      setActiveTool('select');
    }
  }, [isCreatingLayer, dragStart, selectedLayerColor]);

  const handleLayerMouseDown = useCallback((event: React.MouseEvent, layerId: string) => {
    event.stopPropagation();
    setSelectedLayer(layerId);
  }, []);

  const handleResizeStart = useCallback((event: React.MouseEvent, layerId: string, handle: string) => {
    event.stopPropagation();
    setResizingLayer({ layerId, handle });
    setSelectedLayer(layerId);
  }, []);

  const handleResizeMove = useCallback((event: React.MouseEvent) => {
    if (!resizingLayer) return;
    
    const layer = layers.find(l => l.id === resizingLayer.layerId);
    if (!layer) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let updates: Partial<Layer> = {};

    switch (resizingLayer.handle) {
      case 'nw':
        updates = {
          x: Math.min(mouseX, layer.x + layer.width - 20),
          y: Math.min(mouseY, layer.y + layer.height - 20),
          width: Math.max(20, layer.width + (layer.x - mouseX)),
          height: Math.max(20, layer.height + (layer.y - mouseY)),
        };
        break;
      case 'ne':
        updates = {
          y: Math.min(mouseY, layer.y + layer.height - 20),
          width: Math.max(20, mouseX - layer.x),
          height: Math.max(20, layer.height + (layer.y - mouseY)),
        };
        break;
      case 'sw':
        updates = {
          x: Math.min(mouseX, layer.x + layer.width - 20),
          width: Math.max(20, layer.width + (layer.x - mouseX)),
          height: Math.max(20, mouseY - layer.y),
        };
        break;
      case 'se':
        updates = {
          width: Math.max(20, mouseX - layer.x),
          height: Math.max(20, mouseY - layer.y),
        };
        break;
    }

    updateLayer(resizingLayer.layerId, updates);
  }, [resizingLayer, layers, updateLayer]);

  const handleResizeEnd = useCallback(() => {
    setResizingLayer(null);
  }, []);
  // Calculate preview layer dimensions
  const previewLayer = useMemo(() => {
    if (!isCreatingLayer || !dragStart || !currentMousePos) return null;
    
    return {
      x: Math.min(dragStart.x, currentMousePos.x),
      y: Math.min(dragStart.y, currentMousePos.y),
      width: Math.abs(currentMousePos.x - dragStart.x),
      height: Math.abs(currentMousePos.y - dragStart.y),
    };
  }, [isCreatingLayer, dragStart, currentMousePos]);

  return (
    <div className="h-screen bg-background relative">
      {/* Main Canvas Area */}
      <div className="h-full relative">
        {/* Layers */}
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`absolute border-2 border-dashed transition-all duration-200 ${
              selectedLayer === layer.id 
                ? 'opacity-60 border-solid shadow-lg z-20' 
                : 'opacity-30 hover:opacity-50 z-10'
            }`}
            style={{
              left: layer.x,
              top: layer.y,
              width: layer.width,
              height: layer.height,
              backgroundColor: layer.color,
              borderColor: layer.color,
              cursor: selectedLayer === layer.id ? 'move' : 'pointer',
            }}
            onMouseDown={(e) => handleLayerMouseDown(e, layer.id)}
          >
            {/* Layer Name */}
            <div className="absolute -top-6 left-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-auto">
              {editingLayerName === layer.id ? (
                <Input
                  value={layer.name}
                  onChange={(e) => updateLayer(layer.id, { name: e.target.value })}
                  onBlur={() => setEditingLayerName(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setEditingLayerName(null);
                  }}
                  className="h-5 text-xs w-20 bg-transparent border-none text-white p-0"
                  autoFocus
                />
              ) : (
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingLayerName(layer.id);
                  }}
                  className="cursor-text"
                >
                  {layer.name}
                </span>
              )}
            </div>

            {/* Resize Handles - only show when selected */}
            {selectedLayer === layer.id && (
              <>
                {/* Corner handles */}
                <div
                  className="absolute -top-1 -left-1 w-3 h-3 bg-white border-2 border-blue-500 cursor-nw-resize"
                  onMouseDown={(e) => handleResizeStart(e, layer.id, 'nw')}
                />
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-blue-500 cursor-ne-resize"
                  onMouseDown={(e) => handleResizeStart(e, layer.id, 'ne')}
                />
                <div
                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-2 border-blue-500 cursor-sw-resize"
                  onMouseDown={(e) => handleResizeStart(e, layer.id, 'sw')}
                />
                <div
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-blue-500 cursor-se-resize"
                  onMouseDown={(e) => handleResizeStart(e, layer.id, 'se')}
                />
              </>
            )}
          </div>
        ))}

        {/* Preview Layer (shown while dragging) */}
        {previewLayer && previewLayer.width > 5 && previewLayer.height > 5 && (
          <div
            className="absolute pointer-events-none border-2 border-dashed opacity-50 z-10"
            style={{
              left: previewLayer.x,
              top: previewLayer.y,
              width: previewLayer.width,
              height: previewLayer.height,
              backgroundColor: selectedLayerColor,
              borderColor: selectedLayerColor,
              boxShadow: `0 0 0 1px ${selectedLayerColor}40`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                {Math.round(previewLayer.width)} × {Math.round(previewLayer.height)}
              </span>
            </div>
          </div>
        )}

        {/* Zone Background Overlays */}
        {activeZone !== 'all' && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className={`h-full w-full ${
              activeZone === 'categories' ? 'bg-gradient-to-br from-violet-500/10 to-violet-300/5' :
              activeZone === 'products' ? 'bg-gradient-to-br from-blue-500/10 to-blue-300/5' :
              activeZone === 'ingredients' ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-300/5' :
              'bg-gradient-to-br from-amber-500/10 to-amber-300/5'
            }`} />
          </div>
        )}
        
        <div 
          className="h-full w-full"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          style={{
            cursor: activeTool === 'layer' 
              ? isCreatingLayer 
                ? 'crosshair' 
                : 'crosshair'
              : 'default'
          }}
        >
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="dynamic-inventory-flow"
            style={{ 
              backgroundColor: 'transparent',
            }}
          >
            <Controls className="bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-card" />
            <MiniMap 
              className="bg-card/90 backdrop-blur-sm border border-border rounded-lg"
              nodeColor={(node) => {
                switch (node.type) {
                  case 'product': return '#3B82F6';
                  case 'ingredient': return '#10B981';
                  case 'modifier': return '#F59E0B';
                  case 'category': return '#8B5CF6';
                  default: return '#6B7280';
                }
              }}
            />
            <Background gap={20} size={1} color="hsl(var(--border))" />
          </ReactFlow>
        </div>
      </div>

      {/* Right Collapsible Toolbar */}
      <div className="absolute top-4 right-4 z-50">
        <div className="flex items-center gap-2">
          {/* Collapsed Toolbar */}
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-lg p-2">
            <div className="flex flex-col gap-2">
              {/* Tool Icons */}
              <Button
                variant={activeTool === 'select' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setActiveTool('select')}
                className="h-8 w-8"
              >
                <Square className="h-4 w-4" />
              </Button>
              
              <Button
                variant={activeTool === 'layer' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setActiveTool('layer')}
                className="h-8 w-8"
              >
                <Layers className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => addNode(selectedNodeType)}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Expandable Panel */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80 overflow-y-auto max-h-screen">
              <div className="space-y-6 py-6">
                <InventoryStats stats={stats} />
                
                {/* Layer Management */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Layers ({layers.length})</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {layers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`p-2 rounded border cursor-pointer transition-colors ${
                          selectedLayer === layer.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedLayer(layer.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded border"
                              style={{ backgroundColor: layer.color }}
                            />
                            <span className="text-xs font-medium">{layer.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLayer(layer.id);
                            }}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            ×
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.round(layer.width)} × {Math.round(layer.height)}px
                        </div>
                      </div>
                    ))}
                    {layers.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-4">
                        No layers created yet
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Layer Settings</h3>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Layer Color</label>
                    <Select value={selectedLayerColor} onValueChange={setSelectedLayerColor}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="#ef4444">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-red-500" />
                            Critical (Red)
                          </div>
                        </SelectItem>
                        <SelectItem value="#10b981">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-emerald-500" />
                            Stable (Green)
                          </div>
                        </SelectItem>
                        <SelectItem value="#f59e0b">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-amber-500" />
                            Warning (Yellow)
                          </div>
                        </SelectItem>
                        <SelectItem value="#3b82f6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-500" />
                            Info (Blue)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Zone Focus</h3>
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { key: 'all', label: 'All Items', icon: Grid3X3 },
                      { key: 'categories', label: 'Categories', icon: Layers },
                      { key: 'products', label: 'Products', icon: Eye },
                      { key: 'ingredients', label: 'Ingredients', icon: Eye },
                      { key: 'modifiers', label: 'Modifiers', icon: Eye }
                    ].map(({ key, label, icon: Icon }) => (
                      <Button
                        key={key}
                        variant={activeZone === key ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveZone(key)}
                        className="justify-start text-xs h-8"
                      >
                        <Icon className="h-3 w-3 mr-2" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Section Controls</h3>
                  <div className="grid grid-cols-1 gap-1">
                    {['category', 'product', 'ingredient', 'modifier'].map((type) => (
                      <Button
                        key={type}
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSectionCollapse(type)}
                        className="justify-start text-xs h-8"
                      >
                        {collapsedSections.has(type) ? (
                          <EyeOff className="h-3 w-3 mr-2" />
                        ) : (
                          <Eye className="h-3 w-3 mr-2" />
                        )}
                        {type.charAt(0).toUpperCase() + type.slice(1)}s
                      </Button>
                    ))}
                  </div>
                </div>

                <DynamicToolbar 
                  onAddNode={addNode}
                  selectedNodeType={selectedNodeType}
                  onSelectNodeType={setSelectedNodeType}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Layer Creation Instructions */}
      {activeTool === 'layer' && (
        <div className="absolute top-4 left-4 z-50 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded border-2 border-dashed"
              style={{ 
                backgroundColor: selectedLayerColor,
                borderColor: selectedLayerColor 
              }}
            />
            <span className="text-sm font-medium text-foreground">Layer Tool Active</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">
            {isCreatingLayer 
              ? 'Release to create layer' 
              : 'Click and drag to create a colored layer'
            }
          </p>
          {previewLayer && (
            <p className="text-xs text-primary font-medium">
              Size: {Math.round(previewLayer.width)} × {Math.round(previewLayer.height)}px
            </p>
          )}j
        </div>
      )}
    {/* Layer Creation Instructions */}
    {activeTool === 'layer' && (
      <div className="absolute top-4 left-4 z-50 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-4 h-4 rounded border-2 border-dashed"
            style={{ 
              backgroundColor: selectedLayerColor,
              borderColor: selectedLayerColor 
            }}
          />
          <span className="text-sm font-medium text-foreground">Layer Tool Active</span>
        </div>
        <p className="text-xs text-muted-foreground mb-1">
          {isCreatingLayer 
            ? 'Release to create layer' 
            : 'Click and drag to create a colored layer'
          }
        </p>
        {previewLayer && (
          <p className="text-xs text-primary font-medium">
            Size: {Math.round(previewLayer.width)} × {Math.round(previewLayer.height)}px
          </p>
        )}
      </div>
    )}
    {/* Layer Selection Instructions */}
    {selectedLayer && activeTool === 'select' && (
      <div className="absolute top-4 left-4 z-50 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-4 h-4 rounded border-2"
            style={{ 
              backgroundColor: layers.find(l => l.id === selectedLayer)?.color,
              borderColor: layers.find(l => l.id === selectedLayer)?.color 
            }}
          />
          <span className="text-sm font-medium text-foreground">
            {layers.find(l => l.id === selectedLayer)?.name} Selected
          </span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Click layer name to rename</p>
          <p>• Drag corners to resize</p>
          <p>• Click elsewhere to deselect</p>
        </div>
      </div>
    )}
    {/* Close main container div */}
  </div>
  );
}

function getDefaultNodeData(type: string) {
  switch (type) {
    case 'product':
      return {
        label: 'New Product',
        basePrice: 10.00,
        image: '🍽️',
        available: true
      };
    case 'ingredient':
      return {
        label: 'New Ingredient',
        stock: 50,
        unit: 'units',
        cost: 1.00,
        lowStockThreshold: 10
      };
    case 'modifier':
      return {
        label: 'New Modifier',
        priceChange: 1.00,
        type: 'addon'
      };
    case 'category':
      return {
        label: 'New Category',
        color: '#6B7280',
        itemCount: 0
      };
    default:
      return {};
  }
}