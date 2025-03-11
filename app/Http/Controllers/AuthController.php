<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class AuthController extends Controller
{
    
    public function login(LoginRequest $request)
    {

        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($data)) {
            return response()->json([
                'message' => 'Email or password is incorrect.',
            ], 401); 
        }

        $user = Auth::user();

        if (!$user->isActive) {
            Auth::logout(); 
            return response()->json([
                'message' => 'Your account is inactive. Please contact the administrator.',
            ], 403);
        }

        $token = $user->createToken('main')->plainTextToken;
        $redirectUrl = $this->getRedirectUrlBasedOnRole($user->role);

        return response()->json([
            'user' => $user,
            'token' => $token,
            'redirectUrl' => $redirectUrl,
        ]);
    }

    private function getRedirectUrlBasedOnRole($role)
    {
        switch ($role) {
            case 'admin':
                return '/admin';
            case 'custodian':
                return '/manager/dashboard';
            case 'user':
                return '/';
            default:
                return '/'; // Default landing page
        }
    }

    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'isActive' => true,
            'role' => 'user',
        ]);

        return response()->json([
            'redirectUrl' => '/login',
        ]);
    }


    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('',204);
    }
}