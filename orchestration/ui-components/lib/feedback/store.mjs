import { MAX_FEEDBACK_NOTES_PER_STAGE } from './constants.mjs';

export function appendFeedback(context, stage, value) {
  if (!value || !context.feedbackLoop?.[stage]) {
    return;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return;
  }

  const target = context.feedbackLoop[stage];
  if (target.includes(normalized)) {
    return;
  }
  target.push(normalized);
  if (target.length > MAX_FEEDBACK_NOTES_PER_STAGE) {
    target.splice(0, target.length - MAX_FEEDBACK_NOTES_PER_STAGE);
  }
}
