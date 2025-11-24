<?php

namespace Database\Factories;

use App\Models\Subaccount;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\Subaccount>
 */
class SubaccountFactory extends Factory
{
    protected $model = Subaccount::class;

    public function definition(): array
    {
        $businessName = fake()->company() . ' ' . fake()->randomElement(['Kitchen', 'Foods', 'Market', 'Bakery']);

        return [
            'user_id' => User::factory(),
            'subaccount_id' => 'SA-' . strtoupper(Str::random(10)),
            'business_name' => $businessName,
            'business_email' => fake()->companyEmail(),
            'business_phone' => fake()->numerify('256#########'),
            'business_address' => fake()->address(),
            'bank_name' => fake()->randomElement([
                'Stanbic Bank Uganda',
                'Absa Bank Uganda',
                'Centenary Bank',
                'DFCU Bank',
            ]),
            'bank_code' => fake()->numerify('0##'),
            'account_number' => fake()->numerify('##########'),
            'split_value_in_percentage' => fake()->numberBetween(10, 50),
        ];
    }
}
