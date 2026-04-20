<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /*
    |--------------------------------------------------------------------------
    | PROPONENTS
    |--------------------------------------------------------------------------
    | Maps to "List of Personnel Involved in RDE" from the PDF.
    | Links personnel (researchers) to a research project with their role.
    | Also stores their uploaded CV file path.
    |
    | This is what the Team.jsx page manages.
    */
    public function up(): void
    {
        Schema::create('proponents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained('research_projects')->cascadeOnDelete();
            $table->foreignId('personnel_id')->constrained('personnel')->cascadeOnDelete();

            $table->enum('role', ['Leader', 'Co-Leader', 'Member'])->default('Member');
            $table->string('cv_path')->nullable();
            // Path to uploaded PDF CV file in storage

            $table->timestamps();

            // A person can only have one role per project
            $table->unique(['research_project_id', 'personnel_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proponents');
    }
};
