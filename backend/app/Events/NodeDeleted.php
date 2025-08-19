<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class NodeDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $nodeId;
    public string $shopId;

    /**
     * Create a new event instance.
     */
    public function __construct(string $nodeId, string $shopId)
    {
        $this->nodeId = $nodeId;
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
        return 'node.deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->nodeId,
        ];
    }
}
