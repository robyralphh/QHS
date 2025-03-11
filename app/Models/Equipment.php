<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Equipment extends Model
{
    use HasFactory;

    protected $table = 'equipment';

    protected $fillable = [
        'name',
        'description',
        'image',
        'condition',
        'laboratory_id',
    ];

    public $timestamps = true;

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function items()
    {
        return $this->hasMany(EquipmentItem::class);
    }

}
