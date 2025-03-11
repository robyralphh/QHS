<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EquipmentItem extends Model
{
    protected $fillable = [
        'equipment_id', 
        'serial_number', 
        'condition',
    ];

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }
}
