// @ts-nocheck
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultSiteContent } from '@/content/defaultSiteContent';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { cloneValue, setValueAtPath } from '@/lib/contentEditorUtils';
import {
  fetchDraftContent,
  publishDraftContent,
  saveDraftContent,
  uploadMedia,
} from '@/lib/siteContentApi';

const AdminPortalContext = createContext(null);

export function AdminPortalProvider({ children }) {
  const { refreshContent } = useSiteContent();
  const [draftContent, setDraftContent] = useState(() => cloneValue(defaultSiteContent));
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(defaultSiteContent));
  const [draftMetadata, setDraftMetadata] = useState(null);
  const [publishedMetadata, setPublishedMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingPath, setUploadingPath] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(draftContent) !== savedSnapshot,
    [draftContent, savedSnapshot],
  );

  const clearMessages = useCallback(() => {
    setError('');
    setNotice('');
  }, []);

  const loadDraft = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await fetchDraftContent();
      setDraftContent(cloneValue(result.content));
      setSavedSnapshot(JSON.stringify(result.content));
      setDraftMetadata(result.metadata);
      setPublishedMetadata(result.publishedMetadata || null);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load draft content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const updateDraft = useCallback((updater) => {
    clearMessages();
    setDraftContent((current) => {
      const nextValue = typeof updater === 'function' ? updater(current) : updater;
      return cloneValue(nextValue);
    });
  }, [clearMessages]);

  const updateValue = useCallback((path, nextValue) => {
    updateDraft((current) => setValueAtPath(current, path, nextValue));
  }, [updateDraft]);

  const applyPersistedDraft = useCallback((updater) => {
    clearMessages();

    setDraftContent((current) => {
      const nextValue = typeof updater === 'function' ? updater(current) : updater;
      return cloneValue(nextValue);
    });

    setSavedSnapshot((currentSnapshot) => {
      const currentValue = JSON.parse(currentSnapshot);
      const nextValue = typeof updater === 'function' ? updater(currentValue) : updater;
      return JSON.stringify(nextValue);
    });
  }, [clearMessages]);

  const applyPersistedValue = useCallback((path, nextValue) => {
    applyPersistedDraft((current) => setValueAtPath(current, path, nextValue));
  }, [applyPersistedDraft]);

  const replaceMediaAtPath = useCallback(async (path, file) => {
    const pathKey = path.join('.');
    setUploadingPath(pathKey);
    clearMessages();

    try {
      const mediaRef = await uploadMedia(file);
      updateDraft((current) => setValueAtPath(current, path, mediaRef));
      setNotice(`Uploaded ${file.name}.`);
    } catch (uploadError) {
      setError(uploadError.message || 'Unable to upload media.');
    } finally {
      setUploadingPath('');
    }
  }, [clearMessages, updateDraft]);

  const uploadFile = useCallback(async (file) => {
    clearMessages();

    try {
      return await uploadMedia(file);
    } catch (uploadError) {
      setError(uploadError.message || 'Unable to upload media.');
      throw uploadError;
    }
  }, [clearMessages]);

  const saveDraft = useCallback(async () => {
    setSaving(true);
    setError('');
    setNotice('');

    try {
      const result = await saveDraftContent(draftContent);
      setDraftContent(cloneValue(result.content));
      setSavedSnapshot(JSON.stringify(result.content));
      setDraftMetadata(result.draftMetadata);
      setPublishedMetadata(result.publishedMetadata || publishedMetadata);
      setNotice('Draft saved.');
      return result;
    } catch (saveError) {
      setError(saveError.message || 'Unable to save draft.');
      throw saveError;
    } finally {
      setSaving(false);
    }
  }, [draftContent, publishedMetadata]);

  const publishSite = useCallback(async () => {
    setPublishing(true);
    setError('');
    setNotice('');

    try {
      if (hasUnsavedChanges) {
        const saveResult = await saveDraftContent(draftContent);
        setDraftContent(cloneValue(saveResult.content));
        setSavedSnapshot(JSON.stringify(saveResult.content));
        setDraftMetadata(saveResult.draftMetadata);
      }

      const result = await publishDraftContent();
      setDraftContent(cloneValue(result.content));
      setSavedSnapshot(JSON.stringify(result.content));
      setDraftMetadata(result.draftMetadata);
      setPublishedMetadata(result.publishedMetadata);
      await refreshContent();
      setNotice('Published changes to the live website.');
      return result;
    } catch (publishError) {
      setError(publishError.message || 'Unable to publish the site.');
      throw publishError;
    } finally {
      setPublishing(false);
    }
  }, [draftContent, hasUnsavedChanges, refreshContent]);

  const reloadDraft = useCallback(async () => {
    setRefreshing(true);
    setError('');
    setNotice('');

    try {
      await loadDraft();
      setNotice('Draft reloaded from Supabase.');
    } finally {
      setRefreshing(false);
    }
  }, [loadDraft]);

  const value = useMemo(() => ({
    draftContent,
    draftMetadata,
    publishedMetadata,
    loading,
    saving,
    publishing,
    refreshing,
    uploadingPath,
    error,
    notice,
    hasUnsavedChanges,
    setError,
    setNotice,
    clearMessages,
    updateDraft,
    updateValue,
    applyPersistedDraft,
    applyPersistedValue,
    replaceMediaAtPath,
    uploadFile,
    saveDraft,
    publishSite,
    reloadDraft,
  }), [
    clearMessages,
    draftContent,
    draftMetadata,
    error,
    hasUnsavedChanges,
    loading,
    notice,
    publishSite,
    publishedMetadata,
    reloadDraft,
    saveDraft,
    saving,
    setError,
    setNotice,
    publishing,
    refreshing,
    applyPersistedDraft,
    applyPersistedValue,
    replaceMediaAtPath,
    uploadFile,
    updateDraft,
    updateValue,
    uploadingPath,
  ]);

  return (
    <AdminPortalContext.Provider value={value}>
      {children}
    </AdminPortalContext.Provider>
  );
}

export function useAdminPortal() {
  const context = useContext(AdminPortalContext);

  if (!context) {
    throw new Error('useAdminPortal must be used inside AdminPortalProvider.');
  }

  return context;
}
