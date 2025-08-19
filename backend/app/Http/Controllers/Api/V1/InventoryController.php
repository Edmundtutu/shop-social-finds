<?php

namespace App\Http\Controllers\API\V1;
use Illuminate\Http\Request;
use App\Models\InventoryNode;
use App\Models\InventoryNodeEdge;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\InventoryNodeResource;
use App\Http\Resources\Api\V1\InventoryNodeEdgeResource;

class InventoryController extends Controller
{
    public function getGraph($shopId)
    {
        $nodes = InventoryNode::where('shop_id', $shopId)->get();
        $edges = InventoryNodeEdge::with(['sourceNode', 'targetNode'])
            ->where('shop_id', $shopId)
            ->get();
            
        return response()->json([
            'nodes' => InventoryNodeResource::collection($nodes),
            'edges' => InventoryNodeEdgeResource::collection($edges)
        ]);
    }
    
    public function updateNodePosition(Request $request, InventoryNode $node)
    {
        $this->authorize('update', $node);
        
        $validated = $request->validate([
            'x' => 'required|integer',
            'y' => 'required|integer'
        ]);
        
        $node->update($validated);
        event(new \App\Events\NodePositionUpdated($node));
        
        return response()->json(['message' => 'Position updated']);
    }
}