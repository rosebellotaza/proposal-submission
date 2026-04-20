<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_center_id',
        'created_by',
        'reference_no',
        'type',
        'title',
        'lead_agency',
        'address',
        'tel_fax',
        'email',
        'site_area',
        'start_date',
        'end_date',
        'expected_completion_date',
        'duration_months',
        'budget',
        'category',
        'nature_and_significance',
        'issues_to_address',
        'objectives',
        'concept',
        'beneficiaries',
        'stakeholders',
        'methodology',
        'significance_impact',
        'status',
    ];

    protected $casts = [
        'start_date'               => 'date',
        'end_date'                 => 'date',
        'expected_completion_date' => 'date',
        'budget'                   => 'decimal:2',
    ];

    // ── Auto-generate reference number on creation ────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (ResearchProject $project) {
            if (empty($project->reference_no)) {
                $year  = now()->year;
                $count = static::whereYear('created_at', $year)->count() + 1;
                $project->reference_no = sprintf('CSUCCRDE-%d-%05d', $year, $count);
            }
        });

        // Auto-write to status history whenever status changes
        static::updated(function (ResearchProject $project) {
            if ($project->wasChanged('status')) {
                ProposalStatusHistory::create([
                    'research_project_id' => $project->id,
                    'changed_by'          => auth()->id(),
                    'status'              => $project->status,
                ]);
            }
        });
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function departmentCenter()
    {
        return $this->belongsTo(DepartmentCenter::class);
    }

    public function creator()
    {
        return $this->belongsTo(Personnel::class, 'created_by');
    }

    public function proposal()
    {
        return $this->hasOne(Proposal::class);
    }

    public function proponents()
    {
        return $this->hasMany(Proponent::class);
    }

    public function teamMembers()
    {
        return $this->belongsToMany(Personnel::class, 'proponents', 'research_project_id', 'personnel_id')
                    ->withPivot('role', 'cv_path')
                    ->withTimestamps();
    }

    public function oralPresentation()
    {
        return $this->hasOne(OralPresentation::class);
    }

    public function evaluations()
    {
        return $this->hasMany(Evaluation::class);
    }

    public function approvals()
    {
        return $this->hasMany(Approval::class)->orderBy('sequence_no');
    }

    public function statusHistories()
    {
        return $this->hasMany(ProposalStatusHistory::class)->latest();
    }

    public function frameworks()
    {
        return $this->hasMany(ProjectFramework::class)->orderBy('year_no');
    }

    public function workPlans()
    {
        return $this->hasMany(WorkPlan::class);
    }

    public function budgetPlans()
    {
        return $this->hasMany(BudgetPlan::class)->orderBy('year_no');
    }

    public function outputs()
    {
        return $this->hasMany(Output::class);
    }

    public function referenceLiteratures()
    {
        return $this->hasMany(ReferenceLiterature::class)->orderBy('citation_no');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Total budget across all budget plan items */
    public function getTotalBudgetAttribute(): float
    {
        return $this->budgetPlans->sum('total_amount');
    }

    /** Average evaluation score across all submitted evaluations */
    public function getAverageScoreAttribute(): ?float
    {
        $scores = $this->evaluations->pluck('total_score');
        return $scores->count() ? round($scores->avg(), 2) : null;
    }
}
