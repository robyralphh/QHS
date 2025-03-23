<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Category extends Model
{
    use HasFactory;

    // Specify the table name (optional, if it follows Laravel's naming convention)
    protected $table = 'categories';

    // Define fillable fields for mass assignment
    protected $fillable = [
        'name',
    ];

    public $timestamps = true;
    
    public function equipment()
    {
        return $this->belongsToMany(Equipment::class, 'equipment_categories');
    }
}