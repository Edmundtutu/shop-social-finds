import api from './api';

export interface InventoryNode {
  id: string;
  shop_id: string;
  entity_type: 'category' | 'product' | 'ingredient' | 'modifier';
  entity_id: string | null;
  x: number;
  y: number;
  display_name: string | null;
  color_code: string | null;
  icon: string | null;
  metadata: Record<string, any> | null;
}

export interface InventoryNodeEdge {
  id: string;
  shop_id: string;
  source_node_id: string;
  target_node_id: string;
  label: string | null;
  metadata: Record<string, any> | null;
}

export interface GraphData {
  nodes: InventoryNode[];
  edges: InventoryNodeEdge[];
}

const inventoryService = {
  async getGraph(shopId: string): Promise<GraphData> {
    const response = await api.get(`/v1/inventory/${shopId}/graph`);
    return response.data;
  },

  async createNode(
    shopId: string,
    type: 'category' | 'product' | 'ingredient' | 'modifier',
    x: number,
    y: number,
    data: Record<string, any>
  ): Promise<InventoryNode> {
    const payload = {
      shop_id: shopId,
      entity_type: type,
      x,
      y,
      display_name: data.label || null,
      color_code: data.color || null,
      icon: data.image || null,
      metadata: data,
    };
    const response = await api.post(`/v1/inventory/nodes`, payload);
    return response.data.data; // Laravel resources often wrap data in a 'data' key
  },

  async updateNode(
    nodeId: string,
    updates: {
      x?: number;
      y?: number;
      display_name?: string;
      color_code?: string;
      icon?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<InventoryNode> {
    const response = await api.patch(`/v1/inventory/nodes/${nodeId}`, updates);
    return response.data.data;
  },

  async updateNodePosition(nodeId: string, x: number, y: number): Promise<void> {
    await api.patch(`/v1/nodes/${nodeId}/position`, { x, y });
  },

  async deleteNode(nodeId: string): Promise<void> {
    await api.delete(`/v1/inventory/nodes/${nodeId}`);
  },

  async createEdge(
    shopId: string,
    sourceNodeId: string,
    targetNodeId: string,
    label: string | null,
    data: Record<string, any>
  ): Promise<InventoryNodeEdge> {
    const payload = {
      shop_id: shopId,
      source_node_id: sourceNodeId,
      target_node_id: targetNodeId,
      label: label,
      metadata: data,
    };
    const response = await api.post(`/v1/inventory/edges`, payload);
    return response.data.data;
  },

  async deleteEdge(edgeId: string): Promise<void> {
    await api.delete(`/v1/inventory/edges/${edgeId}`);
  },
};

export default inventoryService;
