// Utility for managing multiple order drafts in localStorage
const DRAFTS_KEY = 'tradeflow_order_drafts';

export function getDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveDraft(formData, existingDraftId = null) {
  const drafts = getDrafts();
  const id = existingDraftId || `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const draft = {
    id,
    savedAt: new Date().toISOString(),
    product_name: formData.product_name || 'Unnamed Draft',
    supplier_name: formData.supplier_name || '',
    source_platform: formData.source_platform || 'Alibaba',
    fulfillment_type: formData.fulfillment_type || 'china_hub',
    form: formData,
  };
  const idx = drafts.findIndex(d => d.id === id);
  if (idx >= 0) {
    drafts[idx] = draft;
  } else {
    drafts.unshift(draft);
  }
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return id;
}

export function deleteDraft(draftId) {
  const drafts = getDrafts().filter(d => d.id !== draftId);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export function getDraftById(draftId) {
  return getDrafts().find(d => d.id === draftId) || null;
}