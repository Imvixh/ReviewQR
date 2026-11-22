export const QR_STUDIO_STEPS = ['branding', 'qrstyle', 'templates', 'copy'] as const;

export type QrStudioStep = (typeof QR_STUDIO_STEPS)[number];
export type QrStudioStepSignatures = Partial<Record<QrStudioStep, string>>;
export type CurrentQrStudioStepSignatures = Record<QrStudioStep, string>;

export function isQrStudioStepComplete(
  step: QrStudioStep,
  completed: QrStudioStepSignatures,
  current: CurrentQrStudioStepSignatures,
): boolean {
  return Boolean(completed[step]) && completed[step] === current[step];
}

export function canOpenQrStudioStep(
  target: QrStudioStep,
  completed: QrStudioStepSignatures,
  current: CurrentQrStudioStepSignatures,
): boolean {
  const targetIndex = QR_STUDIO_STEPS.indexOf(target);
  return QR_STUDIO_STEPS.slice(0, targetIndex).every((step) =>
    isQrStudioStepComplete(step, completed, current),
  );
}

export function isBrandingStepReady(input: {
  businessName: string;
  location: string;
  categoryValid: boolean;
  destinationValid: boolean;
  destinationConfirmed: boolean;
}): boolean {
  return Boolean(
    input.businessName.trim() &&
      input.location.trim() &&
      input.categoryValid &&
      input.destinationValid &&
      input.destinationConfirmed,
  );
}

export function isCopyStepReady(headline: string, callToAction: string): boolean {
  return Boolean(headline.trim() && callToAction.trim());
}
