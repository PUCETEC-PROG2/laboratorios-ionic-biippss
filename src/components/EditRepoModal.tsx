import React, { useEffect, useState } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonInput,
  IonTextarea,
  IonText,
  IonModal
} from '@ionic/react';
import { Repository } from '../interfaces/Repository';
import { RepositoryPayload } from '../interfaces/RepositoryPayload';
import LoadingSpinner from './LoadingSpinner';
import './EditRepoModal.css';

interface EditRepoModalProps {
  isOpen: boolean;
  repository: Repository | null;
  onCancel: () => void;
  onSave: (changes: Partial<RepositoryPayload>) => Promise<void>;
}

const EditRepoModal: React.FC<EditRepoModalProps> = ({ isOpen, repository, onCancel, onSave }) => {
  const [formData, setFormData] = useState<RepositoryPayload>({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (repository) {
      setFormData({
        name: repository.name,
        description: repository.description ?? ''
      });
      setErrorMsg('');
    }
  }, [repository]);

  const handleSave = async () => {
    if (!formData.name || formData.name.trim() === '') {
      setErrorMsg('El nombre del repositorio es obligatorio');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      await onSave(formData);
    } catch (error) {
      const apiError = error instanceof Error ? error.message : String(error);
      setErrorMsg(`Error al actualizar el repositorio: ${apiError}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onCancel}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Editar repositorio</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onCancel}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="edit-form-container">
          <IonInput
            className="form-field"
            label="Nombre del repositorio"
            labelPlacement="floating"
            placeholder="Ingrese el nombre del repositorio"
            value={formData.name}
            onIonChange={(e) => setFormData({ ...formData, name: e.detail.value ?? '' })}
          />
          <IonTextarea
            className="form-field"
            label="Descripción del repositorio"
            labelPlacement="floating"
            placeholder="Ingrese la descripción del repositorio"
            value={formData.description}
            onIonChange={(e) => setFormData({ ...formData, description: e.detail.value ?? '' })}
            rows={6}
          />
          {errorMsg !== '' && (
            <IonText color="danger">
              <p>{errorMsg}</p>
            </IonText>
          )}
          <IonButton
            className="form-field"
            expand="block"
            color="dark"
            shape="round"
            onClick={handleSave}
            disabled={saving}
          >
            Guardar cambios
          </IonButton>
        </div>
        {saving && <LoadingSpinner />}
      </IonContent>
    </IonModal>
  );
};

export default EditRepoModal;
