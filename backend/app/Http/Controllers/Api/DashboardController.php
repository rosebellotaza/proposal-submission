<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchProject;
use App\Models\Evaluation;
use App\Models\ProposalStatusHistory;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    // GET /api/dashboard/stats
    public function stats(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'researcher') {
            return $this->researcherStats($user);
        }

        if ($user->role === 'evaluator') {
            return $this->evaluatorStats($user);
        }

        return $this->adminStats();
    }

    private function researcherStats($user)
    {
        $projects = ResearchProject::where('created_by', $user->id)->get();

        $statusCounts = $projects->groupBy('status')->map->count();

        $recentActivity = ProposalStatusHistory::whereIn('research_project_id', $projects->pluck('id'))
            ->with(['researchProject', 'changedBy'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($h) {
                return [
                    'title'      => $h->status . ' — ' . $h->researchProject->title,
                    'by'         => $h->changedBy->name,
                    'date'       => $h->created_at->format('Y-m-d H:i'),
                    'project_id' => $h->researchProject->reference_no,
                ];
            });

        return response()->json([
            'my_projects'    => $projects->count(),
            'submitted'      => $statusCounts->get('Submitted', 0),
            'approved'       => $statusCounts->get('Approved', 0),
            'total_budget'   => $projects->sum('budget'),
            'status_counts'  => $statusCounts,
            'recent_activity'=> $recentActivity,
        ]);
    }

    private function evaluatorStats($user)
    {
        $assignedProjectIds = \DB::table('oral_presentation_evaluators')
            ->join('oral_presentations', 'oral_presentations.id', '=', 'oral_presentation_evaluators.oral_presentation_id')
            ->where('oral_presentation_evaluators.evaluator_id', $user->id)
            ->pluck('oral_presentations.research_project_id');

        $evaluatedIds = Evaluation::where('evaluator_id', $user->id)->pluck('research_project_id');
        $pendingCount = $assignedProjectIds->diff($evaluatedIds)->count();

        $evaluations  = Evaluation::where('evaluator_id', $user->id)->get();
        $avgScore     = $evaluations->avg('total_score');

        $allProjects  = ResearchProject::all();
        $statusCounts = $allProjects->groupBy('status')->map->count();

        return response()->json([
            'awaiting_evaluation' => $pendingCount,
            'evaluated'           => $evaluations->count(),
            'total_proposals'     => $allProjects->count(),
            'avg_score'           => round($avgScore ?? 0, 1),
            'status_counts'       => $statusCounts,
        ]);
    }

    private function adminStats()
    {
        $projects     = ResearchProject::all();
        $statusCounts = $projects->groupBy('status')->map->count();

        return response()->json([
            'total_projects' => $projects->count(),
            'status_counts'  => $statusCounts,
            'total_budget'   => $projects->sum('budget'),
        ]);
    }
}
