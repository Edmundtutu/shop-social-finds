<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
        Log::info('🚀 MessageSent event created', [
            'message_id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender_id' => $message->sender_id,
            'sender_type' => $message->sender_type
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        Log::info('📡 MessageSent broadcastOn called', [
            'message_id' => $this->message->id
        ]);

        try {
            $conversation = $this->message->conversation;
            
            if (!$conversation) {
                Log::error('❌ No conversation found for message', [
                    'message_id' => $this->message->id,
                    'conversation_id' => $this->message->conversation_id
                ]);
                return [];
            }

            Log::info('💬 Conversation loaded', [
                'conversation_id' => $conversation->id,
                'user_id' => $conversation->user_id,
                'shop_id' => $conversation->shop_id
            ]);
            
            $channels = [
                // Original conversation channel for active chat real-time features
                new PrivateChannel('conversation.' . $this->message->conversation_id),
                
                // Customer user channel for global notifications and badge updates
                new PrivateChannel('user.' . $conversation->user_id),
            ];
            
            Log::info('📺 Base channels created', [
                'conversation_channel' => 'conversation.' . $this->message->conversation_id,
                'user_channel' => 'user.' . $conversation->user_id
            ]);
            
            // Add shop owner channel if shop and owner exist
            if ($conversation->shop) {
                Log::info('🏪 Shop found', [
                    'shop_id' => $conversation->shop->id,
                    'owner_id' => $conversation->shop->owner_id ?? 'NULL'
                ]);
                
                if ($conversation->shop->owner_id) {
                    $channels[] = new PrivateChannel('user.' . $conversation->shop->owner_id);
                    Log::info('👤 Shop owner channel added', [
                        'shop_owner_channel' => 'user.' . $conversation->shop->owner_id
                    ]);
                } else {
                    Log::warning('⚠️ Shop has no owner_id');
                }
            } else {
                Log::warning('⚠️ No shop found in conversation');
            }
            
            $channelNames = array_map(function($channel) {
                return $channel->name;
            }, $channels);
            
            Log::info('✅ All channels prepared for broadcast', [
                'channels' => $channelNames,
                'total_channels' => count($channels)
            ]);
            
            return $channels;
            
        } catch (\Exception $e) {
            Log::error('💥 Error in MessageSent broadcastOn', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [];
        }
    }

    public function broadcastAs(): string
    {
        Log::info('🎯 MessageSent broadcastAs called');
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        $data = [
            'id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'sender_id' => $this->message->sender_id,
            'sender_type' => $this->message->sender_type,
            'content' => $this->message->content,
            'message_type' => $this->message->message_type,
            'media_url' => $this->message->media_url,
            'created_at' => $this->message->created_at,
            'updated_at' => $this->message->updated_at,
            'read_at' => $this->message->read_at,
        ];
        
        Log::info('📦 MessageSent broadcastWith called', [
            'data' => $data
        ]);
        
        return $data;
    }
    /**
     * Determine if this event should be queued.
     */
    public function shouldQueue(): bool
    {
        Log::info('⏰ MessageSent shouldQueue called - returning false for immediate broadcast');
        return false; // Broadcast immediately for real-time performance
    }
}
