<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Shop;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ShopResource;
use App\Http\Requests\Api\V1\StoreShopRequest;
use App\Http\Filters\V1\ShopFilter;
use App\Http\Requests\Api\V1\UpdateShopRequest;
use Illuminate\Support\Facades\Auth;

class ShopController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filter = new ShopFilter();
        $filterItems = $filter->transform($request);

        // Handle location filtering
        if (request()->has(['lat', 'lng', 'radius'])) {
            $lat = $request->query('lat');
            $lng = $request->query('lng');
            $radius = $request->query('radius'); // in km

            $query = Shop::query();
            $haversine = "(6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat))))";
            $query->select('*')
                ->selectRaw("{$haversine} AS distance", [$lat, $lng, $lat])
            $query->whereRaw(
                "{$haversine} < ?", [$lat, $lng, $lat, $radius]
            );
        } else {
            $query = Shop::query();
        }

        $query->where($filterItems);
        $query->with('reviews'); // Eager load reviews for rating/total reviews
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
