<?php

namespace App\Http\Controllers\Api\V1\OrderHandlers;

use App\Http\Controllers\Controller;
use App\Http\Filters\V1\ProductFilter;
use App\Http\Requests\Api\V1\StoreProductRequest;
use App\Http\Requests\Api\V1\UpdateProductRequest;
use App\Http\Resources\Api\V1\ProductResource;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // Instantiate the filter
        $filter = new ProductFilter();
        // Transform the request parameters into filter conditions
        $filterItems = $filter->transform($request);

        // Start building the query
        $query = Product::query();

        // Separate search filters and other filters
        $searchFilters = [];
        $otherFilters = [];
        foreach ($filterItems as $item) {
            if (in_array($item[0], ['name', 'description', 'tags']) && $item[1] === 'LIKE') {
                $searchFilters[] = $item;
            } else {
                $otherFilters[] = $item;
            }
        }

        // Apply non-search filters
        $query->where($otherFilters);

        // Apply search filters within an orWhere group
        if (!empty($searchFilters)) {
            $query->where(function ($q) use ($searchFilters) {
                foreach ($searchFilters as $searchItem) {
                    $q->orWhere($searchItem[0], $searchItem[1], $searchItem[2]);
                }
            });
        }

        // Apply eager loading for the shop and reviews relationships
        $query->with(['shop', 'reviews']);

        // Pagination (default 10 per page)
        $perPage = (int) ($request->query('per_page', 10));
        $products = $query->paginate($perPage)->appends($request->query());

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();
        $shop = Shop::findOrFail($validated['shop_id']);

        $this->authorize('create', [Product::class, $shop]);

        $categoryIds = $validated['category_ids'] ?? [];
        unset($validated['category_ids']);

        $product = Product::create($validated);
        if (!empty($categoryIds)) {
            $product->categories()->sync($categoryIds);
        }

        return new ProductResource($product);
    }

    public function show(Product $product)
    {
        return new ProductResource($product->load(['shop', 'reviews']));
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $this->authorize('update', $product);

        $validated = $request->validated();
        $categoryIds = $validated['category_ids'] ?? null;
        unset($validated['category_ids']);
        $product->update($validated);
        if (is_array($categoryIds)) {
            $product->categories()->sync($categoryIds);
        }

        return new ProductResource($product);
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        $product->delete();

        return response()->noContent();
    }
}
