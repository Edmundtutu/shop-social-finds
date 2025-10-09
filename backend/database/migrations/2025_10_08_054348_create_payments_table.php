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
        Schema::create('payments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreignUlid('payer_id')->constrained('users'); // The customer paying for the service
            $table->foreignUlid('payee_id')->constrained('users'); // The vendor to whom the payment belongs
            $table->string('tx_ref');
            $table->string('status');
            $table->string('payment_method');
            $table->integer('amount');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
