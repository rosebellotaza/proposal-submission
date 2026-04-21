<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Approval;
use App\Models\ResearchProject;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Sequence mapping per role
    |--------------------------------------------------------------------------
    | rde_division_chief → 1 → Endorsed
    | campus_director    → 2 → Recommended
    | vprie              → 3 → Forwarded
    | president          → 4 → Approved / Rejected
    */
    private const ROLE_SEQUENCE = [
        'rde_division_chief' => 1,
        'campus_director'    => 2,
        'vprie'              => 3,
        'president'          => 4,
    ];

    private const ROLE_ACTION = [
        'rde_division_chief' => 'Endorsed',
        'campus_director'    => 'Recommended',
        'vprie'              => 'Forwarded',
        'president'          => 'Approved',
    ];

    private const ROLE_LABELS = [
        'rde_division_chief' => 'Division Chief for RDIE',
        'campus_director'    => 'Campus Director',
        'vprie'              => 'Vice President for RIES',
        'president'          => 'University President',
    ];

    // GET /api/approval/pending
    // Get proposals waiting for this approver's action
    public function pending(Request $request)
    {
        $role     = $request->user()->role;
        $sequence = self::ROLE_SEQUENCE[$role] ?? null;

        if (!$sequence) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Required status for each step
        $requiredStatus = [
            1 => 'Evaluated',
            2 => 'Endorsed',
            3 => 'Recommended',
            4 => 'Forwarded',
        ];

        $proposals = ResearchProject::where('status', $requiredStatus[$sequence])
            ->with(['creator', 'departmentCenter', 'evaluations'])
            ->latest()
            ->get()
            ->map(function ($p) {
                return [
                    'id'               => $p->id,
                    'reference_no'     => $p->reference_no,
                    'title'            => $p->title,
                    'status'           => $p->status,
                    'submitted_by'     => $p->creator?->name,
                    'average_score'    => $p->average_score,
                    'budget'           => $p->budget,
                    'type'             => $p->type,
                    'start_date'       => $p->start_date,
                    'end_date'         => $p->end_date,
                ];
            });

        return response()->json($proposals);
    }

    // POST /api/approval/act
    // Approve, endorse, recommend, forward, reject, or return a proposal
    public function act(Request $request)
    {
        $role     = $request->user()->role;
        $sequence = self::ROLE_SEQUENCE[$role] ?? null;

        if (!$sequence) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'research_project_id' => 'required|exists:research_projects,id',
            'action'              => 'required|in:approve,reject,return',
            'remarks'             => 'nullable|string',
            'reference_no'        => 'nullable|string',
            'signature_image'     => 'nullable|string',
            'signature_type'      => 'nullable|in:draw,upload,type',
        ]);

        $project = ResearchProject::findOrFail($data['research_project_id']);

        // Determine action label
        if ($data['action'] === 'approve') {
            $actionLabel = self::ROLE_ACTION[$role];
        } elseif ($data['action'] === 'reject') {
            $actionLabel = 'Rejected';
        } else {
            $actionLabel = 'Returned';
        }

        // Save approval record
        Approval::updateOrCreate(
            [
                'research_project_id' => $project->id,
                'sequence_no'         => $sequence,
            ],
            [
                'personnel_id'    => $request->user()->id,
                'role_at_approval'=> self::ROLE_LABELS[$role],
                'action'          => $actionLabel,
                'reference_no'    => $data['reference_no'] ?? null,
                'remarks'         => $data['remarks'] ?? null,
                'signature_image' => $data['signature_image'] ?? null,
                'signature_type'  => $data['signature_type'] ?? null,
                'acted_at'        => now(),
            ]
        );

        return response()->json([
            'message' => "Proposal {$actionLabel} successfully.",
            'project' => $project->fresh(),
        ]);
    }

    // GET /api/approval/history/{projectId}
    // Get all approval records for a project
    public function history($projectId)
    {
        $approvals = Approval::where('research_project_id', $projectId)
            ->with('personnel')
            ->orderBy('sequence_no')
            ->get();

        return response()->json($approvals);
    }
}