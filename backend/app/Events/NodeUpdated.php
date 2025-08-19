<?php

namespace App\Events;

use App\Models\InventoryNode;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class NodeUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public InventoryNode $node;

    /**
     * Create a new event instance.
     */
    public function __construct(InventoryNode $node)
    {
        $this->node = $node;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('shopInventory.' . $this->node->shop_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'node.updated';
    }

    public function broadcastWith(): array
    {
        return (new \App\Http\Resources\Api\V1\InventoryNodeResource($this->node))->jsonSerialize();
    }
}
