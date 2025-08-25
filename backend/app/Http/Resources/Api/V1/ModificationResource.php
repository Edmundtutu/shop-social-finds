<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\Json\JsonResource;

class ModificationResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'name' => $this->name,
            'cost' => (float) $this->cost,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}


