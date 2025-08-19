<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class EdgeDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $edgeId;
    public string $shopId;

    /**
     * Create a new event instance.
     */
    public function __construct(string $edgeId, string $shopId)
    {
        $this->edgeId = $edgeId;
        $this->shopId = $shopId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('shopInventory.' . $this->shopId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'edge.deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->edgeId,
        ];
    }
}
