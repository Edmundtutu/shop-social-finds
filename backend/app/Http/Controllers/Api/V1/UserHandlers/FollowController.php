<?php

namespace App\Http\Controllers\Api\V1\UserHandlers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreFollowRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{

    /**
     * Follow a user.
     */
    public function store(StoreFollowRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $userToFollow = User::findOrFail($validated['user_id']);

        if (Auth::user()->isFollowing($userToFollow)) {
            return response()->json(['message' => 'You are already following this user.'], 409);
        }

        Auth::user()->following()->attach($userToFollow);

        return response()->json(['message' => 'Successfully followed the user.'], 201);
    }

    /**
     * Unfollow a user.
     */
    public function destroy(User $user): JsonResponse
    {
        if (!Auth::user()->isFollowing($user)) {
            return response()->json(['message' => 'You are not following this user.'], 404);
        }

        Auth::user()->following()->detach($user);

        return response()->json(null, 204);
    }

    /**
     * Get a list of users that the specified user is following.
     */
    public function following(User $user): JsonResponse
    {
        $following = $user->following()->with('shop')->paginate(15);
        return response()->json(UserResource::collection($following));
    }

    /**
     * Get a list of users that follow the specified user.
     */
    public function followers(User $user): JsonResponse
    {
        $followers = $user->followers()->with('shop')->paginate(15);
        return response()->json(UserResource::collection($followers));
    }
}
