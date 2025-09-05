<?php

namespace App\Http\Controllers\Api\V1\OrderHandlers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreOrderRequest;
use App\Http\Requests\Api\V1\UpdateOrderRequest;
use App\Http\Resources\Api\V1\OrderResource;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
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
}
