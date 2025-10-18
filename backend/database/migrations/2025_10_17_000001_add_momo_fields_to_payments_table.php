<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new
class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('provider')->default('flutterwave')->after('payment_method');
            $table->uuid('reference_id')->nullable()->after('tx_ref');
            $table->string('external_id')->nullable()->after('reference_id');
            $table->string('payer_number')->nullable()->after('payer_id');
            $table->string('currency')->default('UGX')->after('amount');
            $table->string('reason')->nullable()->after('status');
            $table->json('raw_response')->nullable()->after('reason');

            $table->index('provider');
            $table->index('reference_id');
            $table->index('external_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['provider']);
            $table->dropIndex(['reference_id']);
            $table->dropIndex(['external_id']);

            $table->dropColumn([
                'provider',
                'reference_id',
                'external_id',
                'payer_number',
                'currency',
                'reason',
                'raw_response',
            ]);
        });
    }
};


