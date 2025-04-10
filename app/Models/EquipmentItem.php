<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class EquipmentItem extends Model
{
    use HasFactory;

    protected $table = 'equipment_items';
    
    protected $fillable = [
        'equipment_id', 
        'condition',
        'isBorrowed',
        'unit_id', // Add unit_id to fillable
    ];

    public $timestamps = true;

    public function Equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    public static function generateUnitId($equipmentId)
    {
        // Get the last unit for this equipment_id to determine the next UnitID
        $lastItem = self::where('equipment_id', $equipmentId)
                        ->orderBy('unit_id', 'desc')
                        ->first();

        $nextUnitNumber = 1; // Default to 1 if no previous units exist
        if ($lastItem && $lastItem->unit_id) {
            $lastUnitId = (int) substr($lastItem->unit_id, -4); // Extract last 4 digits
            $nextUnitNumber = $lastUnitId + 1;
        }

        // Format: equipmentID (2 digits) + UnitID (4 digits)
        return sprintf("%02d%04d", $equipmentId, $nextUnitNumber);
    }
}