<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipmentItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'equipment_id' => $this->equipment_id,     
            'unit_id' => $this->unit_id, // Add unit_id
            'condition' => $this->condition,
            'isBorrowed' => $this->isBorrowed,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}