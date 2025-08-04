<?php

namespace App\Policies\Api\V1;

use App\Models\Follow;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class FollowPolicy
{
    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Follow $follow): bool
    {
        return $user->id === $follow->follower_id;
    }
}
