<?php

namespace App\Http\Controllers;

use App\Http\Resources\EquipmentItemResource;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Models\EquipmentItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EquipmentItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Fetch all equipment items ordered by ID in descending order
        $items = EquipmentItem::query()->orderBy('id', 'desc')->get();
        
        // Return the collection as a resource
        return EquipmentItemResource::collection($items);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreItemRequest $request)
    {
        // Validate the request data
        $data = $request->validated();
        
        // Create a new equipment item
        $item = EquipmentItem::create($data);
        
        // Return the created item as a resource with a 201 status code
        return response(new EquipmentItemResource($item), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        // Log the ID being requested for debugging
        Log::info('Fetching equipment item with ID: ' . $id);

        // Find the equipment item by ID
        $equipmentItem = EquipmentItem::find($id);

        // If the item is not found, return a 404 response
        if (!$equipmentItem) {
            return response()->json(['message' => 'Equipment item not found'], 404);
        }

        // Return the found item as a resource
        return new EquipmentItemResource($equipmentItem);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateItemRequest $request, $id)
    {
        // Find the equipment item by ID
        $equipmentItem = EquipmentItem::find($id);

        // If the item is not found, return a 404 response
        if (!$equipmentItem) {
            return response()->json(['message' => 'Equipment item not found'], 404);
        }

        // Validate the request data
        $data = $request->validated();

        // Update the equipment item
        $equipmentItem->update($data);

        // Return the updated item as a resource
        return new EquipmentItemResource($equipmentItem);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        // Find the equipment item by ID
        $equipmentItem = EquipmentItem::find($id);

        // If the item is not found, return a 404 response
        if (!$equipmentItem) {
            return response()->json(['message' => 'Equipment item not found'], 404);
        }

        // Delete the equipment item
        $equipmentItem->delete();

        // Return a 204 No Content response
        return response('', 204);
    }
}