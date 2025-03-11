<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEquipmentRequest;
use App\Http\Requests\UpdateEquipmentRequest;
use App\Http\Resources\EquipmentResource;
use App\Models\Equipment;
use App\Models\Category;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return EquipmentResource::collection(
            Equipment::query()->orderBy('id', 'desc')->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEquipmentRequest $request)
    {
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            $imageName = Str::random(32) . "." . $request->image->getClientOriginalExtension();
            $data['image'] = $request->file('image')->storeAs('itemImage', $imageName, 'public');
        }

        // Create equipment
        $equipment = Equipment::create($data);

        // Attach categories if provided
        if (isset($data['categories'])) {
            $equipment->categories()->attach($data['categories']);
        }

        return response(new EquipmentResource($equipment), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Equipment $equipment)
    {
        return new EquipmentResource($equipment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEquipmentRequest $request, Equipment $equipment)
    {
        $data = $request->validated();
        if ($request->hasFile('image')) {
            $storage = Storage::disk('public');
    
            if ($equipment->image) {
                $storage->delete($equipment->image);
            }

            $imageName = Str::random(32) . "." . $request->image->getClientOriginalExtension();
            $data['image'] = $request->file('image')->storeAs('itemImage', $imageName, 'public');
        } else {
            unset($data['image']);
        }
        $equipment->update($data);
        if (isset($data['categories'])) {
            $equipment->categories()->sync($data['categories']);
        }

        return new EquipmentResource($equipment);
    }


    public function destroy(Equipment $equipment)
    {
        // Delete associated image if it exists
        if ($equipment->image) {
            Storage::disk('public')->delete($equipment->image);
        }

        $equipment->delete();

        return response('', 204);
    }
}