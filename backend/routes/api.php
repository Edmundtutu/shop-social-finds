<?php

use App\Models\User;
use App\Models\Order;
use App\Models\Subaccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\FlutterwaveService;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\PostHandlers\LikeController;
use App\Http\Controllers\Api\V1\PostHandlers\PostController;
use App\Http\Controllers\Api\V1\ShopHandlers\ShopController;
use App\Http\Controllers\Api\V1\UserHandlers\AuthController;
use App\Http\Controllers\Api\V1\OrderHandlers\OrderController;
use App\Http\Controllers\Api\V1\ShopHandlers\ReviewController;
use App\Http\Controllers\Api\V1\UserHandlers\FollowController;
use App\Http\Controllers\Api\V1\PostHandlers\CommentController;
use App\Http\Controllers\Api\V1\OrderHandlers\PaymentController;
use App\Http\Controllers\Api\V1\OrderHandlers\ProductController;
use App\Http\Controllers\Api\V1\PostHandlers\CommentLikeController;
use App\Http\Controllers\Api\V1\PostHandlers\PostCommentController;
use App\Http\Controllers\Api\V1\ShopHandlers\Inventory\AddonController;
use App\Http\Controllers\Api\V1\ShopHandlers\Inventory\CategoryController;
use App\Http\Controllers\Api\V1\ShopHandlers\Inventory\InventoryController;
use App\Http\Controllers\Api\V1\ShopHandlers\Inventory\ModificationController;

Route::prefix('v1')->group(function () {
    // Authentication routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);

        // Inventory react flow nodes and edges routes
        Route::get('/inventory/{shop}/graph', [InventoryController::class, 'getGraph']);

        Route::post('/inventory/nodes', [InventoryController::class, 'storeNode']);
        Route::patch('/inventory/nodes/{node}', [InventoryController::class, 'updateNode'])->middleware('can:update,node');
        Route::delete('/inventory/nodes/{node}', [InventoryController::class, 'destroyNode'])->middleware('can:delete,node');

        Route::post('/inventory/edges', [InventoryController::class, 'storeEdge']);
        Route::delete('/inventory/edges/{edge}', [InventoryController::class, 'destroyEdge'])->middleware('can:delete,edge');

        Route::patch('/nodes/{node}/position', [InventoryController::class, 'updateNodePosition'])->middleware('can:update,node');
    });

    // Shop routes
    Route::apiResource('shops', ShopController::class)->only(['index', 'show']);
    Route::apiResource('shops', ShopController::class)->middleware('auth:sanctum')->except(['index', 'show']);

    // Product routes
    Route::apiResource('products', ProductController::class)->only(['index', 'show']);
    Route::apiResource('products', ProductController::class)->middleware('auth:sanctum')->except(['index', 'show']);

    // Category routes
    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
    Route::apiResource('categories', CategoryController::class)->middleware('auth:sanctum')->except(['index', 'show']);

    // Modifications & Addons routes
    Route::apiResource('modifications', ModificationController::class)->only(['index']);
    Route::apiResource('modifications', ModificationController::class)->middleware('auth:sanctum')->except(['index', 'show']);
    Route::apiResource('addons', AddonController::class)->only(['index']);
    Route::apiResource('addons', AddonController::class)->middleware('auth:sanctum')->except(['index', 'show']);

    // Post routes
    Route::apiResource('posts', PostController::class)->only(['index', 'show']);
    Route::apiResource('posts', PostController::class)->middleware('auth:sanctum')->except(['index', 'show']);
    Route::post('/posts/{post}/like', [PostController::class, 'likeOrUnlike'])->middleware('auth:sanctum');

    // Order routes
    Route::apiResource('posts.comments', PostCommentController::class)->middleware('auth:sanctum');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/vendor/orders', [OrderController::class, 'vendorOrders']);
        Route::patch('/vendor/orders/{order}/confirm', [OrderController::class, 'confirmOrder']);
        Route::patch('/vendor/orders/{order}/reject', [OrderController::class, 'rejectOrder']);
    });
    Route::apiResource('orders', OrderController::class);
    
    // Atomic order creation with payment
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/orders/with-payment', [OrderController::class, 'storeWithPayment']);
    });

    // Payment routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/payments/pay', [PaymentController::class, 'pay']);
    });

    // Order payment routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/orders/{order}/initiate-payment', [OrderController::class, 'initiatePayment']);
        Route::get('/orders/{order}/payment-status', [OrderController::class, 'checkPaymentStatus']);
    });

    // Review routes
    Route::apiResource('reviews', ReviewController::class);

    // Comment routes
    Route::apiResource('comments', CommentController::class);

    // Comment like routes
    Route::post('/comments/{comment}/like', [CommentLikeController::class, 'toggle'])->middleware('auth:sanctum');

    // Like routes
    Route::post('likes', [LikeController::class, 'store']);
    Route::delete('likes', [LikeController::class, 'destroy']);

    // Follow routes
    Route::post('follows', [FollowController::class, 'store']);
    Route::delete('follows/{user}', [FollowController::class, 'destroy']);
    Route::get('users/{user}/followers', [FollowController::class, 'followers']);
    Route::get('users/{user}/following', [FollowController::class, 'following']);

    // Chat routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/chat/conversation', [ChatController::class, 'getConversation']);
        Route::post('/chat/message', [ChatController::class, 'sendMessage']);
        Route::get('/chat/conversations/{conversationId}/messages', [ChatController::class, 'getMessages']);
        Route::patch('/chat/conversations/{conversationId}/read', [ChatController::class, 'markAsRead']);
        Route::get('/chat/conversations/user', [ChatController::class, 'getUserConversations']);
        Route::get('/chat/conversations/shop', [ChatController::class, 'getShopConversations']);
        Route::post('/chat/typing/start', [ChatController::class, 'startTyping']);
        Route::post('/chat/typing/stop', [ChatController::class, 'stopTyping']);
    });
});

