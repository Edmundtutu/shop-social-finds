<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePostRequest extends FormRequest
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
            'product_id' => 'sometimes|nullable|ulid|exists:products,id',
            'shop_id' => 'sometimes|nullable|ulid|exists:shops,id',
            'content' => 'sometimes|required|string',
            'images' => 'sometimes|nullable|json',
        ];
    }
}
