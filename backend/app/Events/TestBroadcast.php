<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class TestBroadcast implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function broadcastOn(): array
    {
        Log::info('🧪 TestBroadcast broadcasting to conversation.10');
        return [
            new PrivateChannel('conversation.10'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'test.message';
    }

    public function broadcastWith(): array
    {
        return [
            'test' => 'Hello World',
            'timestamp' => now()->toISOString()
        ];
    }

    public function shouldQueue(): bool
    {
        return false;
    }
}