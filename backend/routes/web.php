<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\OrderHandlers\PaymentController;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__.'/auth.php';

// Flutterwave payment callback
Route::get('/payment/callback', [PaymentController::class, 'callback'])->name('payment.callback');
