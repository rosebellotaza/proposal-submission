<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchProject;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    // GET /api/projects
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'researcher') {
            // Researcher sees only their own projects
            $projects = ResearchProject::where('created_by', $user->id)
                ->with(['departmentCenter', 'creator', 'proponents.personnel'])
                ->latest()
                ->get();
        } else {
            // Evaluators, admins, approvers see all projects
            $projects = ResearchProject::with(['departmentCenter', 'creator', 'proponents.personnel'])
                ->latest()
                ->get();
        }

        return response()->json($projects);
    }

    // POST /api/projects
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'                  => 'required|string|max:255',
            'type'                   => 'required|in:Research,ICT,Extension,ORGMS,Others',
            'category'               => 'nullable|in:Basic Research,Applied Research,Developmental Research,Action Research',
            'department_center_id'   => 'nullable|exists:department_centers,id',
            'lead_agency'            => 'nullable|string',
            'address'                => 'nullable|string',
            'tel_fax'                => 'nullable|string',
            'email'                  => 'nullable|email',
            'site_area'              => 'nullable|string',
            'start_date'             => 'nullable|date',
            'end_date'               => 'nullable|date|after_or_equal:start_date',
            'expected_completion_date' => 'nullable|date',
            'duration_months'        => 'nullable|integer|min:1',
            'budget'                 => 'nullable|numeric|min:0',
            'nature_and_significance'=> 'nullable|string',
            'issues_to_address'      => 'nullable|string',
            'objectives'             => 'nullable|string',
            'concept'                => 'nullable|string',
            'beneficiaries'          => 'nullable|string',
            'stakeholders'           => 'nullable|string',
            'methodology'            => 'nullable|string',
            'significance_impact'    => 'nullable|string',
        ]);

        $project = ResearchProject::create([
            ...$data,
            'created_by' => $request->user()->id,
            'status'     => 'Draft',
        ]);

        // Auto-add creator as Leader proponent
        $project->proponents()->create([
            'personnel_id' => $request->user()->id,
            'role'         => 'Leader',
        ]);

        return response()->json($project->load(['departmentCenter', 'creator', 'proponents.personnel']), 201);
    }

    // GET /api/projects/{id}
    public function show(Request $request, $id)
    {
        $project = ResearchProject::with([
            'departmentCenter',
            'creator',
            'proponents.personnel',
            'proposal',
            'oralPresentation.evaluators',
            'evaluations.evaluator',
            'approvals.personnel',
            'statusHistories.changedBy',
        ])->findOrFail($id);

        return response()->json($project);
    }

    // PUT /api/projects/{id}
    public function update(Request $request, $id)
    {
        $project = ResearchProject::where('created_by', $request->user()->id)
            ->findOrFail($id);

        $data = $request->validate([
            'title'                  => 'sometimes|string|max:255',
            'type'                   => 'sometimes|in:Research,ICT,Extension,ORGMS,Others',
            'category'               => 'nullable|in:Basic Research,Applied Research,Developmental Research,Action Research',
            'department_center_id'   => 'nullable|exists:department_centers,id',
            'lead_agency'            => 'nullable|string',
            'address'                => 'nullable|string',
            'site_area'              => 'nullable|string',
            'start_date'             => 'nullable|date',
            'end_date'               => 'nullable|date',
            'budget'                 => 'nullable|numeric|min:0',
            'nature_and_significance'=> 'nullable|string',
            'issues_to_address'      => 'nullable|string',
            'objectives'             => 'nullable|string',
            'methodology'            => 'nullable|string',
            'significance_impact'    => 'nullable|string',
        ]);

        $project->update($data);

        return response()->json($project->fresh());
    }

    // POST /api/projects/{id}/submit
    public function submit(Request $request, $id)
    {
        $project = ResearchProject::where('created_by', $request->user()->id)
            ->where('status', 'Draft')
            ->findOrFail($id);

        $project->update(['status' => 'Submitted']);

        return response()->json([
            'message' => 'Proposal submitted successfully.',
            'project' => $project->fresh(),
        ]);
    }
}
