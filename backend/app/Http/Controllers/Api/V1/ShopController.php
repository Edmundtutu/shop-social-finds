<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Shop;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ShopResource;
use App\Http\Requests\Api\V1\StoreShopRequest;
use App\Http\Requests\Api\V1\UpdateShopRequest;
use Illuminate\Support\Facades\Auth;

class ShopController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
                $query = Shop::query();

        // Handle search
        if (request('search')) {
            $query->where('name', 'like', '%' . request('search') . '%');
        }

        // Handle location filtering
        if (request()->has(['lat', 'lng', 'radius'])) {
            $query->whereRaw(
                'ST_Distance_Sphere(point(lng, lat), point(?, ?)) <= ?',
                [request('lng'), request('lat'), request('radius') * 1000] // radius in meters
            );
        }

        return ShopResource::collection($query->paginate());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreShopRequest $request)
    {
        $validated = $request->validated();
        $validated['owner_id'] = Auth::id();

        $shop = Shop::create($validated);

        return new ShopResource($shop);
    }

    /**
     * Display the specified resource.
     */
    public function show(Shop $shop)
    {
        return new ShopResource($shop);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateShopRequest $request, Shop $shop)
    {
        $this->authorize('update', $shop);

        $shop->update($request->validated());

        return new ShopResource($shop);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Shop $shop)
    {
        $this->authorize('delete', $shop);

        $shop->delete();

        return response()->noContent();
    }
}
