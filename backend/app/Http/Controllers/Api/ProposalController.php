<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchProject;
use App\Models\Proposal;
use Illuminate\Http\Request;

class ProposalController extends Controller
{
    // POST /api/projects/{id}/proposals
    public function store(Request $request, $id)
    {
        $project = ResearchProject::where('created_by', $request->user()->id)
            ->findOrFail($id);

        $data = $request->validate([
            'scholarly_work_type'     => 'required|in:Research,Extension,Instructional Material Development',
            'is_first_time'           => 'boolean',
            'has_external_collab'     => 'boolean',
            'external_collab_details' => 'nullable|string',
            'submitted_elsewhere'     => 'boolean',
            'other_agency_name'       => 'nullable|string',
            'other_agency_amount'     => 'nullable|numeric',
            'difference_explanation'  => 'nullable|string',
        ]);

        // Create or update proposal
        $proposal = Proposal::updateOrCreate(
            ['research_project_id' => $id],
            [
                ...$data,
                'submitted_at' => now(),
            ]
        );

        return response()->json($proposal, 201);
    }

    // GET /api/projects/{id}/proposals
    public function show($id)
    {
        $project  = ResearchProject::findOrFail($id);
        $proposal = $project->proposal;

        if (!$proposal) {
            return response()->json(['message' => 'No proposal found for this project.'], 404);
        }

        return response()->json($proposal);
    }
}