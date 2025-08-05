<?php

use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Like;

beforeEach(function () {
    $this->seed();
    $this->user = User::factory()->customer()->create();
    $this->vendor = User::factory()->vendor()->create();
    $this->post = Post::factory()->create(['user_id' => $this->vendor->id]);
    $this->comment = Comment::factory()->create([
        'user_id' => $this->user->id,
        'commentable_id' => $this->post->id,
        'commentable_type' => Post::class,
    ]);
});

describe('Like API', function () {
    it('allows authenticated users to like a post', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/likes', [
                'likeable_id' => $this->post->id,
                'likeable_type' => 'post',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Item liked successfully.'
            ]);

        $this->assertDatabaseHas('likes', [
            'user_id' => $this->user->id,
            'likeable_id' => $this->post->id,
            'likeable_type' => Post::class,
        ]);
    });

    it('allows authenticated users to like a comment', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/likes', [
                'likeable_id' => $this->comment->id,
                'likeable_type' => 'comment',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Item liked successfully.'
            ]);

        $this->assertDatabaseHas('likes', [
            'user_id' => $this->user->id,
            'likeable_id' => $this->comment->id,
            'likeable_type' => Comment::class,
        ]);
    });

    it('prevents duplicate likes', function () {
        // First like
        $this->actingAs($this->user)
            ->postJson('/api/v1/likes', [
                'likeable_id' => $this->post->id,
                'likeable_type' => 'post',
            ]);

        // Attempt duplicate like
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/likes', [
                'likeable_id' => $this->post->id,
                'likeable_type' => 'post',
            ]);

        $response->assertStatus(409)
            ->assertJson([
                'message' => 'You have already liked this item.'
            ]);

        // Should only have one like in database
        $this->assertEquals(1, Like::where([
            'user_id' => $this->user->id,
            'likeable_id' => $this->post->id,
            'likeable_type' => Post::class,
        ])->count());
    });

    it('allows users to unlike items', function () {
        // First like the post
        $like = Like::factory()->create([
            'user_id' => $this->user->id,
            'likeable_id' => $this->post->id,
            'likeable_type' => Post::class,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson('/api/v1/likes', [
                'likeable_id' => $this->post->id,
                'likeable_type' => 'post',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Item unliked successfully.'
            ]);

        $this->assertDatabaseMissing('likes', [
            'id' => $like->id,
        ]);
    });

    it('returns 404 when trying to unlike non-existent like', function () {
        $response = $this->actingAs($this->user)
            ->deleteJson('/api/v1/likes', [
                'likeable_id' => $this->post->id,
                'likeable_type' => 'post',
            ]);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Like not found.'
            ]);
    });

    it('requires authentication for liking', function () {
        $response = $this->postJson('/api/v1/likes', [
            'likeable_id' => $this->post->id,
            'likeable_type' => 'post',
        ]);

        $response->assertStatus(401);
    });

    it('requires authentication for unliking', function () {
        $response = $this->deleteJson('/api/v1/likes', [
            'likeable_id' => $this->post->id,
            'likeable_type' => 'post',
        ]);

        $response->assertStatus(401);
    });

    it('validates required fields for liking', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/likes', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['likeable_id', 'likeable_type']);
    });

    it('validates likeable_type values', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/likes', [
                'likeable_id' => $this->post->id,
                'likeable_type' => 'invalid_type',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['likeable_type']);
    });

    it('validates that likeable_id exists', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/likes', [
                'likeable_id' => '999999',
                'likeable_type' => 'post',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['likeable_id']);
    });

    it('prevents users from deleting other users likes', function () {
        $otherUser = User::factory()->create();
        $like = Like::factory()->create([
            'user_id' => $otherUser->id,
            'likeable_id' => $this->post->id,
            'likeable_type' => Post::class,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson('/api/v1/likes', [
                'likeable_id' => $this->post->id,
                'likeable_type' => 'post',
            ]);

        $response->assertStatus(404);

        // Like should still exist
        $this->assertDatabaseHas('likes', [
            'id' => $like->id,
        ]);
    });
});
