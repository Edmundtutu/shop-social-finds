<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inventory_node_edges', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('shop_id')->constrained('shops')->cascadeOnDelete();
            $table->foreignUlid('source_node_id')->constrained('inventory_nodes')->cascadeOnDelete();
            $table->foreignUlid('target_node_id')->constrained('inventory_nodes')->cascadeOnDelete();
            $table->string('label', 50)->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('shop_id');
            $table->index(['source_node_id', 'target_node_id']);
        });
        
        // SQLite doesn't support CHECK constraints in ALTER TABLE
        // The constraint will be enforced at the application level
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_node_edges');
    }
};
