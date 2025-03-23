<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'laboratory_id' => $this->laboratory_id,
            'image' => $this->image,
            'name' => $this->name,
            'condition' => $this->condition,
            'description' => $this->description,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Include related categories
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
        ];
    }
}