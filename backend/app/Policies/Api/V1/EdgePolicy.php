<?php

namespace App\Policies\Api\V1;

use App\Models\InventoryNodeEdge;
use App\Models\User;

class EdgePolicy
{
    /**
     * Determine whether the user can delete the edge.
     */
    public function delete(User $user, InventoryNodeEdge $edge): bool
    {
        return optional($edge->shop)->owner_id === $user->id;
    }

    /**
     * Determine whether the user can update the edge.
     */
    public function update(User $user, InventoryNodeEdge $edge): bool
    {
        return optional($edge->shop)->owner_id === $user->id;
    }
}


