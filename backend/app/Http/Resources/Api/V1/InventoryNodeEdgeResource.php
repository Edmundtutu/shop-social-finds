<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\Json\JsonResource;

class InventoryNodeEdgeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'shop_id' => $this->shop_id,
            'source_node_id' => $this->source_node_id,
            'target_node_id' => $this->target_node_id,
            'label' => $this->label,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'source_node' => new InventoryNodeResource($this->whenLoaded('sourceNode')),
            'target_node' => new InventoryNodeResource($this->whenLoaded('targetNode'))
        ];
    }
}
