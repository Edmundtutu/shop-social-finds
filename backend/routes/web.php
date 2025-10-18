<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\OrderHandlers\PaymentController;
use App\Http\Controllers\Api\V1\OrderHandlers\PayWithMomoController;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__ . '/auth.php';

// Flutterwave payment callback (redirects to frontend)
Route::get('/payment/callback', [PaymentController::class, 'callback'])->name('payment.callback');

// MoMo callback (usually unauthenticated but can be signed/allowlist)
Route::post('/momo/collection/callback', [PayWithMomoController::class, 'momoCallback']);
