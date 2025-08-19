<?php

namespace App\Events;

use App\Models\InventoryNode;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class NodePositionUpdated implements ShouldBroadcast
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
        return 'node.position.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->node->id,
            'x' => $this->node->x,
            'y' => $this->node->y
        ];
    }

}
