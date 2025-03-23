<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LaboratoryController;
use App\http\Controllers\EquipmentController;
use App\http\Controllers\EquipmentItemController;
use App\Http\Controllers\CategoryController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('/users', UserController::class);
    Route::apiResource('/laboratories', LaboratoryController::class);
    Route::apiResource('/equipment', EquipmentController::class);
    Route::apiResource('/item', EquipmentItemController::class);
    Route::apiResource('/categories', CategoryController::class);
});



