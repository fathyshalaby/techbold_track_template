import { z } from 'zod';

export const DiagnosticProposalSchema = z.object({
  hypotheses: z
    .array(
      z.object({
        cause: z.string(),
        evidence: z.string(),
        confidence: z.number().min(0).max(1),
      }),
    )
    .min(1),
  command: z.string(),
  purpose: z.string(),
  expectedSignal: z.string(),
  riskNotes: z.string(),
  isReadOnly: z.boolean(),
});

export const FixProposalSchema = z.object({
  rootCause: z.string(),
  command: z.string(),
  rationale: z.string(),
  rollbackCommand: z.string(),
  isReversible: z.boolean(),
  persistenceNote: z.string(),
});

export const ValidationResultSchema = z
  .object({
    status: z.enum(['VERIFIED_FIXED', 'LIKELY_FIXED', 'NOT_FIXED']),
    benefitCheck: z.string(),
    persistenceCheck: z.string().nullable(),
    evidence: z.array(z.string()),
  })
  .superRefine((val, ctx) => {
    if (val.status === 'VERIFIED_FIXED' && val.persistenceCheck === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'VERIFIED_FIXED requires a non-null persistenceCheck',
        path: ['persistenceCheck'],
      });
    }
  });

export const ActivityDraftFieldsSchema = z.object({
  summary: z.string(),
  rootCause: z.string(),
  actionsTaken: z.string(),
  commandsSummary: z.string(),
  validationResult: z.string(),
});

export type DiagnosticProposal = z.infer<typeof DiagnosticProposalSchema>;
export type FixProposal = z.infer<typeof FixProposalSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type ActivityDraftFields = z.infer<typeof ActivityDraftFieldsSchema>;
