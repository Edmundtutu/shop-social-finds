<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Shop>
 */
class ShopFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
                $businessTypes = [
            'Electronics Store', 'Fashion Boutique', 'Home & Garden', 'Beauty Salon',
            'Restaurant', 'Grocery Store', 'Bookstore', 'Jewelry Shop',
            'Sports Equipment', 'Pet Store', 'Pharmacy', 'Coffee Shop'
        ];

        $businessHours = [
            'monday' => ['open' => '08:00', 'close' => '18:00'],
            'tuesday' => ['open' => '08:00', 'close' => '18:00'],
            'wednesday' => ['open' => '08:00', 'close' => '18:00'],
            'thursday' => ['open' => '08:00', 'close' => '18:00'],
            'friday' => ['open' => '08:00', 'close' => '20:00'],
            'saturday' => ['open' => '09:00', 'close' => '20:00'],
            'sunday' => ['open' => '10:00', 'close' => '16:00'],
        ];

        return [
            'owner_id' => User::factory()->vendor(),
            'name' => $this->faker->randomElement($businessTypes) . ' - ' . $this->faker->lastName(),
            'description' => $this->faker->realText(200),
            'address' => $this->faker->address(),
            'lat' => $this->faker->latitude(-1.5, 1.5), // Kenya/East Africa region
            'lng' => $this->faker->longitude(36, 42), // Kenya/East Africa region
            'avatar' => $this->faker->imageUrl(300, 300, 'business'),
            'cover_image' => $this->faker->imageUrl(800, 400, 'business'),
            'phone' => $this->faker->phoneNumber(),
            'hours' => $businessHours,
            'verified' => $this->faker->boolean(30), // 30% chance of being verified
        ];
    }
}
