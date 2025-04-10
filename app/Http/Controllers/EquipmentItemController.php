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
    public function index()
    {
        $items = EquipmentItem::query()->orderBy('id', 'desc')->get();
        return EquipmentItemResource::collection($items);
    }

    public function store(StoreItemRequest $request)
    {
        $data = $request->validated();
        
        // Generate the unit_id
        $data['unit_id'] = EquipmentItem::generateUnitId($data['equipment_id']);
        
        // Create a new equipment item
        $item = EquipmentItem::create($data);
        
        return response(new EquipmentItemResource($item), 201);
    }

    public function show($id)
    {
        Log::info('Fetching equipment item with ID: ' . $id);
        $equipmentItem = EquipmentItem::find($id);

        if (!$equipmentItem) {
            return response()->json(['message' => 'Equipment item not found'], 404);
        }

        return new EquipmentItemResource($equipmentItem);
    }

    public function update(UpdateItemRequest $request, $id)
    {
        $equipmentItem = EquipmentItem::find($id);

        if (!$equipmentItem) {
            return response()->json(['message' => 'Equipment item not found'], 404);
        }

        $data = $request->validated();
        $equipmentItem->update($data); // unit_id remains unchanged

        return new EquipmentItemResource($equipmentItem);
    }

    public function destroy($id)
    {
        $equipmentItem = EquipmentItem::find($id);

        if (!$equipmentItem) {
            return response()->json(['message' => 'Equipment item not found'], 404);
        }

        $equipmentItem->delete();
        return response('', 204);
    }
}