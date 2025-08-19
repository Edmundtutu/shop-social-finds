<?php

namespace App\Models;

use App\Models\Shop;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'shop_id',
        'name',
        'description',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'category_product');
    }
    
    public function shop()
    {
        return $this->belongsTo(Shop::class, 'shop_id');
    }
}
