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

    // GET /api/admin/faculty
    // Used by Faculty Management and Proponents dropdown
    public function faculty()
    {
        $faculty = Personnel::where('role', 'researcher')
            ->where('is_active', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
                'role',
                'college_id',
                'department_center_id',
                'department',
                'position',
                'rank',
                'gender',           
                'contact_number', 
                'expertise',       
                'is_active',
                'created_at',
            ]);

        return response()->json($faculty);
    }

    // GET /api/admin/evaluators
    public function evaluators()
    {
        $evaluators = Personnel::where('role', 'evaluator')
            ->where('is_active', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
                'rank',
                'expertise',
                'position',
                'is_active',
                'created_at',
            ]);

        return response()->json($evaluators);
    }

    // POST /api/admin/schedule
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

        $presentation = OralPresentation::updateOrCreate(
            ['research_project_id' => $data['research_project_id']],
            [
                'scheduled_by'      => $request->user()->id,
                'presentation_date' => $data['presentation_date'],
                'presentation_time' => $data['presentation_time'],
                'venue'             => $data['venue'],
            ]
        );

        $presentation->evaluators()->sync($data['evaluator_ids']);

        $project = ResearchProject::findOrFail($data['research_project_id']);
        $project->update(['status' => 'Presentation Scheduled']);

        return response()->json([
            'message'      => 'Oral presentation scheduled successfully.',
            'presentation' => $presentation->load('evaluators'),
        ]);
    }

    // GET /api/admin/users
    public function users()
    {
        $users = Personnel::with(['college', 'departmentCenter'])
            ->latest()
            ->get();

        return response()->json($users);
    }

    // PUT /api/admin/users/{id}/toggle
    public function toggleUser($id)
    {
        $user = Personnel::findOrFail($id);

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        return response()->json([
            'message'   => 'User status updated.',
            'is_active' => $user->is_active,
        ]);
    }

    // PUT /api/admin/users/{id}/update
    public function updateUser(Request $request, $id)
    {
        $user = Personnel::findOrFail($id);

        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|max:255|unique:personnel,email,' . $id,
            'department' => 'nullable|string|max:255',
            'position'   => 'nullable|string|max:255',
            'rank'       => 'nullable|string|max:255',
            'expertise'  => 'nullable|string|max:255',
            'is_active'  => 'nullable|boolean',
            'join_date'  => 'nullable|date',
            'gender'         => 'nullable|string|max:50',
            'contact_number' => 'nullable|string|max:50',
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'User updated successfully.',
            'user'    => $user,
        ]);
    }

    // DELETE /api/admin/users/{id}
    public function deleteUser($id)
    {
        $user = Personnel::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }
}