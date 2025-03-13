<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EquipmentItem extends Model
{
    protected $fillable = [
        'equipment_id', 
        'condition',
        'status',
        'isBorrowed',
    ];

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }
}