// Test routes for creating a subaccount on Flutterwave
Route::middleware('auth:sanctum')->group(function () {
    // Route to get the logged in user and create a subaccount on flutterwave and subaccount record for them
    Route::get('/test-flutterwave-subaccount', function(Request $request) {
        $flw = new FlutterwaveService();
        $subaccount = $flw->createSubaccount([
            'business_name' => 'Test Business',
            'business_email' => 'test@vendor.business',
            'business_mobile' => '0782673872',
            'business_address' => 'Mbarara Uganda',
            'account_bank' => '035',
            'account_number' => '00000000',
            'split_type' => 'percentage',
            'split_value' => 0.5,  
            'country' => 'CM',
        ]);
        if($subaccount['status'] == 'success'){
            $subaccount = Subaccount::create([
                'user_id' => $request->user()->id,
                'subaccount_id' => $subaccount['data']['subaccount_id'],
                'business_name' => 'Test Business',
                'business_email' => $request->user()->email,
                'business_phone' => '0782673872',
                'business_address' => 'Mbarara Uganda',
                'bank_name' => $subaccount['data']['bank_name'],
                'bank_code' => $subaccount['data']['account_bank'],
                'account_number' => $subaccount['data']['account_number'],
                'split_value_in_percentage' => 0.5,
            ]);
        }else{
            return response()->json(['message' => 'Failed to create subaccount '.$subaccount['message'], 'subaccount' => $subaccount], 500);
        }
        return response()->json(['message' => 'Subaccount created successfully', 'subaccount' => $subaccount], 200);
    });

    // Route to get all subaccounts from flutterwave
    Route::get('/test-flutterwave-subaccounts', function(Request $request) {
        $flw = new FlutterwaveService();
        $subaccounts = $flw->getAllSubaccounts();
        return response()->json(['subaccounts' => $subaccounts], 200);
    });

    // Route to get banks and codes from flutterwave
    Route::get('/test-flutterwave-banks-and-codes', function(Request $request) {
        $flw = new FlutterwaveService();
        $banks = $flw->getBanksAndCodes();
        return response()->json(['banks' => $banks], 200);
    });

    // Route to test deleting a sub account
    Route::get('/test-flutterwave-delete-subaccount/{subAccountId}', function ($subAccountId) {
        $flw = new FlutterwaveService();
        $response = $flw->deleteSubaccount($subAccountId);
    
        if (isset($response['status']) && $response['status'] === 'success') {
            return response()->json([
                'message' => 'Subaccount successfully deleted',
                'flutterwave_response' => $response
            ]);
        }
    
        // If deletion failed or API returned an error
        return response()->json([
            'message' => 'Failed to delete subaccount',
            'flutterwave_response' => $response
        ], 400);
    });


    // Route to Test payment process
    Route::post('/test-payment-for-order', function(Request  $request){
        // Extract the first Order from the login user
        $test_order = Order::whereHas('shop', function ($query) {
            $query->where('id', '01k2cdnvdtrz2gn6w2gjchd74w');  // Orders from Jane Vendor's shop
        })
        ->where('user_id', $request->user()->id)
        ->first();
    
        if (!$test_order) {
            return response()->json(['error' => 'No order found for this user'], 404);
        }
    
        $test_vendor = User::findOrFail($test_order->shop->owner_id);
        $test_customer_name = $request->user()->name;
        $test_customer_email = $request->user()->email;
        
        $test_data = [
            'vendor_id'=> $test_vendor->id, 
            'amount' => $request['amount'],
            'email'=> $test_customer_email,
            'name'=> $test_customer_name,
            'order_id' => $test_order->id,
            'payment_method' => $request['paymentMethod'],
        ];

        $mockRequest = new Request($test_data);
        // attach authenticated user to the mock request
        $mockRequest->setUserResolver(function () use ($request) {
            return $request->user();
        });

        // Instantiate controller and dependencies
        $paymentController = new PaymentController();
        $flwService = app(FlutterwaveService::class); // resolve from container

        // Call the method
        return $paymentController->pay($mockRequest, $flwService);

    });
});

// Add to backend/routes/api.php
Route::get('/test-broadcast', function() {
    event(new \App\Events\TestBroadcast());
    return response()->json(['message' => 'Test broadcast']);
});
// Add to your test route in api.php:
Route::get('/test-reverb-connection', function() {
    try {
        $broadcaster = app('Illuminate\Broadcasting\BroadcastManager');
        $connection = $broadcaster->connection('reverb');
        
        Log::info('🔗 Reverb connection test', [
            'driver' => get_class($connection),
            'config' => config('broadcasting.connections.reverb')
        ]);
        
        return response()->json([
            'status' => 'Connection created',
            'driver' => get_class($connection)
        ]);
    } catch (\Exception $e) {
        Log::error('❌ Reverb connection failed', [
            'error' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});