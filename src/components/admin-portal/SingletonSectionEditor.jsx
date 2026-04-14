// @ts-nocheck
import RecursiveContentEditor from '@/components/admin/RecursiveContentEditor';
import EditorSection from '@/components/admin-portal/EditorSection';
import { useAdminPortal } from '@/contexts/AdminPortalContext';
import { defaultSiteContent } from '@/content/defaultSiteContent';
import {
  addArrayItemAtPath,
  getValueAtPath,
  moveArrayItemAtPath,
  removeArrayItemAtPath,
} from '@/lib/contentEditorUtils';

export default function SingletonSectionEditor({ title, description, path }) {
  const admin = useAdminPortal();
  const value = getValueAtPath(admin.draftContent, path);
  const templateValue = getValueAtPath(defaultSiteContent, path);

  if (value === undefined) {
    return null;
  }

  return (
    <EditorSection title={title} description={description}>
      <RecursiveContentEditor
        label={title}
        value={value}
        path={path}
        templateValue={templateValue}
        onChangeValue={admin.updateValue}
        onAddArrayItem={(targetPath, item) => admin.updateDraft((current) => addArrayItemAtPath(current, targetPath, item))}
        onRemoveArrayItem={(targetPath, index) => admin.updateDraft((current) => removeArrayItemAtPath(current, targetPath, index))}
        onMoveArrayItem={(targetPath, fromIndex, toIndex) => {
          if (toIndex < 0) {
            return;
          }

          admin.updateDraft((current) => moveArrayItemAtPath(current, targetPath, fromIndex, toIndex));
        }}
        onUploadMedia={admin.replaceMediaAtPath}
        uploadingPath={admin.uploadingPath}
      />
    </EditorSection>
  );
}
