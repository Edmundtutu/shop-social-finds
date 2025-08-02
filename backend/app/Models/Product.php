<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Product extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'shop_id',
        'name',
        'description',
        'price',
        'images',
        'category',
        'stock',
        'tags',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'images' => 'json',
        'tags' => 'json',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function reviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
