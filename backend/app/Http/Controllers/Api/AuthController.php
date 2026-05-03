<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Personnel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // POST /api/register
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:personnel,email',
            'password'              => 'required|string|min:6|confirmed',
            'role'                  => 'required|in:researcher,evaluator,rde_division_chief,campus_director,vprie,president,admin',

            'department'            => 'nullable|string|max:255',
            'position'              => 'nullable|string|max:255',
            'rank'                  => 'nullable|string|max:255',
            'expertise'             => 'nullable|string|max:255',
            'join_date'             => 'nullable|date',
            'is_active'             => 'nullable|boolean',
        ]);

        $user = Personnel::create([
            'name'       => $data['name'],
            'email'      => $data['email'],
            'password'   => Hash::make($data['password']),
            'role'       => $data['role'],

            'department' => $data['department'] ?? null,
            'position'   => $data['position'] ?? null,
            'rank'       => $data['rank'] ?? null,
            'expertise'  => $data['expertise'] ?? null,
            'join_date'  => $data['join_date'] ?? null,
            'is_active'  => $data['is_active'] ?? true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    // POST /api/login
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
            'role'     => 'required|string',
        ]);

        $user = Personnel::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->role !== $data['role']) {
            throw ValidationException::withMessages([
                'role' => ["This account is registered as {$user->role}, not {$data['role']}."],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account has been deactivated.'],
            ]);
        }

        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    // GET /api/me
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}