<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Approval extends Model
{
    use HasFactory;

    protected $fillable = [
        'research_project_id',
        'personnel_id',
        'sequence_no',
        'role_at_approval',
        'action',
        'reference_no',
        'remarks',
        'signature_image',
        'signature_type',
        'acted_at',
    ];

    protected $casts = [
        'acted_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Sequence → Role mapping (for reference)
    |--------------------------------------------------------------------------
    | 1 → rde_division_chief  → Endorsed
    | 2 → campus_director     → Recommended
    | 3 → vprie               → Forwarded
    | 4 → president           → Approved / Rejected
    */
    public const SEQUENCE_ROLES = [
        1 => 'rde_division_chief',
        2 => 'campus_director',
        3 => 'vprie',
        4 => 'president',
    ];

    public const SEQUENCE_LABELS = [
        1 => 'Division Chief for RDIE',
        2 => 'Campus Director',
        3 => 'Vice President for RIES',
        4 => 'University President',
    ];

    // ── Auto-advance project status when an approval is saved ─────────────────

    protected static function booted(): void
    {
        static::created(function (Approval $approval) {
            $project = $approval->researchProject;

            $statusMap = [
                'Endorsed'    => 'Endorsed',
                'Recommended' => 'Recommended',
                'Forwarded'   => 'Forwarded',
                'Approved'    => 'Approved',
                'Rejected'    => 'Rejected',
                'Returned'    => 'For Revision',
            ];

            if (isset($statusMap[$approval->action])) {
                $project->update(['status' => $statusMap[$approval->action]]);
            }
        });
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function personnel()
    {
        return $this->belongsTo(Personnel::class);
    }
}
