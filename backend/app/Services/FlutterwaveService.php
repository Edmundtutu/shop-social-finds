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
            $response = Http::withToken($this->secret)
                ->timeout(30)
                ->get("{$this->baseUrl}/banks?country={$country}");
            
            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['status']) && $data['status'] === 'success') {
                    return $data['data'];
                }
                throw new \Exception('Flutterwave API returned error: ' . ($data['message'] ?? 'Unknown error'));
            }
            
            throw new \Exception('HTTP request failed with status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Flutterwave getBanksAndCodes error', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function createSubaccount($data)
    {
        try {
            $response = Http::withToken($this->secret)
                ->timeout(30)
                ->post("{$this->baseUrl}/subaccounts", $data);
            
            if ($response->successful()) {
                return $response->json();
            }
            
            throw new \Exception('HTTP request failed with status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Flutterwave createSubaccount error', ['error' => $e->getMessage(), 'data' => $data]);
            throw $e;
        }
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
        try {
            $response = Http::withToken($this->secret)
                ->timeout(30)
                ->post("{$this->baseUrl}/payments", $data);
            
            if ($response->successful()) {
                $result = $response->json();
                if (isset($result['status']) && $result['status'] === 'success') {
                    return $result;
                }
                throw new \Exception('Flutterwave payment initiation failed: ' . ($result['message'] ?? 'Unknown error'));
            }
            
            throw new \Exception('HTTP request failed with status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Flutterwave initiatePayment error', ['error' => $e->getMessage(), 'data' => $data]);
            throw $e;
        }
    }

    public function verifyTransaction($transactionId)
    {
        try {
            $response = Http::withToken($this->secret)
                ->timeout(30)
                ->get("{$this->baseUrl}/transactions/{$transactionId}/verify");
            
            if ($response->successful()) {
                return $response->json();
            }
            
            throw new \Exception('HTTP request failed with status: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Flutterwave verifyTransaction error', ['error' => $e->getMessage(), 'transactionId' => $transactionId]);
            throw $e;
        }
    }

}
