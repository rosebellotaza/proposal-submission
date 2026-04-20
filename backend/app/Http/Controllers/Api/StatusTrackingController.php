<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchProject;
use Illuminate\Http\Request;

class StatusTrackingController extends Controller
{
    // GET /api/projects/{projectId}/status-history
    public function index($projectId)
    {
        $project = ResearchProject::findOrFail($projectId);

        $history = $project->statusHistories()
            ->with('changedBy')
            ->latest()
            ->get()
            ->map(function ($h) {
                return [
                    'status'    => $h->status,
                    'remarks'   => $h->remarks,
                    'date'      => $h->created_at->format('Y-m-d'),
                    'time'      => $h->created_at->format('h:i A'),
                    'action_by' => $h->changedBy->name,
                    'role'      => $h->changedBy->role,
                ];
            });

        return response()->json([
            'project' => [
                'id'               => $project->id,
                'title'            => $project->title,
                'reference_no'     => $project->reference_no,
                'current_status'   => $project->status,
                'submitted_at'     => $project->proposal?->submitted_at?->format('Y-m-d'),
                'evaluation_score' => $project->average_score,
            ],
            'history' => $history,
        ]);
    }
}
