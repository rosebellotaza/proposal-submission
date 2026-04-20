<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\ResearchProject;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    // GET /api/evaluations/pending
    // Returns proposals assigned to this evaluator that are not yet evaluated
    public function pending(Request $request)
    {
        $evaluatorId = $request->user()->id;

        // Get project IDs assigned to this evaluator via oral presentations
        $assignedProjectIds = \DB::table('oral_presentation_evaluators')
            ->join('oral_presentations', 'oral_presentations.id', '=', 'oral_presentation_evaluators.oral_presentation_id')
            ->where('oral_presentation_evaluators.evaluator_id', $evaluatorId)
            ->pluck('oral_presentations.research_project_id');

        // Exclude projects already evaluated by this evaluator
        $evaluatedProjectIds = Evaluation::where('evaluator_id', $evaluatorId)
            ->pluck('research_project_id');

        $pendingIds = $assignedProjectIds->diff($evaluatedProjectIds);

        $projects = ResearchProject::whereIn('id', $pendingIds)
            ->with(['departmentCenter', 'creator'])
            ->get()
            ->map(function ($p) {
                return [
                    'id'     => $p->id,
                    'title'  => $p->title,
                    'dept'   => $p->departmentCenter?->name ?? $p->creator->name,
                    'status' => $p->status,
                ];
            });

        return response()->json($projects);
    }

    // GET /api/evaluations/completed
    // Returns evaluations already submitted by this evaluator
    public function completed(Request $request)
    {
        $evaluations = Evaluation::where('evaluator_id', $request->user()->id)
            ->with('researchProject')
            ->latest()
            ->get()
            ->map(function ($e) {
                return [
                    'id'          => $e->id,
                    'project_id'  => $e->research_project_id,
                    'title'       => $e->researchProject->title,
                    'evaluator'   => $request->user()->name,
                    'date'        => $e->evaluated_at?->format('Y-m-d'),
                    'score'       => $e->total_score,
                    'remarks'     => $e->overall_remarks,

                    // Score breakdown
                    'presentation_score'         => $e->presentation_score,
                    'relevance_discipline_score' => $e->relevance_discipline_score,
                    'relevance_rde_score'        => $e->relevance_rde_score,
                    'potential_benefits_score'   => $e->potential_benefits_score,
                    'comments'                   => $e->comments,
                ];
            });

        return response()->json($evaluations);
    }

    // POST /api/evaluations
    // Submit an evaluation
    public function store(Request $request)
    {
        $data = $request->validate([
            'research_project_id'        => 'required|exists:research_projects,id',
            'presentation_score'         => 'required|numeric|min:0|max:40',
            'relevance_discipline_score' => 'required|numeric|min:0|max:20',
            'relevance_rde_score'        => 'required|numeric|min:0|max:30',
            'potential_benefits_score'   => 'required|numeric|min:0|max:10',
            'significance_to_department' => 'nullable|string',
            'units_to_be_credited'       => 'nullable|string',
            'significance_to_development'=> 'nullable|string',
            'comments'                   => 'nullable|string',
            'signature_image'            => 'nullable|string',
            'signature_type'             => 'nullable|in:draw,upload,type',
        ]);

        // Check if already evaluated
        $existing = Evaluation::where('research_project_id', $data['research_project_id'])
            ->where('evaluator_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already evaluated this proposal.'], 422);
        }

        $evaluation = Evaluation::create([
            ...$data,
            'evaluator_id' => $request->user()->id,
            'evaluated_at' => now(),
        ]);

        // Check if ALL assigned evaluators have submitted — if so, advance project status
        $project = ResearchProject::find($data['research_project_id']);
        $assignedEvaluatorIds = \DB::table('oral_presentation_evaluators')
            ->join('oral_presentations', 'oral_presentations.id', '=', 'oral_presentation_evaluators.oral_presentation_id')
            ->where('oral_presentations.research_project_id', $data['research_project_id'])
            ->pluck('oral_presentation_evaluators.evaluator_id');

        $submittedCount = Evaluation::where('research_project_id', $data['research_project_id'])
            ->whereIn('evaluator_id', $assignedEvaluatorIds)
            ->count();

        if ($submittedCount >= $assignedEvaluatorIds->count()) {
            $project->update(['status' => 'Evaluated']);
        }

        return response()->json($evaluation, 201);
    }

    // GET /api/evaluations/{id}
    public function show($id)
    {
        $evaluation = Evaluation::with(['researchProject', 'evaluator'])->findOrFail($id);
        return response()->json($evaluation);
    }
}
