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
    ];

    public $timestamps = true;

    public function Equipment()
    {
        return $this->belongsTo(Equipment::class);
    }
}
