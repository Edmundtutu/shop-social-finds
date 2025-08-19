<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\Json\JsonResource;

class InventoryNodeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'shop_id' => $this->shop_id,
            'entity_type' => $this->entity_type,
            'entity_id' => $this->entity_id,
            'x' => $this->x,
            'y' => $this->y,
            'display_name' => $this->display_name,
            'color_code' => $this->color_code,
            'icon' => $this->icon,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
