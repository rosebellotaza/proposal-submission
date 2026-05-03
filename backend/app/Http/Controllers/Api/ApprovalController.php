<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Approval;
use App\Models\ProposalStatusHistory;
use App\Models\ResearchProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    /*
    |--------------------------------------------------------------------------
    | GET /api/approval/pending
    |--------------------------------------------------------------------------
    */
    public function pending(Request $request)
    {
        $role     = $request->user()->role;
        $sequence = self::ROLE_SEQUENCE[$role] ?? null;

        if (!$sequence) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

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
                    'id'            => $p->id,
                    'reference_no'  => $p->reference_no,
                    'title'         => $p->title,
                    'status'        => $p->status,
                    'submitted_by'  => $p->creator?->name,
                    'average_score' => $p->average_score,
                    'budget'        => $p->budget,
                    'type'          => $p->type,
                    'start_date'    => $p->start_date,
                    'end_date'      => $p->end_date,
                    'department'    => $p->departmentCenter?->name,
                    'created_at'    => $p->created_at,
                ];
            });

        return response()->json($proposals);
    }

    /*
    |--------------------------------------------------------------------------
    | GET /api/approval/my-actions
    |--------------------------------------------------------------------------
    | Get proposals where the logged-in approver already acted.
    */
    public function myActions(Request $request)
    {
        $user = $request->user();

        $actions = Approval::where('personnel_id', $user->id)
            ->with([
                'researchProject.creator',
                'researchProject.departmentCenter',
                'researchProject.evaluations',
                'personnel',
            ])
            ->latest('acted_at')
            ->get()
            ->map(function ($approval) {
                $project = $approval->researchProject;

                return [
                    'approval_id'      => $approval->id,
                    'project_id'       => $project?->id,
                    'reference_no'     => $project?->reference_no,
                    'title'            => $project?->title,
                    'project_status'   => $project?->status,
                    'submitted_by'     => $project?->creator?->name,
                    'department'       => $project?->departmentCenter?->name,
                    'budget'           => $project?->budget,
                    'type'             => $project?->type,
                    'start_date'       => $project?->start_date,
                    'end_date'         => $project?->end_date,
                    'average_score'    => $project?->average_score,

                    'sequence_no'      => $approval->sequence_no,
                    'role_at_approval' => $approval->role_at_approval,
                    'action'           => $approval->action,
                    'remarks'          => $approval->remarks,
                    'reference_action_no' => $approval->reference_no,
                    'signature_image'  => $approval->signature_image,
                    'signature_type'   => $approval->signature_type,
                    'acted_at'         => $approval->acted_at?->format('Y-m-d h:i A'),
                    'acted_at_raw'     => $approval->acted_at,
                ];
            });

        return response()->json($actions);
    }

    /*
    |--------------------------------------------------------------------------
    | POST /api/approval/act
    |--------------------------------------------------------------------------
    */
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

        if ($data['action'] === 'approve') {
            $actionLabel = self::ROLE_ACTION[$role];
        } elseif ($data['action'] === 'reject') {
            $actionLabel = 'Rejected';
        } else {
            $actionLabel = 'Returned';
        }

        $statusMap = [
            'Endorsed'    => 'Endorsed',
            'Recommended' => 'Recommended',
            'Forwarded'   => 'Forwarded',
            'Approved'    => 'Approved',
            'Rejected'    => 'Rejected',
            'Returned'    => 'For Revision',
        ];

        $newStatus = $statusMap[$actionLabel];

        $approval = null;

        DB::transaction(function () use (
            $request,
            $project,
            $sequence,
            $role,
            $data,
            $actionLabel,
            $newStatus,
            &$approval
        ) {
            $approval = Approval::updateOrCreate(
                [
                    'research_project_id' => $project->id,
                    'sequence_no'         => $sequence,
                ],
                [
                    'personnel_id'      => $request->user()->id,
                    'role_at_approval'  => self::ROLE_LABELS[$role],
                    'action'            => $actionLabel,
                    'reference_no'      => $data['reference_no'] ?? null,
                    'remarks'           => $data['remarks'] ?? null,
                    'signature_image'   => $data['signature_image'] ?? null,
                    'signature_type'    => $data['signature_type'] ?? null,
                    'acted_at'          => now(),
                ]
            );

            $project->update([
                'status' => $newStatus,
            ]);

            ProposalStatusHistory::updateOrCreate(
                [
                    'research_project_id' => $project->id,
                    'status'              => $newStatus,
                ],
                [
                    'changed_by' => $request->user()->id,
                    'remarks'    => $data['remarks'] ?? null,
                ]
            );
        });

        return response()->json([
            'message'  => "Proposal {$actionLabel} successfully.",
            'approval' => $approval,
            'project'  => $project->fresh(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | GET /api/approval/history/{projectId}
    |--------------------------------------------------------------------------
    */
    public function history($projectId)
    {
        $approvals = Approval::where('research_project_id', $projectId)
            ->with('personnel')
            ->orderBy('sequence_no')
            ->get();

        return response()->json($approvals);
    }
}