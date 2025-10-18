<?php

namespace App\Services;

use App\Models\Payment;
use Bmatovu\MtnMomo\Products\Collection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MomoService
{
    protected Collection $collection;

    public function __construct()
    {
        $this->collection = new Collection();
    }

    /**
     * Initiate a RequestToPay on MTN MoMo Collection.
     * Expects E.164 MSISDN in $payerNumber and integer $amount in minor units if your app uses that.
     */
    public function requestToPay(string $payerNumber, int $amount, string $externalRef, array $meta): string
    {
        $normalizedMsisdn = $this->normalizeMsisdn($payerNumber);

        $referenceId = $this->collection->requestToPay($externalRef, $normalizedMsisdn, $amount);

        Payment::create([
            'payer_id' => Arr::get($meta, 'payer_id'),
            'payee_id' => Arr::get($meta, 'payee_id'),
            'order_id' => Arr::get($meta, 'order_id'),
            'tx_ref' => $externalRef,
            'provider' => 'momo',
            'reference_id' => $referenceId,
            'external_id' => $externalRef,
            'payer_number' => $normalizedMsisdn,
            'amount' => $amount,
            'currency' => Arr::get($meta, 'currency', 'UGX'),
            'status' => 'pending',
            'payment_method' => 'mtn_momo_collection',
        ]);

        return $referenceId;
    }

    /**
     * Check transaction status and persist mapping and raw response.
     */
    public function getTransactionStatus(string $referenceId): array
    {
        $statusResponse = $this->collection->getTransactionStatus($referenceId);

        $mapped = $this->mapStatus($statusResponse['status'] ?? null);

        $payment = Payment::where('reference_id', $referenceId)->first();
        if ($payment) {
            $payment->status = $mapped['status'];
            $payment->reason = $mapped['reason'] ?? null;
            $payment->raw_response = $statusResponse;
            $payment->save();
        }

        return [
            'reference_id' => $referenceId,
            'status' => $mapped['status'],
            'reason' => $mapped['reason'] ?? null,
            'raw' => $statusResponse,
        ];
    }

    /**
     * Compute revenue split, do not auto-disburse by default.
     */
    public function handleRevenueSplit(string $vendorId, int $amount): array
    {
        $vendorShare = (int) round($amount * 0.9);
        $platformShare = $amount - $vendorShare;

        Log::info('Computed MoMo revenue split', [
            'vendor_id' => $vendorId,
            'vendor_share' => $vendorShare,
            'platform_share' => $platformShare,
        ]);

        return [
            'vendor_share' => $vendorShare,
            'platform_share' => $platformShare,
        ];
    }

    /**
     * Handle MTN callback (if configured). Idempotent update.
     */
    public function handleCallback(array $payload)
    {
        $referenceId = Arr::get($payload, 'referenceId');
        $status = Arr::get($payload, 'status');

        if ($referenceId) {
            $payment = Payment::where('reference_id', $referenceId)->first();
            if ($payment) {
                $mapped = $this->mapStatus($status);
                $payment->status = $mapped['status'];
                $payment->reason = $mapped['reason'] ?? null;
                $payment->raw_response = $payload;
                $payment->save();
            }
        }

        Log::info('MoMo callback received', $payload);

        return response()->json(['success' => true]);
    }

    private function normalizeMsisdn(string $msisdn): string
    {
        $trimmed = preg_replace('/\s+/', '', $msisdn ?? '');
        if (Str::startsWith($trimmed, '+')) {
            return substr($trimmed, 1);
        }
        return $trimmed;
    }

    private function mapStatus(?string $mtnStatus): array
    {
        $mtnStatus = strtoupper((string) $mtnStatus);
        return match ($mtnStatus) {
            'PENDING' => ['status' => 'pending'],
            'SUCCESSFUL' => ['status' => 'successful'],
            'FAILED' => ['status' => 'failed'],
            default => ['status' => 'pending', 'reason' => $mtnStatus ?: 'UNKNOWN'],
        };
    }
}
