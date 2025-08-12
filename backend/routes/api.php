<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\LikeController;
use App\Http\Controllers\Api\V1\PostController;
use App\Http\Controllers\Api\V1\ShopController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\FollowController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\PostCommentController;
use App\Http\Controllers\Api\V1\CommentLikeController;

Route::prefix('v1')->group(function () {
    // Authentication routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });

    // Shop routes
    Route::apiResource('shops', ShopController::class)->only(['index', 'show']);
    Route::apiResource('shops', ShopController::class)->middleware('auth:sanctum')->except(['index', 'show']);

    // Product routes
    Route::apiResource('products', ProductController::class)->only(['index', 'show']);
    Route::apiResource('products', ProductController::class)->middleware('auth:sanctum')->except(['index', 'show']);

    // Post routes
    Route::apiResource('posts', PostController::class)->only(['index', 'show']);
    Route::apiResource('posts', PostController::class)->middleware('auth:sanctum')->except(['index', 'show']);
    Route::post('/posts/{post}/like', [PostController::class, 'likeOrUnlike'])->middleware('auth:sanctum');

    // Order routes
    Route::apiResource('posts.comments', PostCommentController::class)->middleware('auth:sanctum');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/vendor/orders', [OrderController::class, 'vendorOrders']);
    });
    Route::apiResource('orders', OrderController::class);

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
});
