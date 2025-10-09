<?php

namespace App\Services;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class FlutterwaveService
{
    protected $baseUrl;
    protected $secret;

    public function __construct()
    {
        $this->baseUrl = "https://api.flutterwave.com/v3";
        $this->secret = env('FLW_SECRET_KEY');
    }

    public function getBanksAndCodes($country = 'UG') // Focusing on Uganda for now
    {
        try {
            return Http::withToken($this->secret)
                ->get("{$this->baseUrl}/banks?country={$country}")
                ->json()['data'];
        } catch (\Exception $e) {
            Log::error('Flutterwave getBandsAndCodes error', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to get banks and codes', 'error' => $e->getMessage()], 500);
        }
    }

    public function createSubaccount($data)
    {
        return Http::withToken($this->secret)
            ->post("{$this->baseUrl}/subaccounts", $data)
            ->json();
    }

      /**
     * Fetch all subaccounts
     */
    public function getAllSubaccounts()
    {
        return Http::withToken($this->secret)
            ->get("{$this->baseUrl}/subaccounts")
            ->json();
    }

    /**
     * Fetch one subaccount by ID
     */
    public function getSubaccount($subaccountId)
    {
        return Http::withToken($this->secret)
            ->get("{$this->baseUrl}/subaccounts/{$subaccountId}")
            ->json();
    }

    /**
     * Update a subaccount
     * 
     * Example $data:
     * [
     *   'business_name' => 'New Vendor Name',
     *   'split_type' => 'percentage',
     *   'split_value' => 20
     * ]
     */
    public function updateSubaccount($subaccountId, array $data)
    {
        return Http::withToken($this->secret)
            ->put("{$this->baseUrl}/subaccounts/{$subaccountId}", $data)
            ->json();
    }

    /**
     * Deactivate a subaccount (safe "delete")
     */
    public function deactivateSubaccount($subaccountId)
    {
        return Http::withToken($this->secret)
            ->put("{$this->baseUrl}/subaccounts/{$subaccountId}", [
                'status' => 'inactive'
            ])
            ->json();
    }
    
    public function deleteSubaccount($subaccountId)
    {
        return Http::withToken($this->secret)
            ->delete("{$this->baseUrl}/subaccounts/{$subaccountId}")
            ->json();
    }
    
    public function initiatePayment($data)
    {
        return Http::withToken($this->secret)
            ->post("{$this->baseUrl}/payments", $data)
            ->json();
    }

    public function verifyTransaction($transactionId)
    {
        return Http::withToken($this->secret)
            ->get("{$this->baseUrl}/transactions/{$transactionId}/verify")
            ->json();
    }

}
