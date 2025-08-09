<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Shop;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ShopResource;
use App\Http\Requests\Api\V1\StoreShopRequest;
use App\Http\Filters\V1\ShopFilter;
use App\Http\Requests\Api\V1\UpdateShopRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Shop::query();

        // Text search across multiple columns using a single 'search' param
        if ($request->filled('search')) {
            $search = '%' . $request->query('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', $search)
                  ->orWhere('description', 'LIKE', $search)
                  ->orWhere('address', 'LIKE', $search);
            });
        }

        // Location filtering using Haversine formula (distance in km)
        if ($request->has(['lat', 'lng', 'radius'])) {
            $lat = (float) $request->query('lat');
            $lng = (float) $request->query('lng');
            $radius = (float) $request->query('radius');

            $haversine = "(6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat))))";
            $query->select('*')
                  ->selectRaw("{$haversine} AS distance", [$lat, $lng, $lat])
                  ->whereRaw("{$haversine} < ?", [$lat, $lng, $lat, $radius])
                  ->orderBy('distance');
        }

        // Structured filters via ApiFilter
        $filter = new ShopFilter();
        foreach ($filter->transform($request) as $clause) {
            [$column, $op, $value] = $clause;
            switch ($op) {
                case 'IN':
                    $values = is_array($value) ? $value : explode(',', (string) $value);
                    $query->whereIn($column, $values);
                    break;
                case 'NOT IN':
                    $values = is_array($value) ? $value : explode(',', (string) $value);
                    $query->whereNotIn($column, $values);
                    break;
                case 'BETWEEN':
                    $bounds = is_array($value) ? $value : explode(',', (string) $value);
                    if (count($bounds) === 2) {
                        $query->whereBetween($column, [$bounds[0], $bounds[1]]);
                    }
                    break;
                case 'NOT BETWEEN':
                    $bounds = is_array($value) ? $value : explode(',', (string) $value);
                    if (count($bounds) === 2) {
                        $query->whereNotBetween($column, [$bounds[0], $bounds[1]]);
                    }
                    break;
                default:
                    // LIKE should include wildcards if client didn't supply
                    if ($op === 'LIKE' && is_string($value) && strpos($value, '%') === false) {
                        $value = '%' . $value . '%';
                    }
                    $query->where($column, $op, $value);
            }
        }

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
