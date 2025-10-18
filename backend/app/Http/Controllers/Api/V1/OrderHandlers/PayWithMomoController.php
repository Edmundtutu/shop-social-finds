<?php

namespace App\Http\Controllers\Api\V1\OrderHandlers;

use Illuminate\Http\Request;
use App\Services\MomoService;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PayWithMomoController extends Controller
{
    protected $momoService;

    public function __construct(MomoService $momoService)
    {
        $this->momoService = $momoService;
    }

    public function initiatePayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vendor_id' => 'required|exists:users,id',
            'payer_number' => 'required|string',
            'amount' => 'required|integer|min:1',
            'currency' => 'sometimes|string|size:3',
            'order_id' => 'sometimes|exists:orders,id',
            'external_id' => 'sometimes|string|max:64',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $externalId = $request->input('external_id', uniqid('TXN_'));
        $user = Auth::user();

        $referenceId = $this->momoService->requestToPay(
            $request->input('payer_number'),
            (int) $request->input('amount'),
            $externalId,
            [
                'payer_id' => $user?->id,
                'payee_id' => $request->input('vendor_id'),
                'order_id' => $request->input('order_id'),
                'currency' => $request->input('currency', 'UGX'),
            ]
        );

        return response()->json([
            'data' => [
                'reference_id' => $referenceId, 
                'status' => 'pending'
            ],
            'message' => 'MoMo payment initiated successfully',
            'status' => 201
        ], 201);
    }

    public function checkStatus($referenceId)
    {
        try {
            $status = $this->momoService->getTransactionStatus($referenceId);
            return response()->json([
                'data' => $status,
                'message' => 'Status retrieved successfully',
                'status' => 200
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'data' => [
                    'reference_id' => $referenceId,
                    'status' => 'pending',
                    'reason' => 'Error retrieving status: ' . $e->getMessage(),
                    'raw' => ['error' => $e->getMessage()]
                ],
                'message' => 'Error retrieving payment status',
                'status' => 500
            ], 500);
        }
    }

    public function momoCallback(Request $request)
    {
        return $this->momoService->handleCallback($request->all());
    }
}
