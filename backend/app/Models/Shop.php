<?php

namespace App\Models;

use App\Models\Category;
use App\Models\InventoryNode;
use App\Models\InventoryNodeEdge;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Shop extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'name',
        'description',
        'address',
        'lat',
        'lng',
        'avatar',
        'cover_image',
        'phone',
        'hours',
        'category',
        'verified',
    ];

    protected $casts = [
        'lat' => 'decimal:7',
        'lng' => 'decimal:7',
        'hours' => 'json',
        'verified' => 'boolean',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function reviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function followers(): MorphToMany
    {
        return $this->morphToMany(User::class, 'followable', 'follows');
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class, 'shop_id');
    }

    public function inventoryNodes(): HasMany
    {
        return $this->hasMany(InventoryNode::class, 'shop_id');
    }

    public function inventoryNodeEdges(): HasMany
    {
        return $this->hasMany(InventoryNodeEdge::class);
    }
}
