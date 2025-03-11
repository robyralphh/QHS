<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEquipmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'image' => 'sometimes | nullable |image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'sometimes|string|max:255',
            'condition' => 'sometimes|string|max:255',
            'laboratory_id' => 'sometimes | int ',
        ];
    }
}
