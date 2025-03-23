<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Equipment extends Model
{
    use HasFactory;

    // Specify the table name (optional, if it follows Laravel's naming convention)
    protected $table = 'equipment'; // Adjust if your table name is different, e.g., 'equipments'

    // Define fillable fields for mass assignment
    protected $fillable = [
        'name',
        'image',
        'description',
        'condition',
        'laboratory_id',
    ];

    public $timestamps = true;
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'equipment_categories');
    }

    public function equipmentItem()
    {
        return $this->hasMany(EquipmentItem::class);
    }

}
