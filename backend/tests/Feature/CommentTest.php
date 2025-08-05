<?php

use App\Models\User;
use App\Models\Shop;
use App\Models\Product;
use App\Models\Post;
use App\Models\Comment;

beforeEach(function () {
    $this->seed();
    $this->vendor = User::factory()->vendor()->create();
    $this->customer = User::factory()->customer()->create();
    $this->shop = Shop::factory()->create(['owner_id' => $this->vendor->id]);
    $this->product = Product::factory()->create(['shop_id' => $this->shop->id]);
    $this->post = Post::factory()->create(['user_id' => $this->vendor->id]);
});

describe('Comment API', function () {
    it('allows users to comment on posts', function () {
        $commentData = [
            'commentable_id' => $this->post->id,
            'commentable_type' => 'post',
            'body' => 'Great post! Thanks for sharing.',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/comments', $commentData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'body',
                    'user' => [
                        'id',
                        'name',
                    ],
                    'commentable' => [
                        'id',
                        'content',
                    ]
                ]
            ]);

        $this->assertDatabaseHas('comments', [
            'user_id' => $this->customer->id,
            'commentable_id' => $this->post->id,
            'commentable_type' => Post::class,
            'body' => 'Great post! Thanks for sharing.',
        ]);
    });

    it('allows users to comment on products', function () {
        $commentData = [
            'commentable_id' => $this->product->id,
            'commentable_type' => 'product',
            'body' => 'Is this product still available?',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/comments', $commentData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('comments', [
            'user_id' => $this->customer->id,
            'commentable_id' => $this->product->id,
            'commentable_type' => Product::class,
            'body' => 'Is this product still available?',
        ]);
    });

    it('lists comments for a post', function () {
        Comment::factory()->count(3)->create([
            'commentable_id' => $this->post->id,
            'commentable_type' => Post::class,
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/posts/{$this->post->id}/comments");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'body',
                        'user' => [
                            'id',
                            'name',
                        ]
                    ]
                ],
                'links',
                'meta'
            ]);
    });

    it('lists comments for a product', function () {
        Comment::factory()->count(3)->create([
            'commentable_id' => $this->product->id,
            'commentable_type' => Product::class,
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/products/{$this->product->id}/comments");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'body',
                        'user' => [
                            'id',
                            'name',
                        ]
                    ]
                ]
            ]);
    });

    it('shows a specific comment', function () {
        $comment = Comment::factory()->create([
            'user_id' => $this->customer->id,
            'commentable_id' => $this->post->id,
            'commentable_type' => Post::class,
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/comments/{$comment->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'body',
                    'user' => [
                        'id',
                        'name',
                    ],
                    'commentable' => [
                        'id',
                    ]
                ]
            ]);
    });

    it('allows users to update their own comments', function () {
        $comment = Comment::factory()->create([
            'user_id' => $this->customer->id,
            'commentable_id' => $this->post->id,
            'commentable_type' => Post::class,
        ]);

        $updateData = [
            'body' => 'Updated comment content',
        ];

        $response = $this->actingAs($this->customer)
            ->putJson("/api/v1/comments/{$comment->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'body' => 'Updated comment content',
            ]);

        $this->assertDatabaseHas('comments', [
            'id' => $comment->id,
            'body' => 'Updated comment content',
        ]);
    });

    it('prevents users from updating other users comments', function () {
        $otherUser = User::factory()->create();
        $comment = Comment::factory()->create([
            'user_id' => $otherUser->id,
            'commentable_id' => $this->post->id,
            'commentable_type' => Post::class,
        ]);

        $updateData = [
            'body' => 'Hacked comment',
        ];

        $response = $this->actingAs($this->customer)
            ->putJson("/api/v1/comments/{$comment->id}", $updateData);

        $response->assertStatus(403);
    });

    it('allows users to delete their own comments', function () {
        $comment = Comment::factory()->create([
            'user_id' => $this->customer->id,
            'commentable_id' => $this->post->id,
            'commentable_type' => Post::class,
        ]);

        $response = $this->actingAs($this->customer)
            ->deleteJson("/api/v1/comments/{$comment->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('comments', [
            'id' => $comment->id,
        ]);
    });

    it('prevents users from deleting other users comments', function () {
        $otherUser = User::factory()->create();
        $comment = Comment::factory()->create([
            'user_id' => $otherUser->id,
            'commentable_id' => $this->post->id,
            'commentable_type' => Post::class,
        ]);

        $response = $this->actingAs($this->customer)
            ->deleteJson("/api/v1/comments/{$comment->id}");

        $response->assertStatus(403);
    });

    it('allows post/product owners to delete comments on their content', function () {
        $comment = Comment::factory()->create([
            'user_id' => $this->customer->id,
            'commentable_id' => $this->post->id,
            'commentable_type' => Post::class,
        ]);

        $response = $this->actingAs($this->vendor) // Post owner
            ->deleteJson("/api/v1/comments/{$comment->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('comments', [
            'id' => $comment->id,
        ]);
    });

    it('requires authentication for comment operations', function () {
        $comment = Comment::factory()->create();

        // Create comment
        $this->postJson('/api/v1/comments', [])
            ->assertStatus(401);

        // Show comment
        $this->getJson("/api/v1/comments/{$comment->id}")
            ->assertStatus(401);

        // Update comment
        $this->putJson("/api/v1/comments/{$comment->id}", [])
            ->assertStatus(401);

        // Delete comment
        $this->deleteJson("/api/v1/comments/{$comment->id}")
            ->assertStatus(401);
    });

    it('validates required fields when creating comment', function () {
        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/comments', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['commentable_id', 'commentable_type', 'body']);
    });

    it('validates commentable_type values', function () {
        $commentData = [
            'commentable_id' => $this->post->id,
            'commentable_type' => 'invalid_type',
            'body' => 'Test comment',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/comments', $commentData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['commentable_type']);
    });

    it('validates that commentable_id exists', function () {
        $commentData = [
            'commentable_id' => '999999',
            'commentable_type' => 'post',
            'body' => 'Test comment',
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/comments', $commentData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['commentable_id']);
    });

    it('validates comment body length', function () {
        $commentData = [
            'commentable_id' => $this->post->id,
            'commentable_type' => 'post',
            'body' => '', // Empty body
        ];

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/comments', $commentData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['body']);
    });

    it('returns 404 for non-existent comment', function () {
        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/comments/999999');

        $response->assertStatus(404);
    });

    it('returns 404 for non-existent post when listing comments', function () {
        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/posts/999999/comments');

        $response->assertStatus(404);
    });

    it('returns 404 for non-existent product when listing comments', function () {
        $response = $this->actingAs($this->customer)
            ->getJson('/api/v1/products/999999/comments');

        $response->assertStatus(404);
    });

    it('sorts comments by creation date', function () {
        $comment1 = Comment::factory()->create([
            'commentable_id' => $this->post->id,
            'commentable_type' => Post::class,
            'created_at' => now()->subHours(2),
        ]);

        $comment2 = Comment::factory()->create([
            'commentable_id' => $this->post->id,
            'commentable_type' => Post::class,
            'created_at' => now()->subHour(),
        ]);

        $comment3 = Comment::factory()->create([
            'commentable_id' => $this->post->id,
            'commentable_type' => Post::class,
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/posts/{$this->post->id}/comments?sort=created_at&order=desc");

        $response->assertStatus(200);
        
        $comments = $response->json('data');
        expect($comments[0]['id'])->toBe($comment3->id);
        expect($comments[1]['id'])->toBe($comment2->id);
        expect($comments[2]['id'])->toBe($comment1->id);
    });

    it('paginates comments list', function () {
        Comment::factory()->count(25)->create([
            'commentable_id' => $this->post->id,
            'commentable_type' => Post::class,
        ]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/posts/{$this->post->id}/comments");

        $response->assertStatus(200);
        
        $data = $response->json();
        expect($data['data'])->toHaveCount(15); // Default pagination
        expect($data['links'])->toHaveKey('next');
    });

    it('includes comment likes count in response', function () {
        $comment = Comment::factory()->create([
            'commentable_id' => $this->post->id,
            'commentable_type' => Post::class,
        ]);

        // Add some likes to the comment
        $users = User::factory()->count(3)->create();
        foreach ($users as $user) {
            $comment->likes()->create(['user_id' => $user->id]);
        }

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/comments/{$comment->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'likes_count' => 3,
            ]);
    });

    it('shows if current user has liked the comment', function () {
        $comment = Comment::factory()->create([
            'commentable_id' => $this->post->id,
            'commentable_type' => Post::class,
        ]);

        // Current user likes the comment
        $comment->likes()->create(['user_id' => $this->customer->id]);

        $response = $this->actingAs($this->customer)
            ->getJson("/api/v1/comments/{$comment->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'is_liked_by_user' => true,
            ]);
    });
});
