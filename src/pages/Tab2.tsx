import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonHeader, IonInput, IonPage, IonTextarea, IonTitle, IonToolbar, IonText } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { RepositoryPayload } from '../interfaces/RepositoryPayload';
import { Repository } from '../interfaces/Repository';
import './Tab2.css';
import { createRepository, updateRepository } from '../services/GitHubService';
import LoadingSpinner from '../components/LoadingSpinner';

interface LocationState {
  editRepo?: Repository;
}

const Tab2: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();

  // Si venimos desde el botón "editar" de Tab1, aquí llega el repo a editar
  const editRepo = location.state?.editRepo ?? null;
  const isEditMode = editRepo !== null;

  const [repositoryData, setRepositoryData] = useState<RepositoryPayload>({
    name: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Precarga el formulario cuando entramos en modo edición
  useEffect(() => {
    if (editRepo) {
      setRepositoryData({
        name: editRepo.name,
        description: editRepo.description ?? ""
      });
    } else {
      setRepositoryData({ name: "", description: "" });
    }
  }, [editRepo]);

  const saveRepo = async () => {
    if (!repositoryData.name || repositoryData.name.trim() === '') {
      setErrorMsg("El nombre del repositorio es obligatorio");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    const request = isEditMode && editRepo
      ? updateRepository(editRepo.owner.login, editRepo.name, repositoryData)
      : createRepository(repositoryData);

    request
      .then(() => {
        setRepositoryData({ name: "", description: "" });
        history.push("/tab1");
      })
      .catch((error) => {
        const apiError = error instanceof Error ? error.message : String(error);
        const action = isEditMode ? "actualizar" : "crear";
        setErrorMsg(`Error al ${action} el repositorio: ${apiError}`);
      })
      .finally(() => setLoading(false));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isEditMode ? 'Actualizar repositorio' : 'Formulario del repositorio'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{isEditMode ? 'Actualizar Repositorio' : 'Formulario de Repositorio'}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="form-container">
          <IonInput
            className="form-field"
            label="Nombre del repositorio"
            labelPlacement="floating"
            placeholder="Ingrese el nombre del repositorio"
            value={repositoryData.name}
            onIonInput={(e) => setRepositoryData((prev) => ({ ...prev, name: (e.target as HTMLIonInputElement).value?.toString() ?? "" }))}
          />
          <IonTextarea
            className='form-field'
            label='Descripción del repositorio'
            labelPlacement='floating'
            placeholder='Ingrese la descripción del repositorio'
            value={repositoryData.description}
            onIonInput={(e) => setRepositoryData((prev) => ({ ...prev, description: (e.target as HTMLIonTextareaElement).value?.toString() ?? "" }))}
            rows={6}
          />
          {errorMsg !== "" && <IonText color="danger"><p>{errorMsg}</p></IonText>}
          <IonButton
            className='form-field'
            expand='block'
            color="dark"
            shape="round"
            onClick={saveRepo}
          >
            {isEditMode ? 'Actualizar repositorio' : 'Guardar'}
          </IonButton>
        </div>
        {loading && <LoadingSpinner />}
      </IonContent>
    </IonPage>
  );
};

export default Tab2;