import { z } from 'zod';

export const requestUploadSignatureSchema = z.object({
  fileName: z.string().min(1, 'File name is required').trim(),
  fileSize: z
    .number()
    .positive('File size must be positive')
    .max(10 * 1024 * 1024, 'Maximum file upload size is 10MB'),
  mimeType: z
    .string()
    .refine(
      mime =>
        [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/zip',
          'text/plain',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ].includes(mime),
      {
        message: 'Invalid file type. Only standard images, PDFs, Word docs, text, and zip files are supported.',
      }
    ),
});

export const completeAttachmentUploadSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string(),
  cloudinaryPublicId: z.string().min(1),
  secureUrl: z.string().url('Secure URL must be a valid HTTPS URL'),
});

export type RequestUploadSignatureInput = z.infer<typeof requestUploadSignatureSchema>;
export type CompleteAttachmentUploadInput = z.infer<typeof completeAttachmentUploadSchema>;
