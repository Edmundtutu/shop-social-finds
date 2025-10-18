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
        'provider',
        'reference_id',
        'external_id',
        'payer_number',
        'amount',
        'currency',
        'status',
        'payment_method',
        'reason',
        'raw_response',
    ];

    protected $casts = [
        'amount' => 'integer',
        'raw_response' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function getStatusAttribute($value)
    {
        return $value;
    }

    public function setStatusAttribute($value)
    {
        $allowedStatuses = ['pending', 'successful', 'failed', 'cancelled'];
        if (!in_array($value, $allowedStatuses)) {
            throw new \InvalidArgumentException("Invalid payment status: {$value}");
        }
        $this->attributes['status'] = $value;
    }

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
