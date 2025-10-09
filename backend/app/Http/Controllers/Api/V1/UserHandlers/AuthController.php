<?php

namespace App\Http\Controllers\Api\V1\UserHandlers;

use App\Models\User;
use App\Models\Subaccount;
use App\Services\FlutterwaveService;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request, FlutterwaveService $flw)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => 'sometimes|in:customer,vendor',
            // Vendor fields
            'business_name' => 'sometimes|string|max:255',
            'business_email' => 'sometimes|string|email|max:255',
            'business_phone' => 'sometimes|string|max:255',
            'business_address' => 'sometimes|string|max:255',
            'address' => 'sometimes|string|max:255',
            'bank_name' => 'sometimes|string|max:255',
            'bank_code' => 'sometimes|string|max:255',
            'account_number' => 'sometimes|string|max:255',
            'split_value_in_percentage' => 'sometimes|integer|min:0|max:100',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'] ?? 'customer',
        ]);

        // When creating a vendor, we need to create a subaccount for them
        // Step 1: First create a subaccount on Flutterwave for 
        if ($data['role'] == 'vendor') {
            $subaccount = $flw->createSubaccount([
                'business_name' => $data['business_name'],
                'business_email' => $data['business_email'],
                'business_phone' => $data['business_phone'],
                'business_address' => $data['business_address'],
                'bank_name' => $data['bank_name'],
                'account_bank' => $data['bank_code'],
                'account_number' => $data['account_number'],
                'split_value_in_percentage' => $data['split_value_in_percentage'],
            ]);
            if ($subaccount['status'] == 'success') {
                $subaccount = Subaccount::create([
                    'user_id' => $user->id,
                    'subaccount_id' => $subaccount['data']['id'],
                    'business_name' => $data['business_name'],
                    'business_email' => $data['business_email'],
                    'business_phone' => $data['business_phone'],
                    'business_address' => $data['business_address'],
                    'bank_name' => $data['bank_name'],
                    'bank_code' => $data['bank_code'],
                    'account_number' => $data['account_number'],
                    'split_value_in_percentage' => $data['split_value_in_percentage'],
                ]);
            }else{
                return response()->json(['message' => 'Failed to create subaccount'], 500);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = $request->user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
