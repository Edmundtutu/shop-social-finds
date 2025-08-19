<?php
namespace App\Models;

use App\Models\Shop;
use App\Models\InventoryNode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryNodeEdge extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'shop_id',
        'source_node_id', 
        'target_node_id', 
        'label',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class, 'shop_id');
    }

    public function sourceNode()
    {
        return $this->belongsTo(InventoryNode::class, 'source_node_id');
    }

    public function targetNode()
    {
        return $this->belongsTo(InventoryNode::class, 'target_node_id');
    }
}
