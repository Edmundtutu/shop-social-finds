<?php

namespace App\Http\Controllers\Api\V1\OrderHandlers;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use App\Services\FlutterwaveService;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function pay(Request $request, FlutterwaveService $flw)
    {
        $validated = $request->validate([
            'vendor_id' => ['required', 'exists:users,id'],
            'amount' => ['required', 'integer', 'min:100'],
            'email' => ['required', 'email'],
            'name' => ['required', 'string', 'max:255'],
            'order_id' => ['nullable', 'exists:orders,id'],
            'payment_method' => [
                'nullable',
                Rule::in(['card', 'mobilemoneyuganda'])
            ],
        ]);

        $payer = $request->user();
        $vendor = User::findOrFail($validated['vendor_id']);
        $subaccount = $vendor->subaccount_relation;

        if (!$subaccount) {
            return response()->json([
                'message' => 'Vendor has no payout subaccount configured.',
                'vendorData'=> $vendor
            ], 422);
        }

        $txRef = 'IMENU' . uniqid();
        $paymentMethod = $validated['payment_method'] ?? 'mobilemoneyuganda';

        // Create a pending payment record prior to redirect/initiation
        Payment::create([
            'payer_id' => $payer?->id,
            'payee_id' => $vendor->id,
            'order_id' => $validated['order_id'] ?? null,
            'tx_ref' => $txRef,
            'amount' => (int) $validated['amount'],
            'status' => 'pending',
            'payment_method' => $paymentMethod,
        ]);

        $payload = [
            'tx_ref' => $txRef,
            'amount' => (int) $validated['amount'],
            'currency' => 'UGX',
            'redirect_url' => route('payment.callback'),
            'customer' => [
                'email' => $validated['email'],
                'name' => $validated['name'],
            ],
            'payment_options' => $paymentMethod,
            'subaccounts' => [
                [
                    'id' => $subaccount->subaccount_id,
                    'transaction_charge_type' => 'percentage',
                    'transaction_charge' => (int) $subaccount->split_value_in_percentage,
                ],
            ],
        ];

        try {
            $response = $flw->initiatePayment($payload);

            if (!is_array($response)) {
                return response()->json([
                    'message' => 'Failed to initiate payment',
                ], 502);
            }

            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Flutterwave initiatePayment error', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to initiate payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function callback(Request $request, FlutterwaveService $flw)
    {
        $txRef = $request->query('tx_ref');
        $status = $request->query('status');
        $transactionId = $request->query('transaction_id');

        if (!$txRef) {
            return response()->json(['message' => 'Missing tx_ref'], 400);
        }

        $payment = Payment::where('tx_ref', $txRef)->first();
        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        try {
            if ($status === 'successful' && $transactionId) {
                $verification = $flw->verifyTransaction($transactionId);

                // Expected: ['status' => 'success', 'data' => ['status' => 'successful', 'amount' => ..., 'payment_type' => ...]]
                if (is_array($verification)
                    && ($verification['status'] ?? null) === 'success'
                    && isset($verification['data'])
                    && ($verification['data']['status'] ?? null) === 'successful') {

                    $payment->status = 'successful';
                    $payment->amount = (int) ($verification['data']['amount'] ?? $payment->amount);
                    $payment->payment_method = $verification['data']['payment_type'] ?? $payment->payment_method;
                    $payment->save();

                    // Update order payment status if order exists
                    if ($payment->order) {
                        $payment->order->update(['payment_status' => 'paid']);
                    }

                    return response()->json(['message' => 'Payment verified']);
                }

                $payment->status = 'failed';
                $payment->save();
                
                // Update order payment status if order exists
                if ($payment->order) {
                    $payment->order->update(['payment_status' => 'failed']);
                }
                
                return response()->json(['message' => 'Verification failed'], 400);
            }

            if ($status === 'cancelled') {
                $payment->status = 'cancelled';
                $payment->save();
                
                // Update order payment status if order exists
                if ($payment->order) {
                    $payment->order->update(['payment_status' => 'cancelled']);
                }
                
                return response()->json(['message' => 'Payment cancelled']);
            }

            // All other statuses
            $payment->status = $status ?? 'failed';
            $payment->save();
            
            // Update order payment status if order exists
            if ($payment->order) {
                $payment->order->update(['payment_status' => $status === 'failed' ? 'failed' : 'pending']);
            }
            
            return response()->json(['message' => 'Payment updated']);
        } catch (\Exception $e) {
            Log::error('Flutterwave verifyTransaction error', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Callback processing failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
