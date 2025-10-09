<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;

class Payment extends Model
{
    use HasFactory, HasApiTokens, HasUlids;
    protected $table = 'payments';
    protected $fillable = [
        'payer_id',
        'payee_id',
        'order_id',
        'tx_ref',
        'amount',
        'status',
        'payment_method',
    ];

    public function payer():BelongsTo
    {
        return $this->belongsTo(User::class, 'payer_id');
    }
    public function payee():BelongsTo
    {
        return $this->belongsTo(User::class, 'payee_id');
    }

    public function order():BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
