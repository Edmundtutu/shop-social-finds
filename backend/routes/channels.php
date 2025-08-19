<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Shop;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Authorize vendors to listen to their shop's private inventory channel
Broadcast::channel('shopInventory.{shopId}', function ($user, string $shopId) {
    return Shop::where('id', $shopId)->where('owner_id', $user->id)->exists();
});
