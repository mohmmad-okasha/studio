'use server';

/**
 * @fileOverview A parking fee calculation AI agent.
 *
 * - calculateParkingFee - A function that calculates the parking fee based on duration and pricing rules.
 * - CalculateParkingFeeInput - The input type for the calculateParkingFee function.
 * - CalculateParkingFeeOutput - The return type for the calculateParkingFee function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateParkingFeeInputSchema = z.object({
  durationHours: z
    .number()
    .describe('The duration of parking in hours.'),
  pricingRules: z
    .string()
    .describe(
      'A description of the pricing rules. e.g. 1 hour = $5, 2 hours = $8, more than 2 hours = $10'
    ),
  manualAdjustment: z
    .number()
    .optional()
    .describe('A manual adjustment to the calculated fee.'),
});
export type CalculateParkingFeeInput = z.infer<
  typeof CalculateParkingFeeInputSchema
>;

const CalculateParkingFeeOutputSchema = z.object({
  calculatedFee: z.number().describe('The calculated parking fee.'),
  explanation: z
    .string()
    .describe('Explanation of how the fee was calculated.'),
});
export type CalculateParkingFeeOutput = z.infer<
  typeof CalculateParkingFeeOutputSchema
>;

export async function calculateParkingFee(
  input: CalculateParkingFeeInput
): Promise<CalculateParkingFeeOutput> {
  return calculateParkingFeeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateParkingFeePrompt',
  input: {schema: CalculateParkingFeeInputSchema},
  output: {schema: CalculateParkingFeeOutputSchema},
  prompt: `You are a parking fee calculator. You will be given the duration of parking in hours and the pricing rules.

  You will calculate the parking fee based on the pricing rules and duration. If a manual adjustment is provided, adjust the calculated fee accordingly. Provide a brief explanation of the calculation.

  Duration: {{{durationHours}}} hours
  Pricing Rules: {{{pricingRules}}}

  {{#if manualAdjustment}}
  Manual Adjustment: {{{manualAdjustment}}}
  {{/if}}`,
});

const calculateParkingFeeFlow = ai.defineFlow(
  {
    name: 'calculateParkingFeeFlow',
    inputSchema: CalculateParkingFeeInputSchema,
    outputSchema: CalculateParkingFeeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
