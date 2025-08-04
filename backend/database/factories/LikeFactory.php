<?php

namespace Database\Factories;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Like>
 */
class LikeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
                $likeableType = $this->faker->randomElement([
            Post::class,
            Comment::class,
        ]);

        $likeable = $likeableType::inRandomOrder()->first();

        return [
            'user_id' => User::inRandomOrder()->first()->id,
            'likeable_id' => $likeable->id,
            'likeable_type' => $likeableType,
        ];
    }
}
