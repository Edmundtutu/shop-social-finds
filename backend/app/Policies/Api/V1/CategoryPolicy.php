<?php

namespace App\Policies\Api\V1;

use App\Models\Category;
use App\Models\Shop;
use App\Models\User;

class CategoryPolicy
{
    public function update(User $user, Shop $shop): bool
    {
        return $shop->owner_id === $user->id;
    }

    public function manage(User $user, Category $category): bool
    {
        return optional($category->shop)->owner_id === $user->id;
    }
}


