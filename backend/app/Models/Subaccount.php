<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subaccount extends Model
{
    use HasFactory, HasUlids;
    protected $fillable = [
        'user_id',
        'subaccount_id',
        'business_name',
        'business_email',
        'business_phone',
        'business_address',
        'bank_name',
        'bank_code',
        'account_number',
        'split_value_in_percentage',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
