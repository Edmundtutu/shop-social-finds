<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
                $images = [];
        if ($this->faker->boolean(40)) { // 40% chance of having images
            $imageCount = $this->faker->numberBetween(1, 3);
            for ($i = 0; $i < $imageCount; $i++) {
                $images[] = $this->faker->imageUrl(600, 400, 'social');
            }
        }

        return [
            'user_id' => User::factory(),
            'content' => $this->faker->realText(300),
            'images' => $images,
            'product_id' => $this->faker->optional(0.3)->passthrough(null), // Will be set in seeder if needed
            'shop_id' => $this->faker->optional(0.2)->passthrough(null), // Will be set in seeder if needed
        ];
    }
}
