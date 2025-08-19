<?php

namespace App\Events;

use App\Models\InventoryNodeEdge;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class EdgeCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public InventoryNodeEdge $edge;

    /**
     * Create a new event instance.
     */
    public function __construct(InventoryNodeEdge $edge)
    {
        $this->edge = $edge;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('shopInventory.' . $this->edge->shop_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'edge.created';
    }

    public function broadcastWith(): array
    {
        return (new \App\Http\Resources\Api\V1\InventoryNodeEdgeResource($this->edge))->jsonSerialize();
    }
}
