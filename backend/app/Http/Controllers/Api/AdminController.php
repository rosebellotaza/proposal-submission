<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Personnel;
use App\Models\ResearchProject;
use App\Models\OralPresentation;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // GET /api/admin/proposals
    // Get all submitted proposals waiting for scheduling
    public function proposals(Request $request)
    {
        $proposals = ResearchProject::whereIn('status', [
                'Submitted',
                'Presentation Scheduled',
                'Under Evaluation',
                'Evaluated',
                'Endorsed',
                'Recommended',
                'Forwarded',
                'Approved',
                'Rejected',
                'For Revision',
            ])
            ->with(['creator', 'departmentCenter', 'oralPresentation.evaluators'])
            ->latest()
            ->get();

        return response()->json($proposals);
    }

    // GET /api/admin/evaluators
    // Get all evaluators available to assign
    public function evaluators()
    {
        $evaluators = Personnel::where('role', 'evaluator')
            ->where('is_active', true)
            ->get(['id', 'name', 'email', 'rank', 'expertise']);

        return response()->json($evaluators);
    }

    // POST /api/admin/schedule
    // Schedule an oral presentation and assign evaluators
    public function schedule(Request $request)
    {
        $data = $request->validate([
            'research_project_id' => 'required|exists:research_projects,id',
            'presentation_date'   => 'required|date',
            'presentation_time'   => 'required',
            'venue'               => 'required|string',
            'evaluator_ids'       => 'required|array|min:1',
            'evaluator_ids.*'     => 'exists:personnel,id',
        ]);

        // Create or update oral presentation
        $presentation = OralPresentation::updateOrCreate(
            ['research_project_id' => $data['research_project_id']],
            [
                'scheduled_by'      => $request->user()->id,
                'presentation_date' => $data['presentation_date'],
                'presentation_time' => $data['presentation_time'],
                'venue'             => $data['venue'],
            ]
        );

        // Sync evaluators
        $presentation->evaluators()->sync($data['evaluator_ids']);

        // Update project status
        $project = ResearchProject::find($data['research_project_id']);
        $project->update(['status' => 'Presentation Scheduled']);

        return response()->json([
            'message'      => 'Oral presentation scheduled successfully.',
            'presentation' => $presentation->load('evaluators'),
        ]);
    }

    // GET /api/admin/users
    // Get all personnel
    public function users()
    {
        $users = Personnel::with(['college', 'departmentCenter'])
            ->latest()
            ->get();

        return response()->json($users);
    }

    // PUT /api/admin/users/{id}/toggle
    // Activate or deactivate a user
    public function toggleUser($id)
    {
        $user = Personnel::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message'   => 'User status updated.',
            'is_active' => $user->is_active,
        ]);
    }
}