<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\MessageSent;
use App\Events\TypingStarted;
use App\Events\TypingStopped;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    /**
     * Get or create conversation for an order
     */
    public function getConversation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|ulid|exists:orders,id',
        ]);

        $order = Order::with(['user', 'shop'])->findOrFail($validated['order_id']);
        
        // Check if user can access this conversation
        if (Auth::user()->id !== $order->user_id && !Auth::user()->shops->contains('id', $order->shop_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $conversation = Conversation::firstOrCreate(
            [
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'shop_id' => $order->shop_id,
            ],
            [
                'status' => 'active',
            ]
        );

        $conversation->load(['messages.sender', 'order', 'user', 'shop']);

        return response()->json([
            'conversation' => $conversation,
        ]);
    }

    /**
     * Send a message in a conversation
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => 'required|integer|exists:conversations,id',
            'content' => 'required|string|max:1000',
            'message_type' => 'required|in:text,image,audio',
            'media_url' => 'nullable|string|url',
        ]);

        $conversation = Conversation::findOrFail($validated['conversation_id']);
        
        // Check if user can send messages in this conversation
        if (Auth::user()->id !== $conversation->user_id && !Auth::user()->shops->contains('id', $conversation->shop_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message = DB::transaction(function () use ($validated, $conversation) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => Auth::user()->id,
                'sender_type' => Auth::user()->shops->contains('id', $conversation->shop_id) ? 'shop' : 'user',
                'content' => $validated['content'],
                'message_type' => $validated['message_type'],
                'media_url' => $validated['media_url'] ?? null,
            ]);

            // Update conversation last_message_at
            $conversation->update(['last_message_at' => now()]);

            return $message;
        });

        $message->load(['sender', 'conversation.shop']);

        // Broadcast the message
        event(new MessageSent($message));

        return response()->json([
            'message' => $message,
        ], 201);
    }

    /**
     * Get conversation messages
     */
    public function getMessages(Request $request, int $conversationId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);
        
        // Check if user can access this conversation
        if (Auth::user()->id !== $conversation->user_id && !Auth::user()->shops->contains('id', $conversation->shop_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        return response()->json([
            'messages' => $messages,
        ]);
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request, int $conversationId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);
        
        // Check if user can access this conversation
        if (Auth::user()->id !== $conversation->user_id && !Auth::user()->shops->contains('id', $conversation->shop_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $senderType = Auth::user()->shops->contains('id', $conversation->shop_id) ? 'shop' : 'user';
        
        // Mark unread messages from the other party as read
        $conversation->messages()
            ->where('sender_type', '!=', $senderType)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Messages marked as read']);
    }

    /**
     * Get user's conversations
     */
    public function getUserConversations(): JsonResponse
    {
        $conversations = Conversation::where('user_id', Auth::user()->id)
            ->with(['shop', 'order', 'latestMessage'])
            ->orderBy('last_message_at', 'desc')
            ->paginate(20);

        return response()->json([
            'conversations' => $conversations,
        ]);
    }

    /**
     * Get shop's conversations
     */
    public function getShopConversations(): JsonResponse
    {
        $shopIds = Auth::user()->shops->pluck('id');
        
        $conversations = Conversation::whereIn('shop_id', $shopIds)
            ->with(['user', 'order', 'latestMessage'])
            ->orderBy('last_message_at', 'desc')
            ->paginate(20);

        return response()->json([
            'conversations' => $conversations,
        ]);
    }

    /**
     * Start typing indicator
     */
    public function startTyping(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => 'required|integer|exists:conversations,id',
        ]);

        $conversation = Conversation::findOrFail($validated['conversation_id']);
        
        // Check if user can access this conversation
        if (Auth::user()->id !== $conversation->user_id && !Auth::user()->shops->contains('id', $conversation->shop_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $userType = Auth::user()->shops->contains('id', $conversation->shop_id) ? 'shop' : 'user';
        $userName = $userType === 'shop' ? $conversation->shop->name : $conversation->user->name;

        // Broadcast typing started event
        event(new TypingStarted($conversation->id, Auth::user()->id, $userType, $userName));

        return response()->json(['message' => 'Typing started']);
    }

    /**
     * Stop typing indicator
     */
    public function stopTyping(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => 'required|integer|exists:conversations,id',
        ]);

        $conversation = Conversation::findOrFail($validated['conversation_id']);
        
        // Check if user can access this conversation
        if (Auth::user()->id !== $conversation->user_id && !Auth::user()->shops->contains('id', $conversation->shop_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $userType = Auth::user()->shops->contains('id', $conversation->shop_id) ? 'shop' : 'user';

        // Broadcast typing stopped event
        event(new TypingStopped($conversation->id, Auth::user()->id, $userType));

        return response()->json(['message' => 'Typing stopped']);
    }

}
