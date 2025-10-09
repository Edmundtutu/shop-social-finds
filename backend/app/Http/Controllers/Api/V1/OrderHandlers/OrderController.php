<?php

namespace App\Http\Controllers\Api\V1\OrderHandlers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreOrderRequest;
use App\Http\Requests\Api\V1\UpdateOrderRequest;
use App\Http\Resources\Api\V1\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\FlutterwaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Order::class);

        $orders = Auth::user()->orders()->with('items.product')->latest()->paginate();

        return OrderResource::collection($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrderRequest $request)
    {
        $this->authorize('create', Order::class);

        $validated = $request->validated();

        $order = DB::transaction(function () use ($validated) {
            $order = Order::create([
                'user_id' => Auth::id(),
                'shop_id' => $validated['shop_id'],
                'delivery_address' => $validated['delivery_address'],
                'delivery_lat' => $validated['delivery_lat'],
                'delivery_lng' => $validated['delivery_lng'],
                'notes' => $validated['notes'] ?? null,
                'total' => 0, // Will be calculated next
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);

            $total = 0;
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $basePrice = $item['base_price'] ?? $product->price;

                // compute add-ons total per main item unit
                $addOnsTotal = 0;
                if (!empty($item['add_ons'])) {
                    foreach ($item['add_ons'] as $addOn) {
                        // Note: We trust validated prices from client for now; alternatively, recalc from DB
                        $addOnsTotal += ($addOn['discounted_price'] * $addOn['quantity']);
                    }
                }

                $lineTotal = ($basePrice + $addOnsTotal) * $item['quantity'];

                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $lineTotal, // storing line total for now; consider separate columns if needed
                ]);

                $total += $lineTotal;
            }

            $order->update(['total' => $total]);

            return $order;
        });

        return new OrderResource($order->load('items.product'));
    }

    /**
     * Create order with payment initiation in one atomic operation
     */
    public function storeWithPayment(StoreOrderRequest $request, FlutterwaveService $flw)
    {
        $this->authorize('create', Order::class);

        $validated = $request->validated();

        // Validate payment fields
        $paymentValidation = $request->validate([
            'customer_email' => 'required|email',
            'customer_name' => 'required|string|max:255',
            'payment_method' => 'nullable|in:card,mobilemoneyuganda',
        ]);

        $result = DB::transaction(function () use ($validated, $paymentValidation, $flw) {
            // Create the order
            $order = Order::create([
                'user_id' => Auth::id(),
                'shop_id' => $validated['shop_id'],
                'delivery_address' => $validated['delivery_address'],
                'delivery_lat' => $validated['delivery_lat'],
                'delivery_lng' => $validated['delivery_lng'],
                'notes' => $validated['notes'] ?? null,
                'total' => 0, // Will be calculated next
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);

            $total = 0;
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $basePrice = $item['base_price'] ?? $product->price;

                // compute add-ons total per main item unit
                $addOnsTotal = 0;
                if (!empty($item['add_ons'])) {
                    foreach ($item['add_ons'] as $addOn) {
                        $addOnsTotal += ($addOn['discounted_price'] * $addOn['quantity']);
                    }
                }

                $lineTotal = ($basePrice + $addOnsTotal) * $item['quantity'];

                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $lineTotal,
                ]);

                $total += $lineTotal;
            }

            $order->update(['total' => $total]);

            // Get vendor and subaccount
            $vendor = User::findOrFail($order->shop->owner_id);
            $subaccount = $vendor->subaccount_relation;

            if (!$subaccount) {
                throw new \Exception('Vendor has no payout subaccount configured.');
            }

            // Create payment record
            $txRef = 'IMENU' . uniqid();
            $paymentMethod = $paymentValidation['payment_method'] ?? 'mobilemoneyuganda';

            $payment = $order->payment()->create([
                'payer_id' => $order->user_id,
                'payee_id' => $vendor->id,
                'tx_ref' => $txRef,
                'amount' => (int) ($order->total * 100), // Convert to cents
                'status' => 'pending',
                'payment_method' => $paymentMethod,
            ]);

            // Initiate payment with Flutterwave
            $payload = [
                'tx_ref' => $txRef,
                'amount' => (int) ($order->total * 100),
                'currency' => 'UGX',
                'redirect_url' => route('payment.callback'),
                'customer' => [
                    'email' => $paymentValidation['customer_email'],
                    'name' => $paymentValidation['customer_name'],
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

            $paymentResponse = $flw->initiatePayment($payload);

            if (!is_array($paymentResponse)) {
                throw new \Exception('Failed to initiate payment with Flutterwave');
            }

            return [
                'order' => $order->load('items.product', 'payment'),
                'payment_url' => $paymentResponse['data']['link'] ?? null,
                'payment_data' => $paymentResponse,
            ];
        });

        return response()->json([
            'message' => 'Order created and payment initiated successfully',
            'order' => new OrderResource($result['order']),
            'payment_url' => $result['payment_url'],
            'payment_data' => $result['payment_data'],
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $this->authorize('view', $order);

        return new OrderResource($order->load('items.product'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        $this->authorize('update', $order);

        $validated = $request->validated();

        $order->update($validated);

        return new OrderResource($order->load('items.product'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $this->authorize('delete', $order);

        // Instead of deleting, we can cancel the order
        if (in_array($order->status, ['pending', 'processing'])) {
            $order->update(['status' => 'cancelled']);
            return response()->json(['message' => 'Order cancelled successfully.']);
        }

        return response()->json(['message' => 'Order cannot be cancelled.'], 400);
    }

    /**
     * Display a listing of the orders for the authenticated vendor's shops.
     */
    public function vendorOrders()
    {
        $this->authorize('viewAny', Order::class); // Using the same policy action for now, adjust if needed

        $vendor = Auth::user();
        $shopIds = $vendor->shops->pluck('id'); // Assuming a vendor has a shops relationship
        $orders = Order::whereIn('shop_id', $shopIds)->with(['items.product', 'user'])->latest()->paginate();

        return OrderResource::collection($orders);
    }

    /**
     * Confirm and Order with availability check
     */
    public function confirmOrder(Order $order): JsonResponse
    {
       if( ! $this->authorize('confirm', $order)) {
         return response()->json(['message' => 'Some error about authpolicy.'], 403);
       }
       $order->update(['status' => 'processing']);
        return response()->json(['message' => 'Order confirmed successfully.']);

    }

    /**
     * Reject order When not available, cancel and  revert Transaction
    */
    public function rejectOrder(Order $order): JsonResponse
    {
        $this->authorize('confirm', $order);
        // TODO When Transactions features are added under payment, revert the transaction here.

        $order->update(['status' => 'cancelled']);
        return response()->json(['message' => 'Order rejected successfully.']);
    }

    /**
     * Initiate payment for an order
     */
    public function initiatePayment(Request $request, Order $order, FlutterwaveService $flw): JsonResponse
    {
        $this->authorize('view', $order);

        // Check if order is already paid
        if ($order->isPaid()) {
            return response()->json(['message' => 'Order is already paid'], 400);
        }

        // Check if order has a pending payment
        if ($order->isPendingPayment() && $order->payment) {
            return response()->json(['message' => 'Payment already initiated for this order'], 400);
        }

        $validated = $request->validate([
            'payment_method' => 'nullable|in:card,mobilemoneyuganda',
            'email' => 'required|email',
            'name' => 'required|string|max:255',
        ]);

        $vendor = User::findOrFail($order->shop->owner_id);
        $subaccount = $vendor->subaccount_relation;

        if (!$subaccount) {
            return response()->json([
                'message' => 'Vendor has no payout subaccount configured.'
            ], 422);
        }

        $txRef = 'IMENU' . uniqid();
        $paymentMethod = $validated['payment_method'] ?? 'mobilemoneyuganda';

        // Create a pending payment record
        $payment = $order->payment()->create([
            'payer_id' => $order->user_id,
            'payee_id' => $vendor->id,
            'tx_ref' => $txRef,
            'amount' => (int) ($order->total * 100), // Convert to cents
            'status' => 'pending',
            'payment_method' => $paymentMethod,
        ]);

        $payload = [
            'tx_ref' => $txRef,
            'amount' => (int) ($order->total * 100), // Convert to cents
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

            return response()->json([
                'message' => 'Payment initiated successfully',
                'payment_url' => $response['data']['link'] ?? null,
                'payment_data' => $response,
                'order' => new OrderResource($order->load('items.product', 'payment'))
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to initiate payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check payment status for an order
     */
    public function checkPaymentStatus(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        $order->load('payment');

        return response()->json([
            'order_id' => $order->id,
            'payment_status' => $order->payment_status,
            'payment' => $order->payment,
            'is_paid' => $order->isPaid(),
            'is_pending_payment' => $order->isPendingPayment(),
        ]);
    }
}
