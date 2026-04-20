<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /*
    |--------------------------------------------------------------------------
    | PERSONNEL
    |--------------------------------------------------------------------------
    | This is the users table for the system. Named "personnel" to match
    | the system notes ERD. The User model will point to this table.
    |
    | Roles:
    |   researcher         — Faculty / Proponent
    |   evaluator          — Panel member who scores proposals
    |   rde_division_chief — RDE Division Chief (Step 1 of approval chain)
    |   campus_director    — Campus Director (Step 2 of approval chain)
    |   vprie              — Vice President for RIES (Step 3)
    |   president          — University President (Step 4 / Final)
    |   admin              — RDE Staff / System Administrator
    */
    public function up(): void
    {
        Schema::create('personnel', function (Blueprint $table) {
            $table->id();
            $table->foreignId('college_id')->nullable()->constrained('colleges')->nullOnDelete();
            $table->foreignId('department_center_id')->nullable()->constrained('department_centers')->nullOnDelete();

            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');

            $table->enum('role', [
                'researcher',
                'evaluator',
                'rde_division_chief',
                'campus_director',
                'vprie',
                'president',
                'admin',
            ]);

            $table->string('gender', 10)->nullable();           // Male / Female
            $table->string('rank')->nullable();                 // e.g. Professor, Associate Professor
            $table->string('contact_number', 20)->nullable();
            $table->string('expertise')->nullable();            // For evaluators
            $table->boolean('is_active')->default(true);

            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personnel');
    }
};
