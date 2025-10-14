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
                    'error' => 'Invalid response from payment provider'
                ], 502);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Payment initiated successfully',
                'data' => $response
            ]);
        } catch (\Exception $e) {
            Log::error('Flutterwave initiatePayment error', [
                'error' => $e->getMessage(),
                'payload' => $payload,
                'user_id' => $payer?->id
            ]);
            
            // Update payment status to failed
            $payment = Payment::where('tx_ref', $txRef)->first();
            if ($payment) {
                $payment->update(['status' => 'failed']);
            }
            
            return response()->json([
                'status' => 'error',
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

        Log::info('Payment callback received', [
            'tx_ref' => $txRef,
            'status' => $status,
            'transaction_id' => $transactionId,
            'all_params' => $request->all()
        ]);

        if (!$txRef) {
            Log::error('Payment callback missing tx_ref', ['request' => $request->all()]);
            return response()->json(['message' => 'Missing tx_ref'], 400);
        }

        $payment = Payment::where('tx_ref', $txRef)->first();
        if (!$payment) {
            Log::error('Payment callback - payment not found', ['tx_ref' => $txRef]);
            return response()->json(['message' => 'Payment not found'], 404);
        }

        try {
            if ($status === 'successful' && $transactionId) {
                $verification = $flw->verifyTransaction($transactionId);

                if (is_array($verification)
                    && ($verification['status'] ?? null) === 'success'
                    && isset($verification['data'])
                    && ($verification['data']['status'] ?? null) === 'successful') {

                    $payment->status = 'successful';
                    $payment->amount = (int) ($verification['data']['amount'] ?? $payment->amount);
                    $payment->payment_method = $verification['data']['payment_type'] ?? $payment->payment_method;
                    $payment->save();

                    if ($payment->order) {
                        $payment->order->update(['payment_status' => 'paid']);
                    }

                    // Redirect to frontend payment result page
                    return redirect(rtrim(env('FRONTEND_URL'), '/') . '/payment-result?status=success&message=' . urlencode('Payment verified successfully') . '&tx_ref=' . urlencode($txRef));
                }

                $payment->status = 'failed';
                $payment->save();

                if ($payment->order) {
                    $payment->order->update(['payment_status' => 'failed']);
                }

                return redirect(rtrim(env('FRONTEND_URL'), '/') . '/payment-result?status=failed&message=' . urlencode('Payment verification failed') . '&tx_ref=' . urlencode($txRef));
            }

            if ($status === 'cancelled') {
                $payment->status = 'cancelled';
                $payment->save();

                if ($payment->order) {
                    $payment->order->update(['payment_status' => 'cancelled']);
                }

                return redirect(rtrim(env('FRONTEND_URL'), '/') . '/payment-result?status=cancelled&message=' . urlencode('Payment cancelled') . '&tx_ref=' . urlencode($txRef));
            }

            // Fallback
            $payment->status = $status ?? 'failed';
            $payment->save();

            if ($payment->order) {
                $payment->order->update(['payment_status' => $status === 'failed' ? 'failed' : 'pending']);
            }

            return redirect(rtrim(env('FRONTEND_URL'), '/') . '/payment-result?status=' . urlencode($status ?? 'failed') . '&message=' . urlencode('Payment updated') . '&tx_ref=' . urlencode($txRef));
        } catch (\Exception $e) {
            Log::error('Flutterwave verifyTransaction error', ['error' => $e->getMessage()]);

            return redirect(rtrim(env('FRONTEND_URL'), '/') . '/payment-result?status=error&message=' . urlencode('Callback processing failed: ' . $e->getMessage()) . '&tx_ref=' . urlencode($txRef));
        }
    }
    
}
