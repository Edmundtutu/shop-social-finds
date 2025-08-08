<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Shop;
use App\Models\Product;
use App\Http\Controllers\Controller;
use App\Http\Filters\V1\ProductFilter;
use Illuminate\Support\Facades\Request;
use App\Http\Resources\Api\V1\ProductResource;
use App\Http\Requests\Api\V1\StoreProductRequest;
use App\Http\Requests\Api\V1\UpdateProductRequest;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $filter = new ProductFilter();
        $fitered_request = $filter->transform($request);

        $products = Product::where($fitered_request)->paginate(10);

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();
        $shop = Shop::findOrFail($validated['shop_id']);

        $this->authorize('create', [Product::class, $shop]);

        $product = Product::create($validated);

        return new ProductResource($product);
    }

    public function show(Product $product)
    {
        return new ProductResource($product);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $this->authorize('update', $product);

        $product->update($request->validated());

        return new ProductResource($product);
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        $product->delete();

        return response()->noContent();
    }
}
