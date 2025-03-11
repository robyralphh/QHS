<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLaboratoryRequest;
use App\Http\Requests\UpdateLaboratoryRequest;
use App\Http\Resources\LaboratoryResource;
use App\Models\Laboratory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class LaboratoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return LaboratoryResource::collection(
            Laboratory::query()->orderBy('id','desc')->get()
        );
    }

    /**
     * Show the form for creating a new resource.
     */

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLaboratoryRequest $request)
    {
        $data = $request->validated();

        $laboratory = Laboratory::create($data);
        return response(new LaboratoryResource($laboratory),201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Laboratory $laboratory)
    {
        return new LaboratoryResource($laboratory);
    }

    /**
     * Show the form for editing the specified resource.
     *

     * Update the specified resource in storage.
     */
    public function update(UpdateLaboratoryRequest $request, Laboratory $laboratory)
    {
        $data = $request->validated();
    
        if (array_key_exists('custodianID', $data)) {
            if ($data['custodianID'] === null) {
                $data['custodianID'] = null;
            } else {
                $existingLaboratory = Laboratory::where('custodianID', $data['custodianID'])
                    ->where('id', '!=', $laboratory->id) // Exclude the current laboratory
                    ->first();  
                if ($existingLaboratory) {
                    return response()->json([
                        'message' => 'This custodian is already assigned to another laboratory.',
                    ], 422); 
                }
            }
        }
        if ($request->hasFile('gallery')) {
            $storage = Storage::disk('public');
            if ($laboratory->gallery) {
                $storage->delete($laboratory->gallery);
            }
            $imageName = Str::random(32) . "." . $request->gallery->getClientOriginalExtension();
            $data['gallery'] = $request->file('gallery')->storeAs('gallery', $imageName, 'public');
        }else{
            unset($data['gallery']);
        }

        $laboratory->update($data);
    
        return new LaboratoryResource($laboratory);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Laboratory $laboratory)
    {
        $laboratory->delete();

        return response('',204);
    }
}
