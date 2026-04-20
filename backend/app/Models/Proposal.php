<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'research_project_id',
        'scholarly_work_type',
        'is_first_time',
        'has_external_collab',
        'external_collab_details',
        'submitted_elsewhere',
        'other_agency_name',
        'other_agency_amount',
        'difference_explanation',
        'proponent_signature',
        'submitted_at',
    ];

    protected $casts = [
        'is_first_time'       => 'boolean',
        'has_external_collab' => 'boolean',
        'submitted_elsewhere' => 'boolean',
        'submitted_at'        => 'datetime',
        'other_agency_amount' => 'decimal:2',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }
}
