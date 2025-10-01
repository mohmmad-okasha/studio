'use server';

/**
 * @fileOverview Implements a flow to recognize license plates from images using OCR.
 *
 * - `recognizeLicensePlate`: Recognizes a license plate from an image data URI.
 * - `LicensePlateRecognitionInput`: Input type for the `recognizeLicensePlate` function.
 * - `LicensePlateRecognitionOutput`: Output type for the `recognizeLicensePlate` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LicensePlateRecognitionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo containing a license plate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type LicensePlateRecognitionInput = z.infer<typeof LicensePlateRecognitionInputSchema>;

const LicensePlateRecognitionOutputSchema = z.object({
  licensePlate: z.string().describe('The recognized license plate number.'),
});
export type LicensePlateRecognitionOutput = z.infer<typeof LicensePlateRecognitionOutputSchema>;

export async function recognizeLicensePlate(
  input: LicensePlateRecognitionInput
): Promise<LicensePlateRecognitionOutput> {
  return licensePlateRecognitionFlow(input);
}

const licensePlateRecognitionPrompt = ai.definePrompt({
  name: 'licensePlateRecognitionPrompt',
  input: {schema: LicensePlateRecognitionInputSchema},
  output: {schema: LicensePlateRecognitionOutputSchema},
  prompt: `You are an Optical Character Recognition (OCR) expert specializing in identifying license plates from images.

  Given the following image, extract the license plate number.

  Image: {{media url=photoDataUri}}
  
  Return only the license plate number.
  `,
});

const licensePlateRecognitionFlow = ai.defineFlow(
  {
    name: 'licensePlateRecognitionFlow',
    inputSchema: LicensePlateRecognitionInputSchema,
    outputSchema: LicensePlateRecognitionOutputSchema,
  },
  async input => {
    const {output} = await licensePlateRecognitionPrompt(input);
    return output!;
  }
);
