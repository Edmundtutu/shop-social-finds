<?php

use App\Models\User;
use App\Models\Shop;
use App\Models\Product;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Like;

beforeEach(function () {
    $this->seed();
    $this->vendor = User::factory()->vendor()->create();
    $this->customer = User::factory()->customer()->create();
    $this->shop = Shop::factory()->create(['owner_id' => $this->vendor->id]);
    $this->product = Product::factory()->create(['shop_id' => $this->shop->id]);
});

describe('Post API', function () {
    it('lists all posts', function () {
        Post::factory()->count(5)->create();

        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/posts');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'content',
                        'images',
                        'user' => [
                            'id',
                            'name',
                        ],
                        'product' => [
                            'id',
                            'name',
                        ],
                        'shop' => [
                            'id',
                            'name',
                        ],
                        'comments_count',
                        'likes_count',
                    ]
                ],
                'links',
                'meta'
            ]);
    });

    it('shows a specific post with comments and likes', function () {
        $post = Post::factory()->create(['user_id' => $this->vendor->id]);
        
        Comment::factory()->count(2)->create([
            'commentable_id' => $post->id,
            'commentable_type' => Post::class,
        ]);

        Like::factory()->count(3)->create([
            'likeable_id' => $post->id,
            'likeable_type' => Post::class,
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/posts/{$post->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'content',
                    'images',
                    'user' => [
                        'id',
                        'name',
                    ],
                    'comments' => [
                        '*' => [
                            'id',
                            'body',
                            'user' => [
                                'id',
                                'name',
                            ]
                        ]
                    ],
                    'likes_count',
                    'comments_count',
                    'is_liked_by_user',
                ]
            ]);
    });

    it('allows users to create posts', function () {
        $postData = [
            'content' => 'Check out this amazing product from my shop!',
            'images' => [
                'https://example.com/image1.jpg',
                'https://example.com/image2.jpg'
            ],
            'product_id' => $this->product->id,
            'shop_id' => $this->shop->id,
        ];

        $response = $this->actingAs($this->vendor)
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'content',
                    'images',
                    'user' => [
                        'id',
                        'name',
                    ],
                    'product' => [
                        'id',
                        'name',
                    ],
                    'shop' => [
                        'id',
                        'name',
                    ]
                ]
            ]);

        $this->assertDatabaseHas('posts', [
            'user_id' => $this->vendor->id,
            'content' => 'Check out this amazing product from my shop!',
            'product_id' => $this->product->id,
            'shop_id' => $this->shop->id,
        ]);
    });

    it('allows users to create simple posts without product/shop references', function () {
        $postData = [
            'content' => 'Just sharing my thoughts today!',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('posts', [
            'user_id' => $this->customer->id,
            'content' => 'Just sharing my thoughts today!',
            'product_id' => null,
            'shop_id' => null,
        ]);
    });

    it('allows users to update their own posts', function () {
        $post = Post::factory()->create(['user_id' => $this->vendor->id]);

        $updateData = [
            'content' => 'Updated post content',
        ];

        $response = $this->actingAs($this->vendor)
            ->putJson("/api/v1/posts/{$post->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'content' => 'Updated post content',
            ]);

        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'content' => 'Updated post content',
        ]);
    });

    it('prevents users from updating other users posts', function () {
        $post = Post::factory()->create(['user_id' => $this->vendor->id]);

        $updateData = [
            'content' => 'Hacked post content',
        ];

        $response = $this->actingAs($this->customer)
            ->putJson("/api/v1/posts/{$post->id}", $updateData);

        $response->assertStatus(403);
    });

    it('allows users to delete their own posts', function () {
        $post = Post::factory()->create(['user_id' => $this->vendor->id]);

        $response = $this->actingAs($this->vendor)
            ->deleteJson("/api/v1/posts/{$post->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('posts', [
            'id' => $post->id,
        ]);
    });

    it('prevents users from deleting other users posts', function () {
        $post = Post::factory()->create(['user_id' => $this->vendor->id]);

        $response = $this->actingAs($this->customer)
            ->deleteJson("/api/v1/posts/{$post->id}");

        $response->assertStatus(403);
    });

    it('requires authentication for post operations', function () {
        $post = Post::factory()->create();

        // List posts
        $this->getJson('/api/v1/posts')
            ->assertStatus(401);

        // Show post
        $this->getJson("/api/v1/posts/{$post->id}")
            ->assertStatus(401);

        // Create post
        $this->postJson('/api/v1/posts', [])
            ->assertStatus(401);

        // Update post
        $this->putJson("/api/v1/posts/{$post->id}", [])
            ->assertStatus(401);

        // Delete post
        $this->deleteJson("/api/v1/posts/{$post->id}")
            ->assertStatus(401);
    });

    it('validates required fields when creating post', function () {
        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/posts', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    });

    it('validates content length', function () {
        $postData = [
            'content' => '', // Empty content
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    });

    it('validates that product_id exists when provided', function () {
        $postData = [
            'content' => 'Test post',
            'product_id' => '999999',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['product_id']);
    });

    it('validates that shop_id exists when provided', function () {
        $postData = [
            'content' => 'Test post',
            'shop_id' => '999999',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['shop_id']);
    });

    it('returns 404 for non-existent post', function () {
        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/posts/999999');

        $response->assertStatus(404);
    });

    it('filters posts by user', function () {
        Post::factory()->create(['user_id' => $this->vendor->id]);
        Post::factory()->create(['user_id' => $this->customer->id]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/posts?user_id={$this->vendor->id}");

        $response->assertStatus(200);
        
        $posts = $response->json('data');
        foreach ($posts as $post) {
            expect($post['user']['id'])->toBe($this->vendor->id);
        }
    });

    it('searches posts by content', function () {
        Post::factory()->create(['content' => 'Amazing electronics for sale']);
        Post::factory()->create(['content' => 'Fashion trends this season']);

        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/posts?search=electronics');

        $response->assertStatus(200);
        
        $posts = $response->json('data');
        expect(collect($posts)->pluck('content'))->toContain('Amazing electronics for sale');
    });

    it('sorts posts by creation date', function () {
        $post1 = Post::factory()->create(['created_at' => now()->subHours(2)]);
        $post2 = Post::factory()->create(['created_at' => now()->subHour()]);
        $post3 = Post::factory()->create(['created_at' => now()]);

        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/posts?sort=created_at&order=desc');

        $response->assertStatus(200);
        
        $posts = $response->json('data');
        expect($posts[0]['id'])->toBe($post3->id);
        expect($posts[1]['id'])->toBe($post2->id);
        expect($posts[2]['id'])->toBe($post1->id);
    });

    it('sorts posts by likes count', function () {
        $post1 = Post::factory()->create();
        $post2 = Post::factory()->create();
        $post3 = Post::factory()->create();

        // Add different numbers of likes
        Like::factory()->count(1)->create(['likeable_id' => $post1->id, 'likeable_type' => Post::class]);
        Like::factory()->count(5)->create(['likeable_id' => $post2->id, 'likeable_type' => Post::class]);
        Like::factory()->count(3)->create(['likeable_id' => $post3->id, 'likeable_type' => Post::class]);

        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/posts?sort=likes&order=desc');

        $response->assertStatus(200);
        
        $posts = $response->json('data');
        expect($posts[0]['id'])->toBe($post2->id); // 5 likes
        expect($posts[1]['id'])->toBe($post3->id); // 3 likes
        expect($posts[2]['id'])->toBe($post1->id); // 1 like
    });

    it('shows if current user has liked the post', function () {
        $post = Post::factory()->create();
        
        // Current user likes the post
        Like::factory()->create([
            'user_id' => $this->customer->id,
            'likeable_id' => $post->id,
            'likeable_type' => Post::class,
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/posts/{$post->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'is_liked_by_user' => true,
            ]);
    });

    it('paginates posts list', function () {
        Post::factory()->count(25)->create();

        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/posts');

        $response->assertStatus(200);
        
        $data = $response->json();
        expect($data['data'])->toHaveCount(15); // Default pagination
        expect($data['links'])->toHaveKey('next');
    });

    it('includes engagement metrics in post list', function () {
        $post = Post::factory()->create();
        
        Comment::factory()->count(3)->create([
            'commentable_id' => $post->id,
            'commentable_type' => Post::class,
        ]);

        Like::factory()->count(5)->create([
            'likeable_id' => $post->id,
            'likeable_type' => Post::class,
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/posts');

        $response->assertStatus(200);
        
        $posts = $response->json('data');
        $targetPost = collect($posts)->firstWhere('id', $post->id);
        
        expect($targetPost['comments_count'])->toBe(3);
        expect($targetPost['likes_count'])->toBe(5);
    });
});
