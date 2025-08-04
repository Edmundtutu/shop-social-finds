<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Shop;
use App\Models\Post;
use App\Models\Review;
use App\Models\Comment;
use App\Models\Like;
use App\Models\Follow;
use App\Policies\Api\V1\OrderPolicy;
use App\Policies\Api\V1\PostPolicy;
use App\Policies\Api\V1\ReviewPolicy;
use App\Policies\Api\V1\CommentPolicy;
use App\Policies\Api\V1\LikePolicy;
use App\Policies\Api\V1\FollowPolicy;
use App\Policies\Api\V1\ProductPolicy;
use App\Policies\Api\V1\ShopPolicy;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });

        Gate::policy(Shop::class, ShopPolicy::class);
        Gate::policy(Product::class, ProductPolicy::class);
        Gate::policy(Post::class, PostPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(Review::class, ReviewPolicy::class);
        Gate::policy(Comment::class, CommentPolicy::class);
        Gate::policy(Like::class, LikePolicy::class);
        Gate::policy(Follow::class, FollowPolicy::class);
    }
}
