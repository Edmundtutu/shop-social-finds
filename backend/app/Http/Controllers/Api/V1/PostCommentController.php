php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Comment;
use App\Http\Resources\Api\V1\CommentResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class PostCommentController extends Controller
{
    /**
     * Display a listing of the comments for a post.
     */
    public function index(Post $post)
    {
        return CommentResource::collection($post->comments()->with('user')->latest()->paginate(10));
    }

    /**
     * Store a newly created comment for a post in storage.
     */
    public function store(Request $request, Post $post)
    {
        $request->validate(['body' => 'required|string']);

        $comment = $post->comments()->create([
            'user_id' => auth()->id(),
            'body' => $request->input('body')
        ]);

        return response()->json(new CommentResource($comment->load('user')), 201);
    }

    /**
     * Remove the specified comment from storage.
     */
    public function destroy(Post $post, Comment $comment)
    {
        // Ensure the comment belongs to the post
        if ($comment->commentable_id !== $post->id || $comment->commentable_type !== Post::class) {
            abort(404, 'Comment not found on this post.');
        }

        $this->authorize('delete', $comment);

        $comment->delete();

        return response()->noContent();
    }
}
