<?php

namespace App\Http\Controllers;
use App\Http\Resources\EquipmentItemResource;
use App\Models\EquipmentItem;
use Illuminate\Http\Request;

class EquipmentItemController extends Controller
{
    public function index()
    {
        $items = EquipmentItem::all();
        return EquipmentItemResource::collection($items);
    }
    
    public function show(EquipmentItem $equipmentItem)
    {
        return new EquipmentItemResource($equipmentItem);
    }
}
