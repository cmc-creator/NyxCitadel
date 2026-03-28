import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildActionAuditChanges,
  buildActionPreview,
  canRunSentryDraftAction,
  normalizeDraftActionRequest,
} from './sentry-actions';

test('canRunSentryDraftAction enforces role policy', () => {
  assert.equal(canRunSentryDraftAction('ADMIN'), true);
  assert.equal(canRunSentryDraftAction('COMPLIANCE_OFFICER'), true);
  assert.equal(canRunSentryDraftAction('STAFF'), false);
  assert.equal(canRunSentryDraftAction('READ_ONLY'), false);
  assert.equal(canRunSentryDraftAction(undefined), false);
});

test('normalizeDraftActionRequest accepts supported action and sanitizes payload', () => {
  const action = normalizeDraftActionRequest({
    type: 'CREATE_CAP_DRAFT',
    payload: {
      title: 'CAP draft',
      priority: 'HIGH',
      count: 2,
      dangerous: { nested: true },
    },
  });

  assert.ok(action);
  assert.equal(action?.type, 'CREATE_CAP_DRAFT');
  assert.deepEqual(action?.payload, {
    title: 'CAP draft',
    priority: 'HIGH',
    count: 2,
  });
});

test('normalizeDraftActionRequest rejects invalid action type', () => {
  const action = normalizeDraftActionRequest({
    type: 'DELETE_EVERYTHING',
    payload: { title: 'Bad' },
  });

  assert.equal(action, null);
});

test('buildActionPreview returns readable confirmation summary', () => {
  const preview = buildActionPreview({
    type: 'CREATE_CALENDAR_DRAFT',
    payload: {
      title: 'Drill follow-up',
      category: 'EM_DRILL',
      dueDate: '2026-05-01T00:00:00.000Z',
    },
  });

  assert.ok(preview.length >= 3);
  assert.equal(preview[0]?.label, 'Title');
  assert.equal(preview[0]?.value, 'Drill follow-up');
});

test('buildActionAuditChanges captures action metadata', () => {
  const action = {
    type: 'CREATE_INCIDENT_DRAFT' as const,
    payload: { incidentType: 'OTHER', severity: 'MODERATE' },
  };

  assert.deepEqual(buildActionAuditChanges(action), {
    assistant: 'Sentry',
    source: 'chat-confirmed',
    actionType: 'CREATE_INCIDENT_DRAFT',
    payload: { incidentType: 'OTHER', severity: 'MODERATE' },
  });
});
