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
        // Eager load categories for better performance
        return EquipmentResource::collection(
            Equipment::with('categories')->orderBy('id', 'desc')->get()
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

        // Attach multiple categories if provided (expects array of category IDs)
        if (isset($data['category_ids']) && is_array($data['category_ids'])) {
            $equipment->categories()->attach($data['category_ids']);
        }

        return response(new EquipmentResource($equipment), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Equipment $equipment)
    {
        // Eager load categories for the single resource
        $equipment->load('categories');
        return new EquipmentResource($equipment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEquipmentRequest $request, Equipment $equipment)
    {
        $data = $request->validated();

        // Handle image upload
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

        // Update equipment
        $equipment->update($data);

        // Sync categories if provided (expects array of category IDs)
        if (isset($data['category_ids']) && is_array($data['category_ids'])) {
            $equipment->categories()->sync($data['category_ids']);
        }

        return new EquipmentResource($equipment);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Equipment $equipment)
    {
        // Delete associated image if it exists
        if ($equipment->image) {
            Storage::disk('public')->delete($equipment->image);
        }

        // This will automatically remove pivot table entries due to onDelete('cascade')
        $equipment->delete();

        return response('', 204);
    }
}